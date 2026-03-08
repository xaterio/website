import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateWebsite } from "@/lib/claude";
import { sendDeliveryEmail } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { orderId, secret } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await supabase.from("orders").update({ status: "generating" }).eq("id", orderId);

  try {
    const info = (order.info as Record<string, string>) || {};

    const siteHtml = await generateWebsite({
      businessName: order.business_name || "",
      businessType: order.business_type as never,
      businessTypeLabel: info.businessTypeLabel || order.business_type || "",
      style: order.style as never,
      styleLabel: info.styleLabel || order.style || "",
      pages: (order.pages as string[]) as never || [],
      description: info.description || "",
      slogan: info.slogan || "",
      address: info.address || "",
      phone: info.phone || "",
      email: info.contactEmail || "",
      photosUrls: (order.photos_urls as string[]) || [],
    });

    await supabase
      .from("orders")
      .update({ status: "delivered", site_html: siteHtml })
      .eq("id", orderId);

    await sendDeliveryEmail({
      to: order.email,
      clientName: order.client_name || "Client",
      businessName: order.business_name || "Votre entreprise",
      siteHtml,
      orderId,
    });

    return NextResponse.json({ success: true, message: "Site généré et email envoyé !" });
  } catch (err) {
    await supabase.from("orders").update({ status: "error" }).eq("id", orderId);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
