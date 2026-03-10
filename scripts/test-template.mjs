// Test script: calls generateWebsite directly and saves the HTML output
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";

// Load env vars from .env.local
const envRaw = readFileSync(".env.local", "utf8");
for (const line of envRaw.split("\n")) {
  const [key, ...rest] = line.trim().split("=");
  if (key && !key.startsWith("#")) process.env[key] = rest.join("=");
}

// --- inline the templates and claude call (no TS transpile needed) ---

async function callClaude(prompt, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// --- Test data: salon de beauté (comme le vrai cas du client) ---
const ORDER = {
  businessName: "Bella Beauté",
  businessType: "salon de beauté",
  businessTypeLabel: "Salon de beauté",
  style: "elegant",
  styleLabel: "Élégant & Luxe",
  pages: ["accueil", "services", "contact"],
  foundedYear: "2019",
  description: "Salon de beauté haut de gamme proposant des soins du visage, épilation, manucure et pédicure. Situé en plein centre de Lyon, notre salon accueille ses clientes dans un cadre raffiné et apaisant. Équipe de 3 esthéticiennes diplômées.",
  slogan: "La beauté, c'est vous.",
  address: "18 Rue de la République, 69001 Lyon",
  phone: "04 72 11 22 33",
  email: "contact@bellabeaute-lyon.fr",
  testimonials: [
    { name: "Camille", city: "Lyon", text: "Un salon d'exception ! L'équipe est aux petits soins, je repars à chaque fois transformée." },
    { name: "Inès", city: "Villeurbanne", text: "Manucure parfaite et ambiance super zen. Je recommande à 100% !" },
    { name: "Lucie", city: "Lyon 6e", text: "Les soins du visage sont incroyables, ma peau n'a jamais été aussi belle." },
  ],
  customWants: "Mettre en avant le côté luxe et bien-être. Photos de l'ambiance chaleureuse du salon.",
  customDontWants: "Pas de coiffure, on ne fait pas ça.",
  freeDescription: "",
};

console.log("🚀 Calling Claude API for: " + ORDER.businessName + " (" + ORDER.businessType + ")");
console.log("Theme:", ORDER.styleLabel);
console.log("");

// Build the prompt manually (same as lib/claude.ts service branch)
const realTestis = ORDER.testimonials.filter(t => t.name && t.text);
const testiInstructions = realTestis.length > 0
  ? `Témoignages RÉELS fournis par le client (utilise-les EXACTEMENT, ne les modifie pas) :\n${realTestis.map((t, i) => `  Avis ${i+1}: "${t.text}" — ${t.name}, ${t.city}`).join("\n")}`
  : `Le client n'a pas fourni d'avis clients. Mets des chaînes VIDES pour testi1Text/testi1Name/testi1City etc.`;

const customInstructions = (ORDER.customWants || ORDER.customDontWants || ORDER.freeDescription)
  ? `\nINSTRUCTIONS PERSONNALISÉES DU CLIENT :${ORDER.customWants ? `\n✅ Ce qu'il veut absolument : ${ORDER.customWants}` : ""}${ORDER.customDontWants ? `\n❌ Ce qu'il ne veut pas : ${ORDER.customDontWants}` : ""}${ORDER.freeDescription ? `\n💬 Description libre : ${ORDER.freeDescription}` : ""}`
  : "";

const year = new Date().getFullYear().toString();

const prompt = `Tu es un expert en copywriting et contenu web.

Génère uniquement un objet JSON valide (sans markdown, sans explication) pour un site web professionnel avec ces infos :

Nom: ${ORDER.businessName}
Type d'activité: ${ORDER.businessType}
Année de création: ${ORDER.foundedYear}
Description fournie par le client: ${ORDER.description}
Slogan: ${ORDER.slogan}
Adresse: ${ORDER.address}
Téléphone: ${ORDER.phone}
Email: ${ORDER.email}

⚠️ RÈGLE ABSOLUE POUR LES STATS : Si l'année de création n'est pas précisée, n'invente PAS "X ans d'expérience". Utilise à la place des métriques vérifiables comme le nombre de services proposés, la zone d'intervention, ou la satisfaction client.
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
  "testiTitle": "Ce que disent nos clientes",
  "testi1Text": "", "testi1Name": "", "testi1City": "",
  "testi2Text": "", "testi2Name": "", "testi2City": "",
  "testi3Text": "", "testi3Name": "", "testi3City": "",
  "contactTitle": "[titre de la section contact]",
  "address": "${ORDER.address}",
  "phone": "${ORDER.phone}",
  "email": "${ORDER.email}",
  "formPlaceholder": "[placeholder textarea adapté au métier]",
  "formCta": "[texte du bouton envoi]",
  "navCta": "[CTA navbar ex: Devis gratuit, Prendre RDV]",
  "metaDesc": "[meta description SEO 150 chars]",
  "year": "${year}"
}

${testiInstructions}${customInstructions}

Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après.`;

try {
  console.log("⏳ Waiting for Claude response...");
  let jsonStr = (await callClaude(prompt, 3000)).trim();
  if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const content = JSON.parse(jsonStr);

  console.log("\n✅ JSON generated successfully!");
  console.log("Services:", content.services.map(s => s.title).join(", "));
  console.log("Stats:", `${content.stat1Num} ${content.stat1Label} | ${content.stat2Num} ${content.stat2Label} | ${content.stat3Num} ${content.stat3Label}`);
  console.log("Hero:", content.heroTitle1, "/", content.heroTitle2);
  console.log("Testimonials:", content.testi1Name ? "✅ included" : "❌ empty");

  // Now build the HTML using the template
  // We need to import the compiled template — since it's TypeScript, use ts-node or inline the JS
  // Let's just write the JSON so you can inspect it
  writeFileSync("scripts/test-output.json", JSON.stringify(content, null, 2), "utf8");
  console.log("\n📄 Full JSON saved to scripts/test-output.json");
  console.log("\n--- SERVICES GENERATED ---");
  content.services.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.emoji} ${s.title}: ${s.desc}`);
  });
  console.log("\n--- FAQ GENERATED ---");
  content.faqs.forEach((f, i) => {
    console.log(`  Q${i+1}: ${f.q}`);
  });

} catch (err) {
  console.error("❌ Error:", err.message);
}
