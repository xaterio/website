// dotenv doit être chargé avant tout import qui utilise process.env
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateWebsite } from "../lib/claude";

const ORDER_ID = process.argv[2];
if (!ORDER_ID) { console.error("Usage: npx tsx scripts/regen-order.ts <orderId>"); process.exit(1); }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: order } = await supabase.from("orders").select("*").eq("id", ORDER_ID).single();
  if (!order) { console.error("Order not found"); process.exit(1); }

  const info = (order.info as Record<string, string>) || {};
  console.log(`Regenerating: ${order.business_name} | Type: ${order.business_type} | Style: ${info.styleLabel}`);

  await supabase.from("orders").update({ status: "generating" }).eq("id", ORDER_ID);

  const siteHtml = await generateWebsite({
    businessName: order.business_name,
    businessType: order.business_type,
    businessTypeLabel: info.businessTypeLabel || order.business_type,
    style: order.style,
    styleLabel: info.styleLabel || order.style,
    pages: order.pages || [],
    description: info.description || "",
    slogan: info.slogan || "",
    address: info.address || "",
    phone: info.phone || "",
    email: info.contactEmail || "",
    menuText: info.menuText || "",
  });

  await supabase.from("orders").update({ status: "delivered", site_html: siteHtml }).eq("id", ORDER_ID);

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const siteUrl = `https://website-three-zeta-38.vercel.app/sites/${ORDER_ID}`;
  await resend.emails.send({
    from: "Alexandre <onboarding@resend.dev>",
    to: order.email,
    subject: `🎉 Votre site "${order.business_name}" est prêt !`,
    html: `<p>Votre site est prêt : <a href="${siteUrl}">${siteUrl}</a></p>`,
  });

  console.log(`✅ Done! https://website-three-zeta-38.vercel.app/sites/${ORDER_ID}`);
}

main().catch(e => { console.error(e); process.exit(1); });
