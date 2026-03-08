import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { getTheme } from "../lib/templates/themes";
import { buildRestaurantHtml, RestaurantContent } from "../lib/templates/restaurant-template";

const ORDER_ID = "159d29a7-2a8b-4813-bd72-bc2004176e92";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

async function main() {
  const { data: order } = await supabase.from("orders").select("*").eq("id", ORDER_ID).single();
  const info = (order!.info as Record<string, string>) || {};
  const businessName = order!.business_name as string;
  const styleLabel = info.styleLabel || "Minimaliste & Clean";
  console.log(`Regenerating: ${businessName} | Style: ${styleLabel}`);

  await supabase.from("orders").update({ status: "generating" }).eq("id", ORDER_ID);

  const theme = getTheme(styleLabel);

  const prompt = `Tu es un expert en copywriting pour restaurants.
Génère uniquement un objet JSON valide pour ce restaurant :
Nom: ${businessName}
Description: ${info.description || "Restaurant italien"}
Adresse: ${info.address || "3304 Route Nationale 85"}
Téléphone: ${info.phone || "07 62 67 36 66"}
Email: ${info.contactEmail || "contact@lapizzadupapa.fr"}
Menu: Pizzas, pâtes fraîches, antipasti, desserts italiens

JSON :
{"heroTag":"Restaurant · Depuis 2014","heroTitle1":"L'Italie","heroTitle2":"dans votre assiette.","heroSub":"Pizzas au feu de bois, pâtes fraîches maison et saveurs authentiques au cœur de votre ville.","heroCta1":"Voir le menu","heroCta2":"Réserver une table","imgHero1":"pizza","imgHero2":"pasta","imgHero3":"tiramisu","imgAbout":"chef","stat1Num":"10+","stat1Label":"Années d'expérience","stat2Num":"40+","stat2Label":"Plats à la carte","stat3Num":"4.8","stat3Label":"Note Google","aboutTag":"Notre histoire","aboutTitle":"La passion italienne, depuis toujours","aboutP1":"Né d'une passion familiale pour la cuisine italienne authentique, La Pizza du Papa propose des recettes transmises de génération en génération, préparées chaque jour avec des ingrédients frais sélectionnés directement en Italie.","aboutP2":"Nous sélectionnons nos tomates en Campanie, notre burrata en Puglia et notre farine chez les meilleurs moulins italiens. Chaque plat est une déclaration d'amour à l'Italie.","aboutCta":"Nous contacter","menuTitle":"Notre carte","menuSub":"Des plats préparés avec passion, chaque jour","menuItems":[{"category":"Antipasti","name":"Bruschetta al Pomodoro","desc":"Pain grillé, tomates fraîches, basilic et huile d'olive extra vierge","price":"7€"},{"category":"Antipasti","name":"Burrata Pugliese","desc":"Burrata crémeuse, tomates cerises rôties, pesto de basilic","price":"12€"},{"category":"Antipasti","name":"Carpaccio di Manzo","desc":"Fines tranches de bœuf, roquette, copeaux de parmesan et citron","price":"13€"},{"category":"Pizzas","name":"Margherita","desc":"Sauce tomate San Marzano, mozzarella fior di latte, basilic frais","price":"11€"},{"category":"Pizzas","name":"Diavola","desc":"Sauce tomate, mozzarella, salami piquant, poivrons grillés","price":"13€"},{"category":"Pizzas","name":"Tartufo","desc":"Crème de truffe noire, mozzarella, champignons, parmesan 24 mois","price":"18€"},{"category":"Pâtes","name":"Spaghetti Carbonara","desc":"Recette romaine authentique : œufs, guanciale, pecorino, poivre noir","price":"14€"},{"category":"Pâtes","name":"Tagliatelle al Ragù","desc":"Ragù de bœuf mijoté 6 heures, tagliatelles fraîches maison","price":"15€"},{"category":"Desserts","name":"Tiramisu Maison","desc":"Recette de la nonna : mascarpone, café espresso, biscuits savoiardi","price":"7€"},{"category":"Desserts","name":"Panna Cotta","desc":"Crème vanille de Madagascar, coulis de fruits rouges frais","price":"6€"}],"testiTitle":"Ce que disent nos clients","testi1Text":"Une cuisine italienne authentique comme en Italie. Les pizzas sont cuites au feu de bois, une croûte absolument parfaite. Nous y revenons chaque semaine !","testi1Name":"Marie L.","testi1City":"Grenoble","testi2Text":"Le meilleur tiramisu que j'ai mangé en dehors de Rome. L'accueil est chaleureux et les portions généreuses. Je recommande la carbonara !","testi2Name":"Thomas R.","testi2City":"Grenoble","testi3Text":"Cadre intime, service attentionné et pâtes fraîches à tomber. La burrata est d'une fraîcheur incroyable. Notre adresse italienne préférée.","testi3Name":"Sophie M.","testi3City":"Échirolles","contactTitle":"Venez nous rendre visite","address":"3304 Route Nationale 85, Grenoble","phone":"07 62 67 36 66","email":"alexandre.ammi38@gmail.com","hours":[{"day":"Lundi","time":"Fermé"},{"day":"Mardi – Vendredi","time":"12h–14h30, 19h–22h"},{"day":"Samedi","time":"12h–15h, 19h–23h"},{"day":"Dimanche","time":"12h–15h"}],"formPlaceholder":"Votre message, demande de réservation pour un événement...","formCta":"Envoyer","navCta":"Réserver","metaDesc":"La Pizza du Papa — Restaurant italien authentique à Grenoble. Pizzas au feu de bois, pâtes fraîches et tiramisu maison.","year":"2026"}

Améliore ce JSON (textes plus percutants). IMPORTANT: pour imgHero1, imgHero2, imgHero3, imgAbout, utilise UN SEUL mot anglais simple (ex: pizza, pasta, tiramisu, chef, kitchen) — pas de tirets ni de mots composés. Réponds UNIQUEMENT avec le JSON valide.`;

  console.log("Calling Claude...");
  const msg = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 3000, messages: [{ role: "user", content: prompt }] });
  let jsonStr = (msg.content[0] as { text: string }).text.trim();
  if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const content: RestaurantContent = JSON.parse(jsonStr);

  const html = buildRestaurantHtml(content, theme, businessName);
  console.log(`HTML: ${html.length} chars`);

  await supabase.from("orders").update({ status: "delivered", site_html: html }).eq("id", ORDER_ID);

  const siteUrl = `https://website-three-zeta-38.vercel.app/sites/${ORDER_ID}`;
  await resend.emails.send({
    from: "Alexandre <onboarding@resend.dev>",
    to: order!.email as string,
    subject: `🎉 Votre site "${businessName}" est prêt !`,
    html: `<p>Votre site est prêt : <a href="${siteUrl}">${siteUrl}</a></p>`,
  });

  console.log(`✅ Done! ${siteUrl}`);
}

main().catch(console.error);
