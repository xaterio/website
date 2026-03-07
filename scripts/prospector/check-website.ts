import dns from "dns/promises";

/**
 * Check if a company has a website by trying multiple methods
 */
export async function hasWebsite(companyName: string, existingUrl?: string): Promise<boolean> {
  // If Pappers already has a site_web field, trust it
  if (existingUrl && existingUrl.trim()) return true;

  // Try to resolve common domain patterns
  const domains = generateDomainCandidates(companyName);

  for (const domain of domains) {
    try {
      await dns.resolve4(domain);
      // DNS resolves = domain exists = likely has a website
      return true;
    } catch {
      // DNS failed = no website at this domain
    }
  }

  return false;
}

/**
 * Generate likely domain names for a company
 */
function generateDomainCandidates(name: string): string[] {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")   // keep only alnum + space + dash
    .trim()
    .replace(/\s+/g, "-")            // spaces to dashes
    .replace(/-+/g, "-")             // multiple dashes to one
    .slice(0, 30);                   // max length

  if (!clean) return [];

  return [
    `www.${clean}.fr`,
    `${clean}.fr`,
    `www.${clean}.com`,
    `${clean}.com`,
  ];
}

/**
 * Extract email from company data if available
 */
export function extractEmail(company: {
  siege?: { email?: string; telephone?: string };
}): string | undefined {
  return company.siege?.email || undefined;
}
