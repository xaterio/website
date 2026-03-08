import Anthropic from "@anthropic-ai/sdk";
import { OrderData } from "@/types";
import { getTheme } from "./templates/themes";
import { buildRestaurantHtml, RestaurantContent } from "./templates/restaurant-template";
import { buildServiceHtml, ServiceContent } from "./templates/service-template";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const RESTAURANT_TYPES = ["restaurant", "boulangerie", "cafe", "traiteur", "pizzeria", "bar"];

function isRestaurant(businessType: string): boolean {
  return RESTAURANT_TYPES.some(t => businessType.toLowerCase().includes(t));
}

export async function generateWebsite(
  orderData: OrderData & { photosUrls?: string[]; menuText?: string }
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
  } = orderData;

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
  "imgHero1": "[mot-clé anglais Unsplash pour grande photo hero, ex: pizza-wood-fired,italian-pasta,sushi-restaurant]",
  "imgHero2": "[mot-clé anglais Unsplash pour photo food 2, différent du 1er]",
  "imgHero3": "[mot-clé anglais Unsplash pour photo food 3, différent des autres]",
  "imgAbout": "[mot-clé anglais Unsplash pour section 'notre histoire', ex: chef-cooking,restaurant-kitchen,family-restaurant]",
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
  "testiTitle": "[titre section avis clients]",
  "testi1Text": "[avis client réaliste 20-30 mots]", "testi1Name": "[Prénom N.]", "testi1City": "[ville]",
  "testi2Text": "[avis client réaliste 20-30 mots]", "testi2Name": "[Prénom N.]", "testi2City": "[ville]",
  "testi3Text": "[avis client réaliste 20-30 mots]", "testi3Name": "[Prénom N.]", "testi3City": "[ville]",
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

IMPORTANT: Si le menu est fourni par le client, utilise ces plats/prix réels dans menuItems. Adapte les catégories selon le type de restaurant.
Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    let jsonStr = (message.content[0] as { type: string; text: string }).text.trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    const content: RestaurantContent = JSON.parse(jsonStr);
    return buildRestaurantHtml(content, theme, businessName);

  } else {
    const prompt = `Tu es un expert en copywriting et contenu web.

Génère uniquement un objet JSON valide (sans markdown, sans explication) pour un site web professionnel avec ces infos :

Nom: ${businessName}
Type d'activité: ${businessType}
Description: ${description}
Slogan: ${slogan || ""}
Adresse: ${address || "Non précisée"}
Téléphone: ${phone || "Non précisé"}
Email: ${email || "contact@" + businessName.toLowerCase().replace(/\s+/g, "") + ".fr"}

Génère ce JSON exactement :
{
  "heroTag": "[type d'activité · ville ou région si connue]",
  "heroTitle1": "[accroche principale 3-4 mots forts]",
  "heroTitle2": "[2ème ligne du titre, en italique]",
  "heroSub": "[phrase d'accroche 15-20 mots, professionnelle et convaincante]",
  "heroCta1": "[CTA principal ex: Nos services, Prendre RDV]",
  "heroCta2": "[CTA secondaire ex: Nous appeler, Devis gratuit]",
  "imgHero": "[mot-clé anglais Unsplash pour la photo hero, précis et visuel, ex: hairdresser-salon,plumber-work,doctor-consultation,bakery-bread]",
  "imgAbout": "[mot-clé anglais Unsplash pour section à propos, ex: craftsman-workshop,professional-team,small-business]",
  "stat1Num": "[chiffre avec signe]", "stat1Label": "[métrique pertinente]",
  "stat2Num": "[chiffre avec signe]", "stat2Label": "[métrique pertinente]",
  "stat3Num": "[chiffre avec signe]", "stat3Label": "[métrique pertinente]",
  "servicesTitle": "[titre section services]",
  "servicesSub": "[phrase d'accroche sur les services]",
  "services": [
    {"emoji": "[emoji]", "title": "[service 1]", "desc": "[description 20-30 mots]"},
    {"emoji": "[emoji]", "title": "[service 2]", "desc": "[description 20-30 mots]"},
    {"emoji": "[emoji]", "title": "[service 3]", "desc": "[description 20-30 mots]"},
    {"emoji": "[emoji]", "title": "[service 4]", "desc": "[description 20-30 mots]"}
  ],
  "aboutTag": "À propos",
  "aboutTitle": "[titre de section]",
  "aboutP1": "[paragraphe 30-40 mots sur l'histoire/expertise]",
  "aboutP2": "[paragraphe 25-35 mots sur les valeurs/engagement]",
  "aboutCta": "Nous contacter",
  "faqTitle": "Questions fréquentes",
  "faqs": [
    {"q": "[question fréquente 1]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 2]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 3]", "a": "[réponse claire 20-30 mots]"},
    {"q": "[question fréquente 4]", "a": "[réponse claire 20-30 mots]"}
  ],
  "testiTitle": "[titre section témoignages]",
  "testi1Text": "[témoignage réaliste 20-30 mots]", "testi1Name": "[Prénom N.]", "testi1City": "[ville]",
  "testi2Text": "[témoignage réaliste 20-30 mots]", "testi2Name": "[Prénom N.]", "testi2City": "[ville]",
  "testi3Text": "[témoignage réaliste 20-30 mots]", "testi3Name": "[Prénom N.]", "testi3City": "[ville]",
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

Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    let jsonStr = (message.content[0] as { type: string; text: string }).text.trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    const content: ServiceContent = JSON.parse(jsonStr);
    return buildServiceHtml(content, theme, businessName);
  }
}
