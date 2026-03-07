import Anthropic from "@anthropic-ai/sdk";
import { OrderData } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

  const styleGuide: Record<string, string> = {
    "Moderne & Tech": `
    - Dark mode profond (#0a0a0f background), gradients violet (#7c3aed) → bleu (#3b82f6) → cyan
    - Effets glassmorphism (backdrop-filter: blur), borders lumineux rgba(255,255,255,0.1)
    - Typographie: Inter ou Space Grotesk (Google Fonts), titres très bold (font-weight:900)
    - Effets néon subtils sur les CTA (box-shadow: 0 0 30px rgba(124,58,237,0.5))
    - Particules CSS ou formes géométriques flottantes en arrière-plan`,
    "Élégant & Luxe": `
    - Fond très sombre (#0d0d0d ou #1a1410), accents or (#D4AF37, #c9a84c)
    - Typographie mixte: Playfair Display (titres serif) + Montserrat (corps)
    - Espacement généreux, sections aérées, lignes fines dorées comme séparateurs
    - Animations ultra-fluides, transitions lentes et élégantes (0.8s ease)
    - Textures subtiles, overlay grain ou motif géométrique discret`,
    "Coloré & Dynamique": `
    - Fond blanc ou très clair, explosions de couleur vive (rose #ec4899, orange #f97316, violet)
    - Typographie ronde et friendly: Nunito, Poppins ou Quicksand
    - Dégradés animés sur les sections hero, boutons avec hover coloré vif
    - Cards avec border-radius élevé, shadows colorées
    - Illustrations SVG custom inline, formes organiques en background`,
    "Minimaliste & Clean": `
    - Fond blanc pur (#ffffff) ou off-white (#fafafa), accents noir (#111) et gris
    - Typographie: DM Sans ou Outfit, très aéré, font-weight léger pour le corps
    - Beaucoup d'espace blanc, grid asymétrique, micro-typographie soignée
    - Animations minimalistes: fade-in simple, underline hover sur les liens
    - Pas d'images inutiles, contenu centré sur le texte et les données`,
    "Nature & Zen": `
    - Palette: vert sauge (#87a878), beige (#f5efe6), terra cotta (#c4775a), blanc cassé
    - Typographie: Lora (serif, titres) + Source Sans Pro (corps), doux et organique
    - Textures naturelles SVG (feuilles, vagues douces), fond avec subtle noise texture
    - Animations lentes et fluides, effet parallax subtil sur les images
    - Formes organiques (border-radius asymétrique), sections en vague`,
    "Professionnel & Corporate": `
    - Fond blanc, accent bleu corporate (#1e40af ou #0f4c81), gris (#64748b)
    - Typographie: Inter ou Roboto, propre et lisible, hiérarchie claire
    - Grid structuré, sections bien délimitées, icônes professionnelles SVG
    - Trust signals visuels: badges, chiffres clés mis en avant, témoignages
    - CTA bleu foncé avec hover, header sticky avec ombre légère au scroll`,
  };

  const currentStyleGuide = styleGuide[styleLabel || ""] || `
    - Design moderne avec gradients, shadows profondes, animations fluides
    - Palette cohérente avec la charte de l'entreprise
    - Typographie Google Fonts premium, hiérarchie visuelle forte`;

  const prompt = `Tu es le meilleur développeur web front-end au monde, expert en design UI/UX de niveau agence internationale top-tier (Awwwards, CSS Design Awards).

Crée le MEILLEUR site web possible — un site qui impressionne instantanément, qui donne confiance, et qui convertit des visiteurs en clients — pour cette entreprise :

═══════════════════════════════════
INFORMATIONS CLIENT
═══════════════════════════════════
Entreprise : ${businessName || "Mon Entreprise"}
Activité   : ${businessTypeLabel || "Entreprise"}
Style      : ${styleLabel || "Moderne"}
Description: ${description || "Une entreprise professionnelle de qualité"}
Slogan     : ${slogan || ""}
Adresse    : ${address || ""}
Téléphone  : ${phone || ""}
Email      : ${email || "contact@monentreprise.fr"}
Pages      : ${pages.join(", ") || "Accueil, Contact"}
${photosUrls.length > 0 ? `Photos     : ${photosUrls.join(", ")}` : ""}

═══════════════════════════════════
DIRECTION ARTISTIQUE — ${styleLabel || "Moderne"}
═══════════════════════════════════
${currentStyleGuide}

═══════════════════════════════════
STANDARDS DE QUALITÉ ABSOLUS
═══════════════════════════════════

DESIGN :
- Hero section avec accroche puissante, visuel impactant, CTA bien visible
- Sections bien rythmées avec alternance de backgrounds pour aérer
- Cards avec hover effects (transform, shadow, couleur)
- Compteurs animés pour les chiffres clés (clients, années d'expérience, etc.)
- Section témoignages clients avec avatars générés SVG
- Section FAQ avec accordion animé
- Footer complet avec plan du site, coordonnées, réseaux sociaux SVG
- Favicon inline et meta tags SEO complets (title, description, og:)

ANIMATIONS & INTERACTIONS :
- IntersectionObserver pour fade-in/slide-up à chaque section au scroll
- Parallax subtil sur le hero
- Cursor hover effects sur les boutons (scale, glow)
- Smooth scroll entre les sections
- Menu hamburger mobile avec animation fluide (burger → croix)
- Loading animation sur la page (spinner ou progress bar)
- Texte hero animé (typing effect ou reveal progressif)

TECHNIQUE :
- HTML5 sémantique parfait (header, main, section, article, footer, nav)
- CSS custom properties (variables) pour toute la palette de couleurs
- Flexbox et CSS Grid pour les layouts
- Mobile-first, 100% responsive (breakpoints 480px, 768px, 1024px, 1280px)
- Formulaire de contact avec validation JS en temps réel et feedback visuel
- Images : si photos fournies → les intégrer avec object-fit:cover, sinon → placeholders SVG élaborés et thématiques adaptés au secteur
- Google Fonts via CDN (2 fonts maximum, bien choisies pour le style)
- Toutes les icônes en SVG inline (pas de dépendances externes)
- Performance : CSS minifié dans <style>, JS en bas de page

CONTENU :
- Rédige un VRAI contenu professionnel, accrocheur et adapté au secteur
- Titre hero percutant (pas générique), sous-titre qui explique la valeur
- Arguments de vente spécifiques au métier (pas du Lorem Ipsum)
- Invente des chiffres crédibles (ex: 200+ clients, 10 ans d'expérience)
- Invente 3 témoignages clients réalistes avec prénom, ville, note 5 étoiles
- Invente une FAQ avec 4-5 questions pertinentes au secteur

PAGES DEMANDÉES : ${pages.map(p => `\n- ${p}`).join("")}
Chaque page doit être une section complète avec son propre contenu élaboré.

═══════════════════════════════════
FORMAT DE RÉPONSE
═══════════════════════════════════
Réponds UNIQUEMENT avec le code HTML complet et autosuffisant.
Commence par <!DOCTYPE html> et termine par </html>.
Tout le CSS dans <style> dans le <head>.
Tout le JS dans <script> avant </body>.
Aucune dépendance externe sauf Google Fonts.
Aucune explication, aucun markdown, juste le code.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  // Clean up any markdown code blocks if present
  let html = content.text;
  if (html.startsWith("```html")) {
    html = html.slice(7);
  }
  if (html.startsWith("```")) {
    html = html.slice(3);
  }
  if (html.endsWith("```")) {
    html = html.slice(0, -3);
  }

  return html.trim();
}
