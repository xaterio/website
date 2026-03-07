"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const steps = [
  { n: "01", icon: "📋", title: "Complétez le quiz", desc: "5 minutes pour décrire votre activité, le style souhaité et les pages à inclure." },
  { n: "02", icon: "💳", title: "Paiement sécurisé", desc: "149 € via Stripe. Remboursement intégral sous 7 jours si vous n'êtes pas satisfait." },
  { n: "03", icon: "⚡", title: "Création du site", desc: "Je développe votre site sur mesure avec les dernières technologies web : design soigné, responsive, adapté à votre secteur." },
  { n: "04", icon: "🚀", title: "Livraison sous 48h", desc: "Vous recevez les fichiers sources complets par email. Mise en ligne disponible sur demande." },
];

const faqs = [
  { q: "Que reçois-je exactement ?", a: "Un site HTML/CSS/JS complet, responsive, optimisé SEO, avec tous les fichiers sources pour l'héberger où vous le souhaitez." },
  { q: "Des modifications sont-elles possibles après livraison ?", a: "Oui. Un mois de support est inclus pour des ajustements mineurs (textes, couleurs, images). Pour des modifications plus importantes, nous convenons ensemble d'un devis adapté." },
  { q: "Pouvez-vous vous occuper de l'hébergement ?", a: "Oui, pour 10 € supplémentaires je m'occupe de la mise en ligne avec un nom de domaine .fr inclus pour un an. Vous n'avez rien à gérer techniquement." },
  { q: "Pourquoi le tarif est-il si accessible ?", a: "J'ai 16 ans et je n'ai pas les charges d'une agence — pas de loyer, pas de structure. Je maîtrise les technologies actuelles qui me permettent de produire un résultat professionnel rapidement." },
  { q: "Mon site sera-t-il bien référencé sur Google ?", a: "Le site livré respecte les bonnes pratiques SEO : balises meta, structure sémantique, temps de chargement optimisé. Les fondations sont solides." },
  { q: "Quels types d'entreprises acceptez-vous ?", a: "Tous les secteurs : restaurants, artisans, professions de santé, commerces, associations, indépendants... Si vous avez une activité à mettre en valeur, je peux créer le site qui lui correspond." },
];

const included = [
  { icon: "🖥️", text: "Site complet jusqu'à 5 pages" },
  { icon: "🎨", text: "Design premium sur mesure" },
  { icon: "📱", text: "100% responsive mobile" },
  { icon: "🔍", text: "Optimisé SEO" },
  { icon: "📬", text: "Formulaire de contact" },
  { icon: "🖼️", text: "Galerie photos intégrée" },
  { icon: "⚡", text: "Livraison en 48h chrono" },
  { icon: "📦", text: "Fichiers sources complets" },
  { icon: "🛟", text: "1 mois de support inclus" },
  { icon: "✅", text: "Satisfait ou remboursé 7 jours" },
];

const skills = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "SEO", "Responsive", "UI Design"];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-5 flex items-center justify-between gap-4 text-left"
      >
        <span className="text-white text-sm font-medium leading-snug">{q}</span>
        <span className={`text-gray-500 flex-shrink-0 text-xl font-light transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-gray-400 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Middle() {
  return (
    <div className="relative overflow-hidden">

      {/* ══════════════════════════════════════
          SECTION 1 — About + Process (2 cols)
      ══════════════════════════════════════ */}
      <section className="py-20" id="alexandre">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* About */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-10"
            >
              <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs text-purple-300 border border-purple-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Qui suis-je ?
              </div>

              <h2 className="text-4xl font-black text-white mb-5 leading-tight">
                Alexandre,<br />
                <span className="gradient-text">développeur web.</span>
              </h2>

              <p className="text-gray-400 leading-relaxed mb-8">
                Lycéen de 16 ans, je me forme au développement web depuis plusieurs années et je souhaite
                exercer ce métier. Pour constituer mon portfolio et acquérir de l&apos;expérience, je propose
                mes services à des tarifs accessibles — sans compromis sur la qualité. Chaque site livré est
                une référence supplémentaire, et c&apos;est pourquoi je traite chaque commande avec autant
                d&apos;exigence qu&apos;un professionnel établi.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {skills.map(s => (
                  <span key={s} className="glass px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/10">
                    {s}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                {[
                  { v: "16 ans", l: "Développeur" },
                  { v: "48h", l: "Livraison" },
                  { v: "12+", l: "Sites livrés" },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <div className="text-2xl font-black gradient-text">{s.v}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass rounded-3xl p-10"
              id="comment"
            >
              <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs text-blue-300 border border-blue-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Processus simple
              </div>

              <h2 className="text-4xl font-black text-white mb-8 leading-tight">
                Comment<br />ça marche ?
              </h2>

              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-violet-500/40 via-purple-500/20 to-transparent" />

                <div className="space-y-7">
                  {steps.map((step, i) => (
                    <div key={step.n} className="flex gap-5 relative">
                      <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-lg flex-shrink-0 relative z-10"
                        style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                      >
                        {step.icon}
                      </div>
                      <div className="pt-1">
                        <div className="text-[10px] text-gray-600 font-mono tracking-widest mb-1">{step.n}</div>
                        <h4 className="text-white font-bold mb-1">{step.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Link
                  href="/commander"
                  className="btn-gradient px-7 py-3.5 rounded-full text-white font-bold text-sm inline-flex items-center gap-2"
                >
                  Démarrer — gratuit et sans engagement →
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — Pricing (full-width)
      ══════════════════════════════════════ */}
      <section className="py-20 relative" id="tarif">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/30 via-purple-950/20 to-violet-950/30 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs text-amber-300 border border-amber-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Tarif unique
            </div>
            <h2 className="text-5xl font-black text-white">
              Un seul prix. <span className="gradient-text">Tout inclus.</span>
            </h2>
          </motion.div>

          <div className="gradient-border rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-pink-600/10 rounded-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-[auto_1fr_auto] gap-10 items-center">

              {/* Price */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-3 mb-1">
                  <span className="glass px-3 py-1 rounded-full text-xs text-green-400 border border-green-400/20 font-semibold">🔥 Lancement</span>
                  <span className="text-gray-600 text-sm line-through">499 €</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-8xl font-black gradient-text leading-none">149</span>
                  <span className="text-3xl text-white font-bold">€</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Paiement unique · sans abonnement</p>
              </div>

              {/* Included items */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {included.map(item => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/commander"
                  className="btn-gradient px-8 py-5 rounded-2xl text-white font-bold text-lg whitespace-nowrap"
                >
                  Commander →
                </Link>
                <p className="text-gray-600 text-xs text-center">
                  Stripe · Remboursé si insatisfait
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FAQ (full-width)
      ══════════════════════════════════════ */}
      <section className="py-20" id="faq">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs text-pink-300 border border-pink-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              FAQ
            </div>
            <h2 className="text-5xl font-black text-white">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-x-16 glass rounded-3xl p-10">
            {[faqs.slice(0, 3), faqs.slice(3)].map((col, ci) => (
              <div key={ci}>
                {col.map((faq, i) => (
                  <FaqItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Une question hors liste ?{" "}
              <a href="mailto:alexandre.ammi38@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                alexandre.ammi38@gmail.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
