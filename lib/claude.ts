import { OrderData } from "@/types";
import { getTheme } from "./templates/themes";
import { buildRestaurantHtml, RestaurantContent } from "./templates/restaurant-template";
import { buildServiceHtml, ServiceContent } from "./templates/service-template";

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  return data.content[0].text;
}

const RESTAURANT_TYPES = ["restaurant", "boulangerie", "cafe", "traiteur", "pizzeria", "bar"];

function isRestaurant(businessType: string): boolean {
  return RESTAURANT_TYPES.some(t => businessType.toLowerCase().includes(t));
}

export async function generateWebsite(
  orderData: OrderData & { photosUrls?: string[]; menuText?: string; testimonials?: Array<{name:string;city:string;text:string}>; customWants?: string; customDontWants?: string; freeDescription?: string }
): Promise<string> {
  const {
    businessName = "Mon Entreprise",
    businessType = "",
    styleLabel = "Minimaliste & Clean",
    description = "",
    slogan = "",
    address = "",
    phone = "",
    email = "",
    menuText = "",
    testimonials,
    customWants = "",
    customDontWants = "",
    freeDescription = "",
  } = orderData;

  // Build real testimonials block or flag to skip
  const realTestis = (testimonials || []).filter(t => t.name && t.text);
  const testiInstructions = realTestis.length > 0
    ? `Témoignages RÉELS fournis par le client (utilise-les EXACTEMENT, ne les modifie pas) :\n${realTestis.map((t, i) => `  Avis ${i+1}: "${t.text}" — ${t.name}, ${t.city}`).join("\n")}`
    : `Le client n'a pas fourni d'avis clients. Mets des chaînes VIDES pour testi1Text/testi1Name/testi1City etc.`;

  const customInstructions = (customWants || customDontWants || freeDescription)
    ? `\nINSTRUCTIONS PERSONNALISÉES DU CLIENT :${customWants ? `\n✅ Ce qu'il veut absolument : ${customWants}` : ""}${customDontWants ? `\n❌ Ce qu'il ne veut pas : ${customDontWants}` : ""}${freeDescription ? `\n💬 Description libre du client (respecte-la en priorité) : ${freeDescription}` : ""}`
    : "";

  const theme = getTheme(styleLabel);
  const year = new Date().getFullYear().toString();
  const useRestaurant = isRestaurant(businessType);

  if (useRestaurant) {
    const prompt = `Tu es un expert en copywriting et contenu web pour restaurants.

Génère uniquement un objet JSON valide (sans markdown, sans explication) pour un site de restaurant avec ces infos :

Nom: ${businessName}
Description: ${description}
Slogan: ${slogan || ""}
Adresse: ${address || "Non précisée"}
Téléphone: ${phone || "Non précisé"}
Email: ${email || "contact@" + businessName.toLowerCase().replace(/\s+/g, "") + ".fr"}
Menu fourni par le client: ${menuText || "Non fourni — invente un menu réaliste et appétissant"}

Génère ce JSON exactement (remplace toutes les valeurs par du contenu réel pour ce restaurant) :
{
  "heroTag": "Restaurant · Depuis [année réaliste]",
  "heroTitle1": "[accroche percutante en 3-4 mots]",
  "heroTitle2": "[2ème ligne de titre, en italique]",
  "heroSub": "[phrase d'accroche 15-20 mots, authentique et appétissante]",
  "heroCta1": "Voir le menu",
  "heroCta2": "Réserver une table",
  "stat1Num": "[chiffre avec +]", "stat1Label": "Années d'expérience",
  "stat2Num": "[chiffre]", "stat2Label": "Plats à la carte",
  "stat3Num": "[note /5]", "stat3Label": "Note Google",
  "aboutTag": "Notre histoire",
  "aboutTitle": "[titre de section accrocheur]",
  "aboutP1": "[paragraphe 30-40 mots sur l'histoire/philosophie du restaurant]",
  "aboutP2": "[paragraphe 25-35 mots sur les engagements/valeurs]",
  "aboutCta": "Nous contacter",
  "menuTitle": "[titre de la section menu]",
  "menuSub": "[phrase d'accroche sur la carte]",
  "menuItems": [
    {"category": "[catégorie1]", "name": "[nom plat]", "desc": "[description courte et appétissante]", "price": "[prix]"},
    {"category": "[catégorie1]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie1]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie2]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie2]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie2]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie3]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"},
    {"category": "[catégorie3]", "name": "[nom plat]", "desc": "[description]", "price": "[prix]"}
  ],
  "testiTitle": "Ce que disent nos clients",
  "testi1Text": "", "testi1Name": "", "testi1City": "",
  "testi2Text": "", "testi2Name": "", "testi2City": "",
  "testi3Text": "", "testi3Name": "", "testi3City": "",
  "contactTitle": "[titre contact]",
  "address": "${address || "Adresse à renseigner"}",
  "phone": "${phone || "Téléphone à renseigner"}",
  "email": "${email || "contact@restaurant.fr"}",
  "hours": [
    {"day": "Lundi", "time": "Fermé"},
    {"day": "Mardi – Vendredi", "time": "12h–14h30, 19h–22h"},
    {"day": "Samedi", "time": "12h–15h, 19h–23h"},
    {"day": "Dimanche", "time": "12h–15h"}
  ],
  "formPlaceholder": "Votre message, demande de réservation...",
  "formCta": "Envoyer",
  "navCta": "Réserver",
  "metaDesc": "[meta description SEO 150 chars]",
  "year": "${year}"
}

${testiInstructions}${customInstructions}

IMPORTANT: Si le menu est fourni par le client, utilise ces plats/prix réels dans menuItems. Adapte les catégories selon le type de restaurant.
Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après.`;

    let jsonStr = (await callClaude(prompt, 4000)).trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    const content: RestaurantContent = JSON.parse(jsonStr);
    return buildRestaurantHtml(content, theme, businessName);

  } else {
    const prompt = `Tu es un expert en copywriting et contenu web.

Génère uniquement un objet JSON valide (sans markdown, sans explication) pour un site web professionnel avec ces infos :

Nom: ${businessName}
Type d'activité: ${businessType}
Description fournie par le client: ${description || "Non fournie"}
Slogan: ${slogan || ""}
Adresse: ${address || "Non précisée"}
Téléphone: ${phone || "Non précisé"}
Email: ${email || "contact@" + businessName.toLowerCase().replace(/\s+/g, "") + ".fr"}
${freeDescription ? `Description libre du client: ${freeDescription}` : ""}
${customWants ? `Ce que le client veut absolument inclure: ${customWants}` : ""}
${customDontWants ? `Ce que le client ne veut PAS: ${customDontWants}` : ""}

⚠️ RÈGLE ABSOLUE POUR LES SERVICES : Tu dois UNIQUEMENT lister les services que le client a explicitement mentionnés dans sa description ou ses instructions. N'invente JAMAIS un service qui n'est pas mentionné. Si le client dit "salon de beauté" sans mentionner la coiffure, n'inclus PAS la coiffure. Base-toi UNIQUEMENT sur ce que le client a écrit.

Génère ce JSON exactement :
{
  "heroTag": "[type d'activité · ville ou région si connue]",
  "heroTitle1": "[accroche principale 3-4 mots forts]",
  "heroTitle2": "[2ème ligne du titre, en italique]",
  "heroSub": "[phrase d'accroche 15-20 mots, professionnelle et convaincante]",
  "heroCta1": "[CTA principal ex: Nos services, Prendre RDV]",
  "heroCta2": "[CTA secondaire ex: Nous appeler, Devis gratuit]",
  "stat1Num": "[chiffre avec signe]", "stat1Label": "[métrique pertinente]",
  "stat2Num": "[chiffre avec signe]", "stat2Label": "[métrique pertinente]",
  "stat3Num": "[chiffre avec signe]", "stat3Label": "[métrique pertinente]",
  "servicesTitle": "[titre section services]",
  "servicesSub": "[phrase d'accroche sur les services]",
  "services": [
    {"emoji": "[emoji]", "title": "[service MENTIONNÉ par le client]", "desc": "[description 20-30 mots fidèle à ce que le client a décrit]"},
    {"emoji": "[emoji]", "title": "[service MENTIONNÉ par le client]", "desc": "[description 20-30 mots]"},
    {"emoji": "[emoji]", "title": "[service MENTIONNÉ par le client]", "desc": "[description 20-30 mots]"},
    {"emoji": "[emoji]", "title": "[service MENTIONNÉ par le client]", "desc": "[description 20-30 mots]"}
  ],
  "aboutTag": "À propos",
  "aboutTitle": "[titre de section]",
  "aboutP1": "[paragraphe 30-40 mots sur l'histoire/expertise, basé sur la description du client]",
  "aboutP2": "[paragraphe 25-35 mots sur les valeurs/engagement]",
  "aboutCta": "Nous contacter",
  "faqTitle": "Questions fréquentes",
  "faqs": [
    {"q": "[question fréquente pertinente pour CE métier spécifique]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 2]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 3]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 4]", "a": "[réponse claire 20-30 mots]"}
  ],
  "testiTitle": "Ce que disent nos clients",
  "testi1Text": "", "testi1Name": "", "testi1City": "",
  "testi2Text": "", "testi2Name": "", "testi2City": "",
  "testi3Text": "", "testi3Name": "", "testi3City": "",
  "contactTitle": "[titre de la section contact]",
  "address": "${address || "Adresse à renseigner"}",
  "phone": "${phone || "Téléphone à renseigner"}",
  "email": "${email || "contact@entreprise.fr"}",
  "formPlaceholder": "[placeholder textarea adapté au métier]",
  "formCta": "[texte du bouton envoi]",
  "navCta": "[CTA navbar ex: Devis gratuit, Prendre RDV]",
  "metaDesc": "[meta description SEO 150 chars]",
  "year": "${year}"
}

${testiInstructions}

Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après.`;

    let jsonStr = (await callClaude(prompt, 3000)).trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    const content: ServiceContent = JSON.parse(jsonStr);
    return buildServiceHtml(content, theme, businessName);
  }
}
