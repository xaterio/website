"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "📋",
    title: "Complétez le quiz",
    desc: "En 5 minutes, vous nous décrivez votre activité, le style souhaité et les pages à inclure. Nous gérons le reste.",
    color: "from-violet-600 to-purple-600",
    glowColor: "rgba(124, 58, 237, 0.3)",
  },
  {
    number: "02",
    icon: "💳",
    title: "Paiement sécurisé",
    desc: "Réglez 149 € via Stripe, la plateforme de paiement de référence. Remboursement intégral sous 7 jours si insatisfait.",
    color: "from-blue-600 to-cyan-600",
    glowColor: "rgba(59, 130, 246, 0.3)",
  },
  {
    number: "03",
    icon: "⚡",
    title: "Création du site",
    desc: "Je développe votre site sur mesure avec les dernières technologies web : design soigné, entièrement responsive, adapté à votre secteur.",
    color: "from-pink-600 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  {
    number: "04",
    icon: "🚀",
    title: "Livraison sous 48h",
    desc: "Vous recevez votre site par email avec les fichiers sources complets. Mise en ligne disponible sur demande.",
    color: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
];

export default function Process() {
  return (
    <section className="py-32 relative overflow-hidden" id="comment">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-blue-300 border border-blue-500/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Processus simple
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            Comment ça marche ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl max-w-xl mx-auto"
          >
            4 étapes, moins de 5 minutes de votre temps. Votre site vous est livré sous 48 heures.
          </motion.p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
              )}

              <div className="glass-hover rounded-2xl p-6 h-full">
                {/* Step number */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}
                  style={{ boxShadow: `0 0 20px ${step.glowColor}` }}>
                  {step.icon}
                </div>

                {/* Number badge */}
                <div className="text-xs font-mono text-gray-600 mb-2">{step.number}</div>

                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/commander"
            className="btn-gradient px-10 py-5 rounded-full text-white font-bold text-lg inline-flex items-center gap-3"
          >
            <span>Démarrer le quiz — gratuit et sans engagement</span>
            <span className="text-xl">→</span>
          </Link>
          <p className="text-gray-600 text-sm mt-4">Aucun engagement · Paiement sécurisé · Satisfait ou remboursé</p>
        </motion.div>
      </div>
    </section>
  );
}
