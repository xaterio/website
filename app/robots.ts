import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/mes-sites", "/commander/succes"],
    },
    sitemap: "https://www.alexwebdesign.pro/sitemap.xml",
  };
}
