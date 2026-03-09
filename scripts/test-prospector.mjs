import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const PAPPERS_API_KEY = process.env.PAPPERS_API_KEY;
if (!PAPPERS_API_KEY) { console.error("❌ PAPPERS_API_KEY manquant"); process.exit(1); }

console.log("🔍 Recherche d'entreprises (sans envoi d'emails)...\n");

const params = new URLSearchParams({
  api_token: PAPPERS_API_KEY,
  par_page: "10",
  page: "1",
  code_naf: "5610A", // Restauration traditionnelle
  departement: "38",
});

const res = await fetch(`https://api.pappers.fr/v2/entreprises?${params}`);
if (!res.ok) {
  console.error("❌ Erreur Pappers:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log(`✅ ${data.total} entreprises trouvées (affichage des 10 premières)\n`);

for (const e of data.resultats || []) {
  const email = e.siege?.email || "—";
  const site = e.siege?.site_web || "—";
  const ville = e.siege?.ville || "—";
  console.log(`  📍 ${e.nom_entreprise} (${ville})`);
  console.log(`     Email: ${email} | Site: ${site}\n`);
}
