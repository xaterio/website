import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendDeliveryEmail } from "@/lib/resend";

async function callClaudeRaw(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  return data.content[0].text;
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { orderId, email, request } = await req.json();

    if (!orderId || !email || !request) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Vérifier que la commande appartient bien à cet email
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("email", email.toLowerCase().trim())
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (!order.site_html) {
      return NextResponse.json({ error: "Le site n'est pas encore généré" }, { status: 400 });
    }

    // Marquer comme en cours de révision
    await supabase.from("orders").update({ status: "generating" }).eq("id", orderId);

    // Révision synchrone (Vercel tue les background functions sur Hobby)
    await reviseSiteAndDeliver(orderId, order, request, supabase);

    return NextResponse.json({ success: true, message: "Révision en cours, vous recevrez un email dans quelques minutes." });
  } catch (err) {
    console.error("Revise-site error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function reviseSiteAndDeliver(
  orderId: string,
  order: Record<string, unknown>,
  revisionRequest: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    const currentHtml = order.site_html as string;
    const businessName = (order.business_name as string) || "Votre entreprise";
    const clientName = (order.client_name as string) || "Client";

    const prompt = `Tu es un expert développeur web. Voici le code HTML complet d'un site web existant.

Le client demande la modification suivante :
"${revisionRequest}"

Voici le code HTML actuel du site :
${currentHtml}

Effectue UNIQUEMENT la modification demandée par le client, sans changer le reste du site.
Conserve tout le design, les couleurs, les animations et la structure existante.
Réponds UNIQUEMENT avec le code HTML complet modifié, sans aucune explication ni markdown.`;

    let newHtml = await callClaudeRaw(prompt, 6000);
    if (newHtml.startsWith("```html")) newHtml = newHtml.slice(7);
    if (newHtml.startsWith("```")) newHtml = newHtml.slice(3);
    if (newHtml.endsWith("```")) newHtml = newHtml.slice(0, -3);
    newHtml = newHtml.trim();

    // Sauvegarder le nouveau HTML
    await supabase
      .from("orders")
      .update({ status: "delivered", site_html: newHtml })
      .eq("id", orderId);

    // Envoyer l'email de livraison
    await sendDeliveryEmail({
      to: order.email as string,
      clientName,
      businessName,
      siteHtml: newHtml,
      orderId,
    });

    console.log(`✅ Site révisé et livré pour commande ${orderId}`);
  } catch (err) {
    console.error(`❌ Erreur révision site ${orderId}:`, err);
    await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
  }
}
