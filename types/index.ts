export type BusinessType =
  | "restaurant"
  | "artisan"
  | "medecin"
  | "coiffeur"
  | "commerce"
  | "association"
  | "autre";

export type StylePreference =
  | "moderne"
  | "elegant"
  | "colore"
  | "minimaliste"
  | "tech"
  | "nature";

export type PageType =
  | "accueil"
  | "a-propos"
  | "services"
  | "galerie"
  | "menu"
  | "contact"
  | "blog"
  | "reservation";

export interface OrderData {
  // Étape 1
  businessType?: BusinessType;
  businessTypeLabel?: string;
  // Étape 2
  style?: StylePreference;
  styleLabel?: string;
  // Étape 3
  pages?: PageType[];
  // Étape 4
  businessName?: string;
  slogan?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  // Étape 5
  photos?: File[];
  photosUrls?: string[];
  // Étape 6
  clientEmail?: string;
  clientName?: string;
}

export interface Order {
  id: string;
  email: string;
  client_name?: string;
  business_name?: string;
  business_type?: string;
  style?: string;
  pages?: string[];
  info?: Record<string, string>;
  photos_urls?: string[];
  stripe_session_id?: string;
  status: "pending" | "paid" | "generating" | "delivered";
  site_html?: string;
  created_at: string;
}

export interface Company {
  siren: string;
  nom_entreprise: string;
  forme_juridique?: string;
  activite?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  dirigeant?: string;
  email?: string;
  telephone?: string;
  chiffre_affaires?: number;
  has_website: boolean;
  contacted: boolean;
}
