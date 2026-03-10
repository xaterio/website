/**
 * Cherche l'email d'une entreprise via Pages Jaunes (annuaire pros)
 * Stratégie : chercher la fiche de l'entreprise, puis visiter sa page pour extraire l'email
 */

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const BLACKLISTED_DOMAINS = [
  "pagesjaunes", "solocal", "societe.com", "pappers", "google",
  "duckduckgo", "bing", "yahoo", "yandex",
  "example", "test", "w3.org", "sentry", "noreply", "no-reply",
  "facebook", "twitter", "instagram", "linkedin", "tiktok",
  "apple", "microsoft", "amazon", "cloudflare",
  "vercel", "supabase", "stripe", "resend",
  "infogreffe", "sirene", "legifrance",
  "wixsite", "wordpress", "jimdo", "weebly", "squarespace",
];

function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_REGEX) || [];
  return matches
    .map((e) => e.toLowerCase())
    .filter((e) => !BLACKLISTED_DOMAINS.some((b) => e.includes(b)))
    .filter((e) => e.length < 80);
}

async function fetchPage(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Pages Jaunes : cherche la fiche pro, visite la page de l'entreprise, extrait l'email
 */
async function searchPagesJaunes(name: string, city?: string): Promise<string | undefined> {
  const query = encodeURIComponent(name.trim());
  const where = encodeURIComponent(city || "France");

  // 1. Cherche dans l'annuaire des professionnels
  const searchHtml = await fetchPage(
    `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${query}&ou=${where}`
  );
  if (!searchHtml) return undefined;

  // 2. Extrait le lien vers la première fiche correspondante
  const linkMatch = searchHtml.match(/href="(\/pros\/[^"]+)"/);
  if (!linkMatch) return undefined;

  // 3. Visite la page de l'entreprise
  const ficheHtml = await fetchPage(`https://www.pagesjaunes.fr${linkMatch[1]}`);
  if (!ficheHtml) return undefined;

  return extractEmails(ficheHtml)[0];
}

/**
 * Societe.com : cherche la fiche entreprise et extrait l'email
 */
async function searchSociete(name: string, city?: string): Promise<string | undefined> {
  const query = encodeURIComponent(`${name} ${city || ""}`.trim());
  const searchHtml = await fetchPage(
    `https://www.societe.com/cgi-bin/search?champs=${query}`
  );
  if (!searchHtml) return undefined;

  // Extrait le lien vers la première fiche
  const linkMatch = searchHtml.match(/href="(\/societe\/[^"]+\.html)"/);
  if (!linkMatch) {
    // Essaie d'extraire directement depuis les résultats
    return extractEmails(searchHtml)[0];
  }

  const ficheHtml = await fetchPage(`https://www.societe.com${linkMatch[1]}`);
  if (!ficheHtml) return undefined;

  return extractEmails(ficheHtml)[0];
}

/**
 * Cherche l'email d'une entreprise
 */
export async function findEmailForCompany(
  companyName: string,
  city?: string
): Promise<string | undefined> {
  const results = await Promise.allSettled([
    searchPagesJaunes(companyName, city),
    searchSociete(companyName, city),
  ]);

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }

  return undefined;
}

// Garde la fonction d'origine pour compatibilité
export { searchPagesJaunes as findEmailOnPagesJaunes };
