import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alexandre Dev – Votre site web professionnel",
  description:
    "Alexandre, 16 ans, passionné d'informatique, crée votre site web sur mesure avec l'IA. Résultat professionnel, livraison rapide, prix imbattable.",
  keywords: ["site web", "création site", "développeur web", "IA", "professionnel"],
  openGraph: {
    title: "Alexandre Dev – Votre site web professionnel",
    description: "Site web sur mesure créé par IA en 24h. Commandez maintenant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased gradient-mesh min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
