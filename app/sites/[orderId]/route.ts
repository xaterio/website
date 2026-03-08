import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("site_html, business_name, status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return new NextResponse("Site introuvable", { status: 404 });
  }

  if (order.status === "generating" || order.status === "paid") {
    return new NextResponse(
      `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="10"><title>Génération en cours...</title><style>body{margin:0;min-height:100vh;background:#050508;display:flex;align-items:center;justify-content:center;font-family:-apple-system,sans-serif;color:white}.spinner{width:64px;height:64px;border:4px solid rgba(124,58,237,0.3);border-top-color:#7c3aed;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:24px;margin:0 0 8px;text-align:center}p{color:#6b7280;text-align:center}</style></head><body><div><div class="spinner"></div><h1>Votre site est en cours de génération...</h1><p>Cette page se rafraîchit automatiquement.</p></div></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!order.site_html) {
    return new NextResponse("Site non disponible", { status: 404 });
  }

  return new NextResponse(order.site_html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
