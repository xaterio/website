"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    q: "Comment ça se passe concrètement après le paiement ?",
    a: "Dès que votre paiement est confirmé, notre IA génère votre site sur la base de vos réponses au quiz. Vous recevez sous 48 heures un email avec le lien de prévisualisation et les fichiers sources. Si le résultat ne vous convient pas, vous êtes remboursé intégralement.",
  },
  {
    q: "Mon site sera-t-il vraiment personnalisé ?",
    a: "Oui. L'IA génère le code de votre site à partir de vos informations, votre secteur, vos photos et le style que vous avez choisi. Ce n'est pas un template — chaque site est créé spécifiquement pour vous.",
  },
  {
    q: "Pouvez-vous vous occuper de l'hébergement ?",
    a: "Oui, pour 10 € supplémentaires je m'occupe de mettre votre site en ligne avec un nom de domaine .fr inclus pour un an. Vous n'avez rien à gérer techniquement.",
  },
  {
    q: "Des modifications sont-elles possibles après livraison ?",
    a: "Le tarif inclut un mois de support avec des ajustements mineurs (textes, couleurs, images). Pour des modifications plus importantes, nous convenons ensemble d'un devis adapté.",
  },
  {
    q: "Quels types d'entreprises acceptez-vous ?",
    a: "Tous les secteurs : restaurants, artisans, professions de santé, commerces, associations, indépendants... Si vous avez une activité à mettre en valeur, je peux créer le site qui lui correspond.",
  },
  {
    q: "Pourquoi votre tarif est-il si bas par rapport à une agence ?",
    a: "J'ai 16 ans et je n'ai pas les charges d'une agence — pas de loyer, pas de structure. L'IA me permet par ailleurs de produire un travail de qualité professionnelle en un temps réduit. Ce modèle me permet de proposer des tarifs accessibles tout en livrant un résultat sérieux.",
  },
  {
    q: "Mon site sera-t-il référencé sur Google ?",
    a: "Le site livré respecte les bonnes pratiques SEO : balises meta, structure sémantique, temps de chargement optimisé. Le référencement naturel prend quelques semaines à s'établir, mais les fondations sont solides.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-white font-semibold text-sm pr-4">{q}</span>
        <span
          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 text-lg ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-400 text-sm leading-relaxed px-6 pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="py-32 relative" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-green-300 border border-green-500/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Questions fréquentes
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white"
          >
            Tu as des <span className="gradient-text">questions ?</span>
          </motion.h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 mt-10 text-center border border-white/5"
        >
          <p className="text-white font-bold text-lg mb-2">Une question pas dans la liste ?</p>
          <p className="text-gray-400 text-sm mb-4">Écris-moi directement, je réponds en moins de 24h.</p>
          <a
            href="mailto:alexandre.ammi38@gmail.com"
            className="btn-gradient px-6 py-3 rounded-full text-white font-semibold text-sm inline-flex items-center gap-2"
          >
            ✉️ Envoyer un message
          </a>
        </motion.div>
      </div>
    </section>
  );
}
