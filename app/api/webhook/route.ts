import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateWebsite } from "@/lib/claude";
import { sendDeliveryEmail } from "@/lib/resend";
import Stripe from "stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!, 600);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "No orderId in metadata" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status to paid
    await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);

    // Use waitUntil to keep the function alive during async generation
    waitUntil(generateSiteAndDeliver(orderId, order, supabase));
  }

  return NextResponse.json({ received: true });
}

async function generateSiteAndDeliver(
  orderId: string,
  order: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    // Update status to generating
    await supabase.from("orders").update({ status: "generating" }).eq("id", orderId);

    const info = (order.info as Record<string, string>) || {};

    // Generate the website with Claude
    const siteHtml = await generateWebsite({
      businessName: (order.business_name as string) || "",
      businessType: (order.business_type as string) as never,
      businessTypeLabel: info.businessTypeLabel || (order.business_type as string) || "",
      style: (order.style as string) as never,
      styleLabel: info.styleLabel || (order.style as string) || "",
      pages: (order.pages as string[]) as never || [],
      description: info.description || "",
      slogan: info.slogan || "",
      address: info.address || "",
      phone: info.phone || "",
      email: info.contactEmail || "",
      menuText: info.menuText || "",
      testimonials: info.testimonials ? JSON.parse(info.testimonials) : undefined,
      customWants: info.customWants || "",
      customDontWants: info.customDontWants || "",
      freeDescription: info.freeDescription || "",
    });

    // Save generated HTML to DB
    await supabase
      .from("orders")
      .update({ status: "delivered", site_html: siteHtml })
      .eq("id", orderId);

    // Send delivery email
    await sendDeliveryEmail({
      to: order.email as string,
      clientName: (order.client_name as string) || "Client",
      businessName: (order.business_name as string) || "Votre entreprise",
      siteHtml,
      orderId,
    });

    console.log(`✅ Site generated and delivered for order ${orderId}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message + "\n" + err.stack : String(err);
    console.error(`❌ Error generating site for order ${orderId}:`, errMsg);
    await supabase.from("orders").update({
      status: "error",
      info: { ...((order.info as object) || {}), _error: errMsg.slice(0, 500) }
    }).eq("id", orderId);
  }
}
