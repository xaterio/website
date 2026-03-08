export interface Theme {
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
  font: string;
  fontUrl: string;
  imgBg: string;
  imgBg2: string;
}

export const THEMES: Record<string, Theme> = {
  "Minimaliste & Clean": {
    bg: "#ffffff", bg2: "#f7f7f5", text: "#111111", muted: "#888888",
    accent: "#111111", accentText: "#ffffff", border: "#e8e8e8",
    font: "DM Sans", imgBg: "#e8e8e8", imgBg2: "#f0f0f0",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,400&display=swap",
  },
  "Moderne & Tech": {
    bg: "#07070f", bg2: "#0f0f1a", text: "#f0f0ff", muted: "#6b7280",
    accent: "#7c3aed", accentText: "#ffffff", border: "rgba(255,255,255,0.08)",
    font: "Space Grotesk", imgBg: "#1a1a2e", imgBg2: "#12121f",
    fontUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
  },
  "Élégant & Luxe": {
    bg: "#0d0d0d", bg2: "#141414", text: "#f5f0e8", muted: "#9a8f7e",
    accent: "#D4AF37", accentText: "#0d0d0d", border: "rgba(212,175,55,0.2)",
    font: "Cormorant Garamond", imgBg: "#1a1810", imgBg2: "#1f1c14",
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@400;500;600&display=swap",
  },
  "Coloré & Dynamique": {
    bg: "#ffffff", bg2: "#fdf4ff", text: "#1a1a2e", muted: "#6b7280",
    accent: "#d946ef", accentText: "#ffffff", border: "#f3e8ff",
    font: "Poppins", imgBg: "#fce7ff", imgBg2: "#fff0fb",
    fontUrl: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap",
  },
  "Nature & Zen": {
    bg: "#faf8f3", bg2: "#f2ede4", text: "#2d2d1e", muted: "#7a7060",
    accent: "#6a8f5a", accentText: "#ffffff", border: "#ddd8cc",
    font: "Lora", imgBg: "#e0d8c8", imgBg2: "#ede5d5",
    fontUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@400;500;600&display=swap",
  },
  "Professionnel & Corporate": {
    bg: "#ffffff", bg2: "#f8fafc", text: "#0f172a", muted: "#64748b",
    accent: "#1e40af", accentText: "#ffffff", border: "#e2e8f0",
    font: "Inter", imgBg: "#dbeafe", imgBg2: "#eff6ff",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap",
  },
};

export function getTheme(styleLabel: string): Theme {
  return THEMES[styleLabel] || THEMES["Minimaliste & Clean"];
}
