"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const included = [
  { icon: "✓", text: "Site web complet (jusqu'à 5 pages)" },
  { icon: "✓", text: "Design premium sur mesure" },
  { icon: "✓", text: "100% responsive (mobile + tablette)" },
  { icon: "✓", text: "Ultra rapide (optimisé SEO)" },
  { icon: "✓", text: "Formulaire de contact fonctionnel" },
  { icon: "✓", text: "Galerie photos intégrée" },
  { icon: "✓", text: "Livraison en 48h chrono" },
  { icon: "✓", text: "Fichiers sources fournis" },
  { icon: "✓", text: "1 mois de support inclus" },
  { icon: "✓", text: "Satisfait ou remboursé 7 jours" },
];

const agenceCompared = [
  { label: "Prix moyen", agence: "1 500 – 5 000 €", moi: "149 €" },
  { label: "Délai", agence: "3 – 8 semaines", moi: "48 heures" },
  { label: "Réactivité", agence: "Ticket support", moi: "Direct par email" },
  { label: "Qualité design", agence: "Variable", moi: "Garantie premium" },
];

export default function Pricing() {
  return (
    <section className="py-32 relative overflow-hidden" id="tarif">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-amber-300 border border-amber-500/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Tarification simple
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            Un seul prix.<br />
            <span className="gradient-text-warm">Tout inclus.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="gradient-border rounded-3xl p-8 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-pink-600/10 rounded-3xl" />

              {/* Badge */}
              <div className="relative flex items-center justify-between mb-6">
                <span className="glass px-3 py-1 rounded-full text-xs text-green-400 border border-green-400/20 font-semibold">
                  🔥 Offre de lancement
                </span>
                <span className="text-gray-600 text-sm line-through">499€</span>
              </div>

              {/* Price */}
              <div className="relative mb-8">
                <div className="flex items-start gap-2">
                  <span className="text-3xl text-white font-bold mt-2">€</span>
                  <span className="text-8xl font-black gradient-text leading-none">149</span>
                </div>
                <p className="text-gray-400 mt-2">paiement unique · tout inclus · sans abonnement</p>
              </div>

              {/* Features */}
              <div className="relative grid grid-cols-1 gap-3 mb-8">
                {included.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/commander"
                className="relative btn-gradient w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
              >
                Commander mon site pour 149€
                <span>→</span>
              </Link>

              <p className="text-center text-gray-600 text-xs mt-4">
                Paiement sécurisé via Stripe · Remboursement sous 7 jours si insatisfait
              </p>
            </div>
          </motion.div>

          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Vs une agence web traditionnelle</h3>

            <div className="space-y-3">
              {agenceCompared.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="glass rounded-2xl p-4 grid grid-cols-3 items-center gap-4"
                >
                  <span className="text-gray-400 text-sm font-medium">{row.label}</span>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Agence</div>
                    <div className="text-red-400 text-sm font-semibold">{row.agence}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Alexandre</div>
                    <div className="text-green-400 text-sm font-bold">{row.moi}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6 mt-8 border border-green-500/20"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
                &quot;Alexandre a livré notre site en moins de 48 heures. Le rendu est vraiment professionnel, nos clients nous le font souvent remarquer. Un très bon rapport qualité-prix.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                <div>
                  <div className="text-white text-sm font-semibold">Marie L.</div>
                  <div className="text-gray-500 text-xs">Gérante, Institut Beauté Marie · Lyon</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
