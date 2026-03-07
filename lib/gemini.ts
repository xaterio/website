import { GoogleGenerativeAI } from "@google/generative-ai";
import { OrderData } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function generateWebsite(orderData: OrderData & { photosUrls?: string[] }): Promise<string> {
  const {
    businessName,
    businessTypeLabel,
    styleLabel,
    pages = [],
    description,
    slogan,
    address,
    phone,
    email,
    photosUrls = [],
  } = orderData;

  const prompt = `Tu es un expert développeur web front-end spécialisé en design premium.
Crée un site web HTML/CSS/JS complet et MAGNIFIQUE pour l'entreprise suivante :

**Informations de l'entreprise :**
- Nom : ${businessName || "Mon Entreprise"}
- Type d'activité : ${businessTypeLabel || "Entreprise"}
- Style demandé : ${styleLabel || "Moderne"}
- Description : ${description || "Une entreprise professionnelle"}
- Slogan : ${slogan || ""}
- Adresse : ${address || ""}
- Téléphone : ${phone || ""}
- Email de contact : ${email || "contact@monentreprise.fr"}
- Pages demandées : ${pages.join(", ") || "Accueil, Contact"}
${photosUrls.length > 0 ? `- Photos disponibles : ${photosUrls.join(", ")}` : ""}

**Exigences STRICTES de qualité :**

1. **Design ultra premium** : Utilise des dégradés, des effets glassmorphism, des animations CSS subtiles (fade-in, slide-up au scroll), des ombres profondes.

2. **Structure HTML parfaite** : Navigation sticky responsive, sections bien structurées avec id pour le scroll smooth, footer complet.

3. **CSS inline ou <style>** : Tout le CSS doit être dans le fichier HTML. Utilise des variables CSS pour les couleurs. Design mobile-first.

4. **JavaScript intégré** : Animations au scroll (IntersectionObserver), menu hamburger mobile, formulaire de contact fonctionnel avec validation.

5. **Performances** : Code propre, images optimisées (utilise des placeholders SVG si pas de photos), fonts Google Fonts via CDN.

6. **Style selon la demande** :
${styleLabel === "Moderne & Tech" ? "- Dark mode, gradients violet/bleu, typographie sans-serif bold, effets néon subtils" : ""}
${styleLabel === "Élégant & Luxe" ? "- Couleurs noir et or (#D4AF37), typographie serif, espacement généreux, minimalisme luxueux" : ""}
${styleLabel === "Coloré & Dynamique" ? "- Couleurs vives, gradients rose/orange, energie, typographie ronde et friendly" : ""}
${styleLabel === "Minimaliste & Clean" ? "- Blanc et gris, beaucoup d'espace blanc, typographie fine, accents noirs" : ""}
${styleLabel === "Nature & Zen" ? "- Verts naturels, beiges, textures organiques, calme et sérénité" : ""}
${styleLabel === "Professionnel & Corporate" ? "- Bleu corporate, blanc, gris, confiance et sérieux, structure claire" : ""}

7. **Pages à inclure** :
${pages.map(p => `- ${p}`).join("\n")}

**IMPORTANT** : Génère un fichier HTML complet (<!DOCTYPE html> jusqu'à </html>) avec TOUT le CSS et JS inclus dedans.
Le site doit être MAGNIFIQUE, professionnel, et impressionner au premier coup d'œil.
Utilise des icônes SVG inline plutôt que des dépendances externes.
Si des photos sont fournies, intègre leurs URLs dans le HTML.
Crée du vrai contenu adapté au type d'entreprise, pas du Lorem Ipsum.

Réponds UNIQUEMENT avec le code HTML complet, sans aucune explication ni markdown.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let html = response.text();

  // Strip markdown code blocks if present
  if (html.startsWith("```html")) html = html.slice(7);
  if (html.startsWith("```")) html = html.slice(3);
  if (html.endsWith("```")) html = html.slice(0, -3);

  return html.trim();
}
