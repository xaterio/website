"use client";

import { motion } from "framer-motion";

const sites = [
  {
    name: "Bistrot Le Provençal",
    type: "Restaurant",
    tags: ["Menu en ligne", "Réservation", "Photos"],
    colors: ["#ff6b35", "#f7c59f", "#1a1a2e"],
    emoji: "🍽️",
    pages: ["Accueil", "Menu", "Réservation", "Contact"],
    desc: "Site élégant pour un restaurant avec galerie photos, menu interactif et système de réservation.",
    gradient: "from-orange-500/20 to-red-500/10",
  },
  {
    name: "Atelier Beauté Marie",
    type: "Institut de beauté",
    tags: ["Galerie", "Booking", "Services"],
    colors: ["#d4a5a5", "#f9f0f0", "#2d2d2d"],
    emoji: "💅",
    pages: ["Accueil", "Services", "Galerie", "Prendre RDV"],
    desc: "Site sophistiqué rose & nude pour un institut de beauté avec prise de rendez-vous intégrée.",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  {
    name: "TechSolutions Pro",
    type: "Entreprise tech",
    tags: ["Portfolio", "Contact", "Blog"],
    colors: ["#0070f3", "#00c3ff", "#0d1117"],
    emoji: "💼",
    pages: ["Accueil", "Services", "Portfolio", "Blog", "Contact"],
    desc: "Site corporate moderne bleu pour une entreprise tech avec portfolio projets et blog.",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
];

function BrowserMockup({ site }: { site: typeof sites[0] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Browser bar */}
      <div className="bg-white/5 px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 bg-white/5 rounded-full px-3 py-0.5 text-xs text-gray-600 text-center truncate">
          {site.name.toLowerCase().replace(/ /g, "-")}.fr
        </div>
      </div>

      {/* Fake website */}
      <div
        className={`bg-gradient-to-br ${site.gradient} p-5 min-h-44`}
        style={{ background: `linear-gradient(135deg, ${site.colors[2]}, ${site.colors[2]}dd)` }}
      >
        {/* Navbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{site.emoji}</span>
            <div className="w-20 h-2 rounded" style={{ background: site.colors[0] + "99" }} />
          </div>
          <div className="flex gap-2">
            {site.pages.slice(0, 3).map((_, i) => (
              <div key={i} className="w-10 h-1.5 rounded bg-white/15" />
            ))}
          </div>
        </div>

        {/* Hero section */}
        <div className="mb-4">
          <div className="h-5 w-40 rounded mb-2 shimmer" style={{ background: site.colors[0] + "60" }} />
          <div className="h-2.5 w-64 rounded mb-1 bg-white/10" />
          <div className="h-2.5 w-52 rounded mb-3 bg-white/10" />
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-full" style={{ background: site.colors[0] }} />
            <div className="h-7 w-20 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white/5 rounded-lg p-2">
              <div className="h-8 rounded mb-1" style={{ background: site.colors[0] + "30" }} />
              <div className="h-1.5 w-full rounded bg-white/10 mb-1" />
              <div className="h-1.5 w-3/4 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  return (
    <section className="py-32 relative overflow-hidden" id="exemples">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-pink-300 border border-pink-500/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            Exemples de réalisations
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            Des sites qui{" "}
            <span className="gradient-text">impressionnent.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl max-w-xl mx-auto"
          >
            Chaque site est unique, sur mesure, pensé pour convertir vos visiteurs en clients.
          </motion.p>
        </div>

        {/* Sites grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {sites.map((site, i) => (
            <motion.div
              key={site.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group"
            >
              {/* Mockup */}
              <div className="mb-5 transform group-hover:scale-[1.02] transition-transform duration-300">
                <BrowserMockup site={site} />
              </div>

              {/* Info */}
              <div className="px-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{site.emoji}</span>
                  <div>
                    <h3 className="text-white font-bold">{site.name}</h3>
                    <span className="text-xs text-gray-500">{site.type}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-3 leading-relaxed">{site.desc}</p>

                <div className="flex flex-wrap gap-1.5">
                  {site.tags.map(tag => (
                    <span key={tag} className="glass px-2.5 py-1 rounded-full text-xs text-gray-400 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
