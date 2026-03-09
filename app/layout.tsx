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
  title: "Alexandre Dev – Création de site web par IA | Livraison 48h",
  description:
    "Créez votre site web professionnel en 48h grâce à l'IA. Alexandre, développeur web, conçoit votre site sur mesure à partir de 149€. Restaurant, artisan, commerce : résultat professionnel garanti.",
  keywords: [
    "création site web", "site web professionnel", "développeur web", "site web pas cher",
    "site web restaurant", "site web artisan", "site web IA", "création site internet",
    "alexwebdesign", "alex web design", "site web 48h", "site web rapide",
  ],
  metadataBase: new URL("https://www.alexwebdesign.pro"),
  alternates: {
    canonical: "https://www.alexwebdesign.pro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Alexandre Dev – Création de site web par IA | Livraison 48h",
    description: "Site web professionnel créé par IA en 48h à partir de 149€. Restaurant, artisan, commerce. Commandez maintenant.",
    type: "website",
    url: "https://www.alexwebdesign.pro",
    siteName: "Alexandre Dev",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alexandre Dev – Site web par IA en 48h",
    description: "Votre site web professionnel créé par IA en 48h à partir de 149€.",
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
