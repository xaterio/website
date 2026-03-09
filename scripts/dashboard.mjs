/**
 * Dashboard de prospection local
 * Usage: node scripts/dashboard.mjs
 * Ouvre http://localhost:3333 dans le navigateur
 */

import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([^=]+)=(.*)/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://website-three-zeta-38.vercel.app";

const { Resend } = await import("resend");
const resend = new Resend(RESEND_API_KEY);

const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendSms(to, message) {
  // Normaliser le numéro en +33
  let phone = to.replace(/\s/g, "");
  if (phone.startsWith("0")) phone = "+33" + phone.slice(1);
  if (!phone.startsWith("+")) return null;

  const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sender: "Alexandre", recipient: phone, content: message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Brevo: ${data.message || res.status}`);
  return data.messageId;
}

const BLACKLISTED = ["pagesjaunes","solocal","societe.com","pappers","google","duckduckgo","example","test","w3.org","sentry","facebook","twitter","instagram","linkedin","apple","microsoft","amazon","cloudflare","vercel","supabase","stripe","resend","infogreffe","sirene","noreply","no-reply","donotreply","mairie","gouv","laposte","orange","sfr","free.fr","wanadoo","hotmail","gmail","yahoo","outlook"];
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const UA_LIST = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];
const BUSINESS_TYPES = [
  { type: "restaurant", label: "Restaurant" },
  { type: "beauty_salon", label: "Salon de beauté" },
  { type: "hair_care", label: "Coiffeur" },
  { type: "plumber", label: "Plombier" },
  { type: "electrician", label: "Électricien" },
  { type: "bakery", label: "Boulangerie" },
  { type: "dentist", label: "Dentiste" },
  { type: "painter", label: "Peintre" },
  { type: "car_repair", label: "Garage auto" },
  { type: "florist", label: "Fleuriste" },
  { type: "physiotherapist", label: "Kinésithérapeute" },
  { type: "veterinary_care", label: "Vétérinaire" },
  { type: "laundry", label: "Pressing" },
  { type: "locksmith", label: "Serrurier" },
  { type: "moving_company", label: "Déménageur" },
];

const CONTACTED_FILE = path.join(__dirname, "prospector/contacted.csv");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function randUA() { return UA_LIST[Math.floor(Math.random() * UA_LIST.length)]; }
function extractEmails(html) {
  return (html.match(EMAIL_REGEX) || []).map(e => e.toLowerCase()).filter(e => !BLACKLISTED.some(b => e.includes(b)) && e.length < 80 && e.includes("."));
}
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": randUA(), Accept: "text/html,*/*;q=0.8", "Accept-Language": "fr-FR,fr;q=0.9", "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// Normalise le nom pour deviner un domaine
function nameToDomain(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

async function guessEmail(name, ville, phone) {
  const q = encodeURIComponent(`"${name}" ${ville}`);

  // Source 1 : Pages Jaunes
  const pj = await fetchPage(`https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${encodeURIComponent(`${name} ${ville}`.trim())}&ou=France`);
  if (pj) { const e = extractEmails(pj)[0]; if (e) return e; }
  await sleep(300);

  // Source 2 : Bing
  const bing = await fetchPage(`https://www.bing.com/search?q=${q}+email+contact&setlang=fr&cc=FR`);
  if (bing) { const e = extractEmails(bing)[0]; if (e) return e; }
  await sleep(300);

  // Source 3 : DuckDuckGo
  const ddg = await fetchPage(`https://html.duckduckgo.com/html/?q=${q}+%40+contact&kl=fr-fr`);
  if (ddg) { const e = extractEmails(ddg)[0]; if (e) return e; }
  await sleep(300);

  // Source 4 : Societe.com
  const soc = await fetchPage(`https://www.societe.com/cgi-bin/search?champs=${encodeURIComponent(`${name} ${ville}`.trim())}`);
  if (soc) { const e = extractEmails(soc)[0]; if (e) return e; }

  return null;
}

// Vérifie si le domaine d'un email a un site web actif (auquel cas le business a déjà un site)
async function emailDomainHasSite(email) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const r = await fetch(`https://${domain}`, { method: "HEAD", signal: AbortSignal.timeout(3000), redirect: "follow" });
    return r.ok || r.status === 403 || r.status === 200;
  } catch { return false; }
}
async function searchPlaces(query, pageToken) {
  const params = new URLSearchParams({ query, key: API_KEY, language: "fr", region: "fr", ...(pageToken && { pagetoken: pageToken }) });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  return res.json();
}
async function getPlaceDetails(placeId) {
  const params = new URLSearchParams({ place_id: placeId, fields: "name,website,formatted_phone_number", key: API_KEY, language: "fr" });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = await res.json();
  return data.result;
}
function loadContacted() {
  if (!fs.existsSync(CONTACTED_FILE)) return new Set();
  return new Set(fs.readFileSync(CONTACTED_FILE, "utf-8").split("\n").slice(1).map(l => l.split(",")[0]?.trim()).filter(Boolean));
}
function saveContacted(placeId, name, email, ville) {
  const isNew = !fs.existsSync(CONTACTED_FILE);
  const line = [placeId, `"${name}"`, email, ville, new Date().toISOString().split("T")[0]].join(",");
  if (isNew) fs.writeFileSync(CONTACTED_FILE, "place_id,nom,email,ville,date\n" + line + "\n");
  else fs.appendFileSync(CONTACTED_FILE, line + "\n");
}

const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>AlexandreDev — Prospection</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #e5e7eb; font-family: -apple-system, sans-serif; min-height: 100vh; padding: 32px; }
  h1 { font-size: 28px; font-weight: 900; margin-bottom: 32px; }
  h1 span { background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 24px; max-width: 760px; }
  .row { display: flex; gap: 16px; margin-bottom: 16px; }
  label { display: block; font-size: 12px; color: #9ca3af; font-weight: 600; margin-bottom: 6px; }
  input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; color: white; font-size: 14px; outline: none; }
  input:focus { border-color: rgba(168,85,247,0.5); }
  button { width: 100%; background: linear-gradient(135deg, #7c3aed, #2563eb); border: none; border-radius: 12px; padding: 14px; color: white; font-size: 15px; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; max-width: 760px; }
  .stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; }
  .stat-n { font-size: 36px; font-weight: 900; }
  .stat-l { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  .green { color: #4ade80; }
  .yellow { color: #facc15; }
  .gray { color: #9ca3af; }
  #log { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; max-width: 760px; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 13px; line-height: 1.8; }
  .l-search { color: #9ca3af; margin-top: 8px; }
  .l-skip { color: #4b5563; }
  .l-nosite { color: #facc15; }
  .l-noemail { color: #6b7280; }
  .l-sending { color: #60a5fa; }
  .l-sent { color: #4ade80; }
  .l-error { color: #f87171; }
  .l-done { color: #a78bfa; margin-top: 8px; font-weight: bold; }
  .cursor { animation: blink 1s infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
</style>
</head>
<body>
<h1>Alexandre<span>Dev</span> · Prospection</h1>

<div class="card">
  <div class="row">
    <div style="flex:1"><label>Ville</label><input id="ville" value="Grenoble" /></div>
    <div style="flex:1"><label>Emails max</label><input id="max" type="number" value="10" min="1" max="100" /></div>
  </div>
  <div style="margin-bottom:12px"><label><input type="checkbox" id="dryrun" style="width:auto;margin-right:8px">Dry run (ne pas envoyer les emails)</label></div>
  <button id="btn" onclick="start()">🚀 Lancer la prospection</button>
</div>

<div class="stats" id="stats" style="display:none">
  <div class="stat"><div class="stat-n green" id="s-sent">0</div><div class="stat-l">Emails envoyés</div></div>
  <div class="stat"><div class="stat-n yellow" id="s-nosite">0</div><div class="stat-l">Sans site web</div></div>
  <div class="stat"><div class="stat-n gray" id="s-noemail">0</div><div class="stat-l">Email introuvable</div></div>
</div>

<div id="log" style="display:none"></div>

<script>
let sent = 0, nosite = 0, noemail = 0;

function log(html) {
  const el = document.getElementById("log");
  const div = document.createElement("div");
  div.innerHTML = html;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function start() {
  const ville = document.getElementById("ville").value;
  const max = document.getElementById("max").value;
  const dry = document.getElementById("dryrun").checked;
  const btn = document.getElementById("btn");
  const logEl = document.getElementById("log");
  const statsEl = document.getElementById("stats");

  btn.disabled = true;
  btn.textContent = "⏳ Prospection en cours...";
  logEl.innerHTML = "";
  logEl.style.display = "block";
  statsEl.style.display = "grid";
  sent = 0; nosite = 0; noemail = 0;
  document.getElementById("s-sent").textContent = "0";
  document.getElementById("s-nosite").textContent = "0";
  document.getElementById("s-noemail").textContent = "0";

  const es = new EventSource("/prospect?ville=" + encodeURIComponent(ville) + "&max=" + max + "&dry=" + dry);

  es.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.type === "city") log('<span style="color:#a78bfa;font-weight:bold;margin-top:8px;display:block">📍 Ville : ' + d.ville + '</span>');
    else if (d.type === "search") log('<span class="l-search">🔍 Recherche ' + d.label + ' à ' + d.ville + '...</span>');
    else if (d.type === "skip_site") log('<span class="l-skip">⏭  ' + d.name + ' — a un site</span>');
    else if (d.type === "no_site") { nosite++; document.getElementById("s-nosite").textContent = nosite; log('<span class="l-nosite">📍 ' + d.name + ' — pas de site web</span>'); }
    else if (d.type === "no_email") { noemail++; document.getElementById("s-noemail").textContent = noemail; log('<span class="l-noemail">📭 ' + d.name + ' — email introuvable' + (d.phone ? ' · 📞 ' + d.phone : '') + '</span>'); }
    else if (d.type === "sending") log('<span class="l-sending">📤 ' + d.name + ' → ' + d.email + '...</span>');
    else if (d.type === "sent") { sent++; document.getElementById("s-sent").textContent = sent; log('<span class="l-sent">✅ ' + d.name + ' (' + d.email + ')</span>'); }
    else if (d.type === "dry") { sent++; document.getElementById("s-sent").textContent = sent; log('<span class="l-sent">[DRY] ' + d.name + ' → ' + d.email + '</span>'); }
    else if (d.type === "sending_sms") log('<span class="l-sending">💬 ' + d.name + ' → SMS ' + d.phone + '...</span>');
    else if (d.type === "sent_sms") { sent++; document.getElementById("s-sent").textContent = sent; log('<span class="l-sent">✅ ' + d.name + ' — SMS envoyé (' + d.phone + ')</span>'); }
    else if (d.type === "dry_sms") { sent++; document.getElementById("s-sent").textContent = sent; log('<span class="l-sent">[DRY SMS] ' + d.name + ' → ' + d.phone + '</span>'); }
    else if (d.type === "error") log('<span class="l-error">❌ ' + d.message + '</span>');
    else if (d.type === "done") {
      log('<span class="l-done">✅ Terminé — ' + d.sent + ' contact(s) envoyé(s)</span>');
      btn.disabled = false;
      btn.textContent = "🚀 Lancer la prospection";
      es.close();
    }
  };
  es.onerror = () => { log('<span class="l-error">❌ Connexion perdue</span>'); btn.disabled = false; btn.textContent = "🚀 Lancer la prospection"; es.close(); };
}
</script>
</body>
</html>`;

// SSE handler
async function runProspection(ville, max, dry, res) {
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const contacted = loadContacted();
  let sent = 0, noSite = 0, noEmail = 0;

  // Villes à prospecter en cascade si la première est épuisée
  const VILLES = [ville, "Grenoble", "Lyon", "Marseille", "Toulouse", "Nantes", "Bordeaux", "Lille", "Strasbourg", "Rennes", "Montpellier", "Nice", "Annecy", "Chambéry", "Valence", "Clermont-Ferrand", "Dijon", "Caen", "Reims", "Tours"].filter((v, i, a) => a.indexOf(v) === i);

  outer:
  for (const currentVille of VILLES) {
    if (sent >= max) break;
    send({ type: "city", ville: currentVille });

    for (const biz of BUSINESS_TYPES) {
      if (sent >= max) break outer;
      send({ type: "search", label: biz.label, ville: currentVille });

      let pageToken = null;
      let page = 0;

      do {
        if (pageToken) await sleep(2000);
        const data = await searchPlaces(`${biz.label} ${currentVille}`, pageToken);
        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          send({ type: "error", message: `Erreur Google: ${data.status}` });
          break;
        }

        for (const place of (data.results || [])) {
          if (sent >= max) break outer;
          if (contacted.has(place.place_id)) continue;

          const details = await getPlaceDetails(place.place_id);
          await sleep(100);

          if (details?.website) { send({ type: "skip_site", name: place.name }); continue; }

          noSite++;
          send({ type: "no_site", name: place.name });

          const phone = details?.formatted_phone_number || null;
          const email = await guessEmail(place.name, currentVille, phone);

          // Email trouvé → vérifier que le domaine n'a pas de site
          if (email && await emailDomainHasSite(email)) {
            send({ type: "skip_site", name: place.name });
            continue;
          }

          // Ni email ni téléphone → impossible de contacter
          if (!email && !phone) {
            noEmail++;
            send({ type: "no_email", name: place.name, phone: null });
            continue;
          }

          if (email) {
            // Contacter par email
            send({ type: "sending", name: place.name, email });
            if (!dry) {
              try {
                await resend.emails.send({
                  from: "Alexandre <contact@alexwebdesign.pro>",
                  to: email,
                  subject: `Un site web professionnel pour ${place.name} ?`,
                  html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:40px auto;color:#1f2937;line-height:1.7}.signature{margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:14px}a{color:#7c3aed}</style></head><body>
<p>Bonjour,</p>
<p>Je me présente : je m'appelle <strong>Alexandre</strong>, j'ai 16 ans et je suis passionné d'informatique, notamment de développement web.</p>
<p>En me renseignant sur votre entreprise <strong>${place.name}</strong>, j'ai remarqué que vous ne disposez pas encore de site internet. Aujourd'hui, avoir une présence en ligne peut vraiment aider une entreprise à gagner en visibilité et à attirer de nouveaux clients.</p>
<p>Je vous propose donc mes services pour créer un site web moderne, professionnel et adapté à votre activité.</p>
<p>Pour <strong>150€</strong>, je réalise un site web de qualité avec un excellent rapport qualité-prix, conçu pour présenter votre entreprise de manière claire et professionnelle.</p>
<p>De plus, pour vous garantir une totale satisfaction :</p>
<ul>
  <li>si le site ne vous plaît pas, vous pouvez être entièrement remboursé ;</li>
  <li>pendant 1 mois après la livraison, je peux effectuer toutes les modifications nécessaires afin que le site corresponde parfaitement à vos attentes.</li>
</ul>
<p>Si cela vous intéresse, ou simplement si vous souhaitez voir ce que je suis capable de réaliser, je vous invite à consulter mon site web : <a href="${SITE_URL}">${SITE_URL}</a></p>
<p>Je serais ravi d'échanger avec vous si vous avez des questions.</p>
<p>Cordialement,</p>
<div class="signature"><strong>Alexandre</strong><br>contact@alexwebdesign.pro</div>
</body></html>`,
                });
                saveContacted(place.place_id, place.name, email, currentVille);
                contacted.add(place.place_id);
                sent++;
                send({ type: "sent", name: place.name, email });
              } catch (err) {
                send({ type: "error", message: `Erreur email: ${err.message}` });
              }
            } else {
              sent++;
              send({ type: "dry", name: place.name, email });
            }
          } else {
            // Pas d'email → SMS via Brevo
            send({ type: "sending_sms", name: place.name, phone });
            if (!dry) {
              try {
                const smsText = `Bonjour, je m'appelle Alexandre, j'ai 16 ans et je suis passionne d'informatique. J'ai remarque que vous n'avez pas de site web. Je vous propose de vous en creer un. Visitez mon site pour voir mes realisations et commander : ${SITE_URL}`;
                await sendSms(phone, smsText);
                saveContacted(place.place_id, place.name, phone, currentVille);
                contacted.add(place.place_id);
                sent++;
                send({ type: "sent_sms", name: place.name, phone });
              } catch (err) {
                send({ type: "error", message: `Erreur SMS: ${err.message}` });
              }
            } else {
              sent++;
              send({ type: "dry_sms", name: place.name, phone });
            }
          }

          await sleep(500);
        }

        pageToken = data.next_page_token;
        page++;
      } while (pageToken && sent < max && page < 3);
    }
  }

  send({ type: "done", sent, noSite, noEmail });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/" || url.pathname === "") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
  } else if (url.pathname === "/prospect") {
    const ville = url.searchParams.get("ville") || "Grenoble";
    const max = parseInt(url.searchParams.get("max") || "10");
    const dry = url.searchParams.get("dry") === "true";
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    await runProspection(ville, max, dry, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`\n✅ Dashboard démarré → http://localhost:${PORT}\n`);
});
