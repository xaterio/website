import { NextRequest } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const maxDuration = 60;

const BLACKLISTED = ["pagesjaunes","solocal","societe.com","pappers","google","duckduckgo","example","test","w3.org","sentry","facebook","twitter","instagram","linkedin","apple","microsoft","amazon","cloudflare","vercel","supabase","stripe","resend","infogreffe","sirene","noreply","no-reply","donotreply"];
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "fr-FR,fr;q=0.9" };

const BUSINESS_TYPES = [
  { type: "restaurant", label: "Restaurant" },
  { type: "beauty_salon", label: "Salon de beauté" },
  { type: "hair_care", label: "Coiffeur" },
  { type: "plumber", label: "Plombier" },
  { type: "electrician", label: "Électricien" },
  { type: "bakery", label: "Boulangerie" },
  { type: "dentist", label: "Dentiste" },
];

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function extractEmails(html: string) {
  return (html.match(EMAIL_REGEX) || []).map(e => e.toLowerCase()).filter(e => !BLACKLISTED.some(b => e.includes(b)) && e.length < 80);
}

async function fetchPage(url: string) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function guessEmail(name: string, ville: string) {
  const pj = await fetchPage(`https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(`${name} ${ville}`.trim())}&ou=France`);
  if (pj) { const e = extractEmails(pj)[0]; if (e) return e; }

  const ddg = await fetchPage(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${name}" ${ville} email contact`)}&kl=fr-fr`);
  if (ddg) { const e = extractEmails(ddg)[0]; if (e) return e; }

  return null;
}

async function searchPlaces(query: string, apiKey: string) {
  const params = new URLSearchParams({ query, key: apiKey, language: "fr", region: "fr" });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  return res.json();
}

async function getPlaceDetails(placeId: string, apiKey: string) {
  const params = new URLSearchParams({ place_id: placeId, fields: "name,website,formatted_phone_number", key: apiKey, language: "fr" });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = await res.json() as { result: Record<string, string> };
  return data.result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const ville = searchParams.get("ville") || "Grenoble";
  const max = parseInt(searchParams.get("max") || "10");

  if (secret !== process.env.ADMIN_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://website-three-zeta-38.vercel.app";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let sent = 0;
      let noSite = 0;
      let noEmail = 0;

      send({ type: "start", ville, max });

      for (const biz of BUSINESS_TYPES) {
        if (sent >= max) break;
        send({ type: "search", label: biz.label, ville });

        const data = await searchPlaces(`${biz.label} ${ville}`, API_KEY);
        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          send({ type: "error", message: `Erreur Google: ${data.status}` });
          continue;
        }

        for (const place of (data.results || [])) {
          if (sent >= max) break;

          const details = await getPlaceDetails(place.place_id, API_KEY);
          await sleep(100);

          if (details?.website) {
            send({ type: "skip_site", name: place.name });
            continue;
          }

          noSite++;
          send({ type: "no_site", name: place.name });

          const email = await guessEmail(place.name, ville);
          if (!email) {
            noEmail++;
            send({ type: "no_email", name: place.name, phone: details?.formatted_phone_number || null });
            continue;
          }

          send({ type: "sending", name: place.name, email });

          try {
            await resend.emails.send({
              from: "Alexandre <contact@alexwebdesign.pro>",
              to: email,
              subject: `Un site web professionnel pour ${place.name} ?`,
              html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:40px auto;color:#1f2937;line-height:1.7}.signature{margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:14px}a{color:#7c3aed}</style></head><body>
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
<div class="signature"><strong>Alexandre</strong><br>Développeur Web · 16 ans<br>contact@alexwebdesign.pro<br><a href="${SITE_URL}">${SITE_URL}</a></div>
</body></html>`,
            });
            sent++;
            send({ type: "sent", name: place.name, email });
          } catch (err) {
            send({ type: "error", message: `Erreur envoi ${place.name}: ${err}` });
          }

          await sleep(500);
        }
      }

      send({ type: "done", sent, noSite, noEmail });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
