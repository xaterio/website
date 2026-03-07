"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaBottom() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Big glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-blue-600/20 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="gradient-border rounded-3xl p-12 md:p-16 relative overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-pink-600/5 rounded-3xl" />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-purple-400 font-semibold mb-4 tracking-wider uppercase"
          >
            Prêt à vous lancer ?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
          >
            Votre site web<br />
            <span className="gradient-text">en 48 heures.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-xl mb-10 max-w-lg mx-auto"
          >
            149€ · Design premium · Mobile first · Livraison garantie
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/commander"
              className="btn-gradient px-10 py-5 rounded-full text-white font-bold text-lg inline-flex items-center justify-center gap-2"
            >
              Démarrer maintenant — 149€
              <span className="text-xl">→</span>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65 }}
            className="text-gray-600 text-sm mt-6"
          >
            Satisfait ou remboursé · Paiement sécurisé · Aucun abonnement
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
