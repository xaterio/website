/**
 * Recherche d'entreprises via Google Maps Places API
 * Remplace pappers.ts (plus de crédits)
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

export interface GoogleBusiness {
  placeId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  hasWebsite: boolean;
}

// Catégories de commerces locaux (sans site web fréquemment)
export const BUSINESS_CATEGORIES = [
  "restaurant",
  "boulangerie",
  "café bar",
  "pizzeria",
  "traiteur",
  "salon de coiffure",
  "institut de beauté",
  "esthéticienne",
  "plombier",
  "électricien",
  "peintre en bâtiment",
  "carreleur",
  "menuisier",
  "serrurier",
  "garagiste",
  "carrosserie",
  "auto-école",
  "fleuriste",
  "pharmacie",
  "opticien",
  "vétérinaire",
  "cabinet dentaire",
  "médecin généraliste",
  "kinésithérapeute",
  "ostéopathe",
  "expert-comptable",
  "agence immobilière",
  "pressing nettoyage",
  "cordonnerie",
  "épicerie",
  "librairie",
  "bijouterie",
  "charcuterie",
  "boucherie",
  "fromagerie",
];

// Département → préfecture (ville principale de recherche)
const DEPT_TO_CITY: Record<string, string> = {
  "01": "Bourg-en-Bresse", "02": "Laon", "03": "Moulins", "04": "Digne-les-Bains",
  "05": "Gap", "06": "Nice", "07": "Privas", "08": "Charleville-Mézières",
  "09": "Foix", "10": "Troyes", "11": "Carcassonne", "12": "Rodez",
  "13": "Marseille", "14": "Caen", "15": "Aurillac", "16": "Angoulême",
  "17": "La Rochelle", "18": "Bourges", "19": "Tulle", "21": "Dijon",
  "22": "Saint-Brieuc", "23": "Guéret", "24": "Périgueux", "25": "Besançon",
  "26": "Valence", "27": "Évreux", "28": "Chartres", "29": "Quimper",
  "30": "Nîmes", "31": "Toulouse", "32": "Auch", "33": "Bordeaux",
  "34": "Montpellier", "35": "Rennes", "36": "Châteauroux", "37": "Tours",
  "38": "Grenoble", "39": "Lons-le-Saunier", "40": "Mont-de-Marsan",
  "41": "Blois", "42": "Saint-Étienne", "43": "Le Puy-en-Velay",
  "44": "Nantes", "45": "Orléans", "46": "Cahors", "47": "Agen",
  "48": "Mende", "49": "Angers", "50": "Saint-Lô", "51": "Châlons-en-Champagne",
  "52": "Chaumont", "53": "Laval", "54": "Nancy", "55": "Bar-le-Duc",
  "56": "Vannes", "57": "Metz", "58": "Nevers", "59": "Lille",
  "60": "Beauvais", "61": "Alençon", "62": "Arras", "63": "Clermont-Ferrand",
  "64": "Pau", "65": "Tarbes", "66": "Perpignan", "67": "Strasbourg",
  "68": "Colmar", "69": "Lyon", "70": "Vesoul", "71": "Mâcon",
  "72": "Le Mans", "73": "Chambéry", "74": "Annecy", "75": "Paris",
  "76": "Rouen", "77": "Melun", "78": "Versailles", "79": "Niort",
  "80": "Amiens", "81": "Albi", "82": "Montauban", "83": "Toulon",
  "84": "Avignon", "85": "La Roche-sur-Yon", "86": "Poitiers",
  "87": "Limoges", "88": "Épinal", "89": "Auxerre", "90": "Belfort",
  "91": "Évry-Courcouronnes", "92": "Nanterre", "93": "Bobigny",
  "94": "Créteil", "95": "Cergy", "971": "Pointe-à-Pitre",
  "972": "Fort-de-France", "973": "Cayenne", "974": "Saint-Denis",
};

interface TextSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
}

interface TextSearchResponse {
  results: TextSearchResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

interface PlaceDetailsResponse {
  result: {
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
  };
  status: string;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function extractCity(address: string): string {
  // "12 rue ..., 33000 Bordeaux, France" → "Bordeaux"
  const match = address.match(/\d{5}\s+([^,]+)/);
  return match ? match[1].trim() : address.split(",").slice(-2, -1)[0]?.trim() || "";
}

export function getCity(departement?: string): string {
  if (!departement) return "France";
  return DEPT_TO_CITY[departement] || `département ${departement}`;
}

export async function searchBusinesses(params: {
  category: string;
  departement?: string;
  pageToken?: string;
}): Promise<{ businesses: Pick<GoogleBusiness, "placeId" | "name" | "address" | "city">[]; nextPageToken?: string }> {
  const { category, departement, pageToken } = params;

  const city = getCity(departement);
  const query = `${category} ${city}`;

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("language", "fr");
  url.searchParams.set("region", "fr");
  if (pageToken) url.searchParams.set("pagetoken", pageToken);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places API error ${res.status}`);

  const data = await res.json() as TextSearchResponse;

  if (data.status === "ZERO_RESULTS") return { businesses: [] };
  if (data.status !== "OK") {
    throw new Error(`Google Places: ${data.status} — ${data.error_message || ""}`);
  }

  const businesses = (data.results || []).map(r => ({
    placeId: r.place_id,
    name: r.name,
    address: r.formatted_address,
    city: extractCity(r.formatted_address),
  }));

  return { businesses, nextPageToken: data.next_page_token };
}

export async function getPlaceDetails(placeId: string): Promise<{
  phone?: string;
  website?: string;
  hasWebsite: boolean;
}> {
  // Small delay to respect rate limits
  await sleep(100);

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "formatted_phone_number,international_phone_number,website");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("language", "fr");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return { hasWebsite: false };

    const data = await res.json() as PlaceDetailsResponse;
    if (data.status !== "OK") return { hasWebsite: false };

    const phone = data.result.international_phone_number || data.result.formatted_phone_number;
    return {
      phone: phone || undefined,
      website: data.result.website || undefined,
      hasWebsite: !!data.result.website,
    };
  } catch {
    return { hasWebsite: false };
  }
}
