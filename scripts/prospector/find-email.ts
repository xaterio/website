/**
 * Cherche l'email d'une entreprise via plusieurs sources
 * 1. Pages Jaunes
 * 2. Societe.com
 * 3. DuckDuckGo (recherche web sans clé API)
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
  "laposte.fr", "orange.fr", "sfr.fr", "free.fr",
];

function extractEmails(html: string): string[] {
  const matches = html.match(EMAIL_REGEX) || [];
  return matches
    .map((e) => e.toLowerCase())
    .filter((e) => !BLACKLISTED_DOMAINS.some((b) => e.includes(b)))
    .filter((e) => e.length < 80); // filtre les faux positifs trop longs
}

async function fetchPage(url: string, timeoutMs = 4000): Promise<string | null> {
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

/** Source 1 : Pages Jaunes */
async function searchPagesJaunes(name: string, city?: string): Promise<string | undefined> {
  const query = encodeURIComponent(`${name} ${city || ""}`.trim());
  const html = await fetchPage(
    `https://www.pagesjaunes.fr/pagesblanches/recherche?quoi=${query}&ou=France`
  );
  if (!html) return undefined;
  return extractEmails(html)[0];
}

/** Source 2 : Societe.com */
async function searchSociete(name: string, city?: string): Promise<string | undefined> {
  const query = encodeURIComponent(`${name} ${city || ""}`.trim());
  const html = await fetchPage(
    `https://www.societe.com/cgi-bin/search?champs=${query}`
  );
  if (!html) return undefined;
  return extractEmails(html)[0];
}

/** Source 3 : DuckDuckGo HTML (pas de clé API) */
async function searchDuckDuckGo(name: string, city?: string): Promise<string | undefined> {
  // Cherche directement l'email sur le web
  const queries = [
    `"${name}" ${city || ""} email contact`,
    `"${name}" ${city || ""} "@"`,
  ];

  for (const q of queries) {
    const html = await fetchPage(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=fr-fr`
    );
    if (!html) continue;

    const emails = extractEmails(html);
    if (emails.length > 0) return emails[0];

    // Petite pause pour éviter le rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  return undefined;
}

/** Source 4 : Annuaire La Poste */
async function searchAnnuairePoste(name: string, city?: string): Promise<string | undefined> {
  const query = encodeURIComponent(`${name} ${city || ""}`.trim());
  const html = await fetchPage(
    `https://www.laposte.fr/particulier/outils/annuaire-des-professionnels?recherche=${query}`
  );
  if (!html) return undefined;
  return extractEmails(html)[0];
}

/**
 * Cherche l'email d'une entreprise en essayant plusieurs sources dans l'ordre
 */
export async function findEmailForCompany(
  companyName: string,
  city?: string
): Promise<string | undefined> {
  const results = await Promise.allSettled([
    searchPagesJaunes(companyName, city),
    searchDuckDuckGo(companyName, city),
    searchSociete(companyName, city),
    searchAnnuairePoste(companyName, city),
  ]);

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }

  return undefined;
}

// Garde la fonction d'origine pour compatibilité
export { searchPagesJaunes as findEmailOnPagesJaunes };
