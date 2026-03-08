import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE, CURRENCY } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { OrderData } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: OrderData = await req.json();
    const {
      clientEmail,
      clientName,
      businessName,
      businessType,
      businessTypeLabel,
      style,
      styleLabel,
      pages,
      description,
      slogan,
      address,
      phone,
      email,
      menuText = "",
      testimonials,
      customWants,
      customDontWants,
      freeDescription,
    } = body;

    if (!clientEmail || !clientName) {
      return NextResponse.json({ error: "Email et prénom requis" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create order in DB
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        email: clientEmail,
        client_name: clientName,
        business_name: businessName,
        business_type: businessType,
        style,
        pages,
        info: {
          businessTypeLabel,
          styleLabel,
          description,
          slogan,
          address,
          phone,
          contactEmail: email,
          menuText,
          testimonials: testimonials ? JSON.stringify(testimonials) : "",
          customWants: customWants || "",
          customDontWants: customDontWants || "",
          freeDescription: freeDescription || "",
        },
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "DB: " + dbError.message }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: clientEmail,
      metadata: {
        orderId: order.id,
        clientName,
        businessName: businessName || "",
      },
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            unit_amount: PRICE,
            product_data: {
              name: `Site web professionnel — ${businessName || "Mon Entreprise"}`,
              description: `Design ${styleLabel || "moderne"} · ${(pages || []).length} pages · Livraison 48h`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `https://website-three-zeta-38.vercel.app/commander/succes?email=${encodeURIComponent(clientEmail)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://website-three-zeta-38.vercel.app/commander`,
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Stripe: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
