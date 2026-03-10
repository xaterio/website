/**
 * Pappers.fr API integration
 * Documentation: https://api.pappers.fr/documentation
 * Free tier: up to 100 requests/min, 1000 results/request
 */

export interface PappersEntreprise {
  siren: string;
  nom_entreprise: string;
  forme_juridique?: string;
  libelle_code_naf?: string;
  siege?: {
    adresse_ligne_1?: string;
    ville?: string;
    code_postal?: string;
    telephone?: string;
    email?: string;
    site_web?: string;
  };
  representants?: Array<{
    nom?: string;
    prenom?: string;
    qualite?: string;
  }>;
  finances?: Array<{
    annee?: number;
    chiffre_affaires?: number;
    resultat?: number;
  }>;
}

export interface PappersResponse {
  total: number;
  resultats: PappersEntreprise[];
}

const BASE_URL = "https://api.pappers.fr/v2";

/**
 * Recherche des entreprises avec CA > minRevenue et sans site web connu
 */
export async function searchCompanies({
  minRevenue = 100000,
  maxRevenue = 5000000,
  page = 1,
  perPage = 100,
  departement,
  codeNaf,
}: {
  minRevenue?: number;
  maxRevenue?: number;
  page?: number;
  perPage?: number;
  departement?: string;
  codeNaf?: string;
}): Promise<PappersResponse> {
  const apiKey = process.env.PAPPERS_API_KEY;
  if (!apiKey) throw new Error("PAPPERS_API_KEY is not set");

  const params = new URLSearchParams({
    api_token: apiKey,
    par_page: String(perPage),
    page: String(page),
    ca_annuel_min: String(minRevenue),
    ca_annuel_max: String(maxRevenue),
    statut_rcs: "inscrit",
    ...(departement && { departement }),
    ...(codeNaf && { code_naf: codeNaf }),
  });

  const url = `${BASE_URL}/entreprises?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pappers API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<PappersResponse>;
}

/**
 * Cibles de qualité — secteurs avec bon CA et souvent sans site web
 * Source: codes NAF INSEE
 */
export const TARGET_NAF_CODES = [
  "5610A", // Restauration traditionnelle
  "5610B", // Cafétérias
  "5621Z", // Services des traiteurs
  "9602A", // Coiffure
  "9602B", // Soins de beauté
  "4711B", // Supérettes
  "4719A", // Commerces de détail
  "4329A", // Travaux d'isolation
  "4321A", // Travaux d'électricité
  "4322A", // Travaux de plomberie
  "4332A", // Menuiserie métallique
  "8621Z", // Médecine générale
  "8622A", // Spécialistes
  "8690A", // Ambulances
  "4751Z", // Commerce de textiles
  "8559A", // Formation continue
];
