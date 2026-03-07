import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Vérifier que la commande appartient à cet email
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, stripe_session_id, status, email")
      .eq("id", orderId)
      .eq("email", email.toLowerCase().trim())
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.status === "refunded") {
      return NextResponse.json({ error: "Cette commande a déjà été remboursée" }, { status: 400 });
    }

    if (!order.stripe_session_id) {
      return NextResponse.json({ error: "Session Stripe introuvable" }, { status: 400 });
    }

    // Récupérer le payment_intent depuis la session Stripe
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);

    if (!session.payment_intent) {
      return NextResponse.json({ error: "Paiement introuvable sur Stripe" }, { status: 400 });
    }

    // Émettre le remboursement
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent as string,
    });

    if (refund.status !== "succeeded" && refund.status !== "pending") {
      return NextResponse.json({ error: "Remboursement échoué : " + refund.status }, { status: 500 });
    }

    // Mettre à jour le statut en base
    await supabase
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", orderId);

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
