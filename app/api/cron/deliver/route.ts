import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendDeliveryEmail } from "@/lib/resend";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authHeader = new Headers(req.headers).get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "generated")
    .lt("created_at", twoHoursAgo);

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  if (!orders || orders.length === 0) return NextResponse.json({ delivered: 0 });

  let delivered = 0;
  for (const order of orders) {
    try {
      await sendDeliveryEmail({
        to: order.email,
        clientName: order.client_name || "Client",
        businessName: order.business_name || "Votre entreprise",
        siteHtml: order.site_html,
        orderId: order.id,
      });
      await supabase.from("orders").update({ status: "delivered" }).eq("id", order.id);
      delivered++;
    } catch (err) {
      console.error(`Erreur livraison ${order.id}:`, err);
    }
  }

  return NextResponse.json({ delivered });
}
