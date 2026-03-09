/**
 * Agent de prospection via Google Places API
 * Cherche des entreprises sans site web dans une zone géographique
 * Usage: node scripts/prospector/google-places.mjs
 *        node scripts/prospector/google-places.mjs --ville=Lyon --max=50
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) { console.error("❌ GOOGLE_PLACES_API_KEY manquant"); process.exit(1); }

const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ---- Config ----
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const villeArg = args.find(a => a.startsWith("--ville="))?.split("=")[1] || "Grenoble";
const maxArg = args.find(a => a.startsWith("--max="))?.split("=")[1];
const MAX_EMAILS = maxArg ? parseInt(maxArg) : 20;

const CONTACTED_FILE = path.join(__dirname, "contacted.csv");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://website-three-zeta-38.vercel.app";

const BUSINESS_TYPES = [
  { type: "restaurant", label: "Restaurant" },
  { type: "beauty_salon", label: "Salon de beauté" },
  { type: "hair_care", label: "Coiffeur" },
  { type: "plumber", label: "Plombier" },
  { type: "electrician", label: "Électricien" },
  { type: "painter", label: "Peintre" },
  { type: "bakery", label: "Boulangerie" },
  { type: "clothing_store", label: "Boutique" },
  { type: "dentist", label: "Dentiste" },
  { type: "physiotherapist", label: "Kiné" },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadContacted() {
  if (!fs.existsSync(CONTACTED_FILE)) return new Set();
  const lines = fs.readFileSync(CONTACTED_FILE, "utf-8").split("\n").slice(1);
  return new Set(lines.map(l => l.split(",")[0]?.trim()).filter(Boolean));
}

function saveContacted(placeId, name, email, ville) {
  const isNew = !fs.existsSync(CONTACTED_FILE);
  const line = [placeId, `"${name}"`, email, ville, new Date().toISOString().split("T")[0]].join(",");
  if (isNew) fs.writeFileSync(CONTACTED_FILE, "place_id,nom,email,ville,date\n" + line + "\n");
  else fs.appendFileSync(CONTACTED_FILE, line + "\n");
}

async function searchPlaces(query, pageToken) {
  const params = new URLSearchParams({
    query,
    key: API_KEY,
    language: "fr",
    region: "fr",
    ...(pageToken && { pagetoken: pageToken }),
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  return res.json();
}

async function getPlaceDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,website,formatted_phone_number,formatted_address",
    key: API_KEY,
    language: "fr",
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = await res.json();
  return data.result;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const BLACKLISTED = ["pagesjaunes","solocal","societe.com","pappers","google","duckduckgo","example","test","w3.org","sentry","facebook","twitter","instagram","linkedin","apple","microsoft","amazon","cloudflare","vercel","supabase","stripe","resend","infogreffe","sirene","noreply","no-reply","donotreply"];
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "fr-FR,fr;q=0.9" };

function extractEmails(html) {
  return (html.match(EMAIL_REGEX) || []).map(e => e.toLowerCase()).filter(e => !BLACKLISTED.some(b => e.includes(b)) && e.length < 80);
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function guessEmail(name, ville) {
  // Source 1: Pages Jaunes
  const pj = await fetchPage(`https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(`${name} ${ville||""}`.trim())}&ou=France`);
  if (pj) { const e = extractEmails(pj)[0]; if (e) return e; }

  // Source 2: DuckDuckGo
  const ddg = await fetchPage(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${name}" ${ville||""} email contact`)}&kl=fr-fr`);
  if (ddg) { const e = extractEmails(ddg)[0]; if (e) return e; }
  await sleep(1000);

  // Source 3: Societe.com
  const soc = await fetchPage(`https://www.societe.com/cgi-bin/search?champs=${encodeURIComponent(`${name} ${ville||""}`.trim())}`);
  if (soc) { const e = extractEmails(soc)[0]; if (e) return e; }

  return null;
}

// ---- Main ----
const contacted = loadContacted();
let emailsSent = 0;
let skippedHasSite = 0;
let skippedNoEmail = 0;
let skippedAlreadyContacted = 0;

console.log(`\n🤖 Agent Prospection Google Maps`);
console.log(`   Ville: ${villeArg} | Max: ${MAX_EMAILS} | ${isDryRun ? "DRY RUN (pas d'envoi)" : "ENVOI ACTIVÉ"}\n`);

for (const biz of BUSINESS_TYPES) {
  if (emailsSent >= MAX_EMAILS) break;

  const query = `${biz.label} ${villeArg}`;
  console.log(`\n🔍 Recherche: "${query}"`);

  let pageToken = null;
  let page = 0;

  do {
    if (pageToken) await sleep(2000); // Google exige un délai entre pages
    const data = await searchPlaces(query, pageToken);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error(`  ❌ Erreur Google: ${data.status} — ${data.error_message || ""}`);
      break;
    }

    for (const place of data.results || []) {
      if (emailsSent >= MAX_EMAILS) break;

      if (contacted.has(place.place_id)) {
        skippedAlreadyContacted++;
        continue;
      }

      // Récupérer les détails (website, phone)
      const details = await getPlaceDetails(place.place_id);
      await sleep(100);

      if (details?.website) {
        skippedHasSite++;
        console.log(`  ⏭  ${place.name} — a un site (${details.website})`);
        continue;
      }

      // Pas de site — on cherche un email
      const email = await guessEmail(place.name, villeArg);

      if (!email) {
        skippedNoEmail++;
        console.log(`  📭 ${place.name} — pas de site mais pas d'email trouvé`);
        // Afficher quand même les infos pour référence
        if (details?.formatted_phone_number) {
          console.log(`     📞 ${details.formatted_phone_number}`);
        }
        continue;
      }

      if (!isDryRun) {
        await resend.emails.send({
          from: "Alexandre <contact@alexwebdesign.pro>",
          to: email,
          subject: `Un site web professionnel pour ${place.name} ?`,
          html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:40px auto;color:#1f2937;line-height:1.7}.signature{margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:14px}a{color:#7c3aed}</style>
</head><body>
<p>Bonjour,</p>
<p>Je me permets de vous contacter car j'ai remarqué que <strong>${place.name}</strong> n'a pas encore de site web, et je pense que vous méritez une belle vitrine en ligne.</p>
<p>Je m'appelle <strong>Alexandre</strong>, j'ai 16 ans et je suis passionné d'informatique depuis tout petit. Pour gagner en expérience, je propose de créer votre site web professionnel pour seulement <strong>149€</strong> — un tarif que vous ne trouverez nulle part ailleurs pour la qualité proposée.</p>
<p>Ce que vous obtenez :</p>
<ul>
  <li>✓ Un site web professionnel sur mesure</li>
  <li>✓ Design moderne et responsive (mobile + tablette)</li>
  <li>✓ Formulaire de contact, galerie photos, infos entreprise</li>
  <li>✓ Livraison en 48 heures</li>
  <li>✓ Satisfait ou remboursé</li>
</ul>
<p>Voir mes réalisations : <a href="${SITE_URL}">${SITE_URL}</a></p>
<p>Répondez à cet email ou commandez directement en ligne. Je serai ravi de vous accompagner !</p>
<p>Cordialement,</p>
<div class="signature"><strong>Alexandre</strong><br>Développeur Web · 16 ans · Passionné d'informatique<br>contact@alexwebdesign.pro<br><a href="${SITE_URL}">${SITE_URL}</a></div>
</body></html>`,
        });

        saveContacted(place.place_id, place.name, email, villeArg);
        contacted.add(place.place_id);
        emailsSent++;
        console.log(`  ✅ ${place.name} → ${email}`);
      } else {
        console.log(`  [DRY] ${place.name} → ${email}`);
        emailsSent++;
      }

      await sleep(500);
    }

    pageToken = data.next_page_token;
    page++;
  } while (pageToken && emailsSent < MAX_EMAILS && page < 3);
}

console.log(`\n✅ Terminé !`);
console.log(`   ✉  Emails envoyés    : ${emailsSent}`);
console.log(`   ⏭  Ont un site       : ${skippedHasSite}`);
console.log(`   📭 Sans email         : ${skippedNoEmail}`);
console.log(`   📋 Déjà contactés     : ${skippedAlreadyContacted}\n`);

if (skippedNoEmail > 0) {
  console.log(`💡 Note: Google Places ne fournit pas les emails.`);
  console.log(`   Les entreprises sans email sont listées avec leur téléphone.`);
  console.log(`   Tu peux les appeler directement ou utiliser find-email.ts.\n`);
}
