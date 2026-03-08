import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateWebsite } from "@/lib/claude";
import { sendDeliveryEmail } from "@/lib/resend";

// Same settings as webhook to test the exact same code path
export const runtime = "nodejs";
export const maxDuration = 60;

const TEST_ORDER = {
  businessName: "Le Comptoir Test",
  businessType: "restaurant",
  businessTypeLabel: "Restaurant / Café",
  style: "moderne",
  styleLabel: "Moderne & Tech",
  pages: ["accueil", "menu", "contact"],
  description: "Un restaurant test pour vérifier que la génération fonctionne correctement.",
  slogan: "La qualité avant tout",
  address: "1 Rue de la Paix, Paris",
  phone: "01 23 45 67 89",
  email: "contact@lecomptoirtest.fr",
  menuText: "Entrées : Salade César 12€, Soupe du jour 8€\nPlats : Steak frites 18€, Saumon grillé 22€\nDesserts : Tiramisu 7€, Fondant 8€",
  testimonials: [
    { name: "Marie", city: "Paris", text: "Excellent restaurant, je recommande vivement !" },
    { name: "Pierre", city: "Lyon", text: "Cuisine délicieuse et service impeccable." },
    { name: "Sophie", city: "Bordeaux", text: "Un moment inoubliable, on reviendra !" },
  ],
  customWants: "",
  customDontWants: "",
  freeDescription: "Site moderne et épuré, mettre le menu en avant.",
};

export async function POST(req: NextRequest) {
  const { secret, sendEmail } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Insert a test order
  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      email: "alexandre.ammi38@gmail.com",
      client_name: "Test Dev",
      business_name: TEST_ORDER.businessName,
      business_type: TEST_ORDER.businessType,
      style: TEST_ORDER.style,
      pages: TEST_ORDER.pages,
      status: "generating",
      info: {
        businessTypeLabel: TEST_ORDER.businessTypeLabel,
        styleLabel: TEST_ORDER.styleLabel,
        description: TEST_ORDER.description,
        slogan: TEST_ORDER.slogan,
        address: TEST_ORDER.address,
        phone: TEST_ORDER.phone,
        contactEmail: TEST_ORDER.email,
        menuText: TEST_ORDER.menuText,
        testimonials: JSON.stringify(TEST_ORDER.testimonials),
        customWants: TEST_ORDER.customWants,
        customDontWants: TEST_ORDER.customDontWants,
        freeDescription: TEST_ORDER.freeDescription,
      },
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json({ error: "Failed to create test order", details: insertError }, { status: 500 });
  }

  try {
    const siteHtml = await generateWebsite(TEST_ORDER as never);

    await supabase
      .from("orders")
      .update({ status: "delivered", site_html: siteHtml })
      .eq("id", order.id);

    if (sendEmail) {
      await sendDeliveryEmail({
        to: order.email,
        clientName: order.client_name || "Client",
        businessName: order.business_name || "Test",
        siteHtml,
        orderId: order.id,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      previewUrl: `/sites/${order.id}`,
      message: "Site généré avec succès !",
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message + "\n" + err.stack : String(err);
    await supabase.from("orders").update({
      status: "error",
      info: { ...(order.info as object), _error: errMsg.slice(0, 500) },
    }).eq("id", order.id);

    return NextResponse.json({ error: errMsg, orderId: order.id }, { status: 500 });
  }
}
