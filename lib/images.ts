interface PexelsPhoto {
  src: { large2x: string; large: string; medium: string };
}

/**
 * Fetch a high-quality image URL from Pexels for a given keyword.
 * Falls back to a neutral placeholder if no result or no API key.
 */
export async function fetchImageUrl(
  keyword: string,
  width: number,
  height: number
): Promise<string> {
  // Read inside function so dotenv has time to load env vars
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    return `https://placehold.co/${width}x${height}/f5f5f0/888?text=${encodeURIComponent(keyword)}`;
  }

  const orientation = width >= height ? "landscape" : "portrait";

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=${orientation}`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) throw new Error(`Pexels ${res.status}`);
    const data = await res.json() as { photos: PexelsPhoto[] };
    const photo = data.photos?.[0];
    if (!photo) throw new Error("no photos");
    return photo.src.large2x || photo.src.large || photo.src.medium;
  } catch {
    // Fallback: neutral gray placeholder with keyword label
    return `https://placehold.co/${width}x${height}/f0ede8/999?text=${encodeURIComponent(keyword)}`;
  }
}
