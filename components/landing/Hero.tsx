"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse-glow" style={{animationDelay:'1.5s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-300">Disponible pour nouveaux projets</span>
          <span className="gradient-text font-semibold">→ Livraison en 48h</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6"
        >
          Votre site web.<br />
          <span className="gradient-text">Livré en 48 heures.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Je m&apos;appelle Alexandre, j&apos;ai 16 ans, je suis lycéen et passionné de développement web.
          Je cherche à construire mon expérience professionnelle en proposant mes services à des entreprises
          qui n&apos;ont pas encore de présence en ligne — avec le même niveau d&apos;exigence qu&apos;un professionnel,{" "}
          <span className="text-white font-semibold">à un tarif que vous ne trouverez nulle part ailleurs.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            href="/commander"
            className="btn-gradient px-8 py-4 rounded-full text-white font-bold text-lg inline-flex items-center gap-2"
          >
            Commencer maintenant
            <span className="text-xl">→</span>
          </Link>
          <a
            href="#exemples"
            className="btn-outline px-8 py-4 rounded-full text-white font-semibold text-lg inline-flex items-center gap-2"
          >
            Voir les exemples
            <span>↓</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { value: "48h", label: "Délai de livraison", delay: 0 },
            { value: "149€", label: "Prix tout inclus", delay: 0.15 },
            { value: "100%", label: "Satisfaction garantie", delay: 0.3 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6 + stat.delay, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating mockup cards */}
        <div className="mt-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative max-w-3xl mx-auto"
          >
            {/* Browser mockup */}
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {/* Browser bar */}
              <div className="bg-white/5 px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-white/5 rounded-full px-4 py-1 text-xs text-gray-500 text-center">
                  monbusiness.fr
                </div>
              </div>
              {/* Fake website content */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-48 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-1 bg-purple-400/50 rounded" />
                <div className="w-48 h-8 bg-white/10 rounded-lg shimmer" />
                <div className="w-64 h-3 bg-white/5 rounded" />
                <div className="w-56 h-3 bg-white/5 rounded" />
                <div className="flex gap-3 mt-2">
                  <div className="w-24 h-8 rounded-full bg-purple-500/40" />
                  <div className="w-24 h-8 rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            {/* Floating badges around the mockup */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-8 top-1/3 glass px-3 py-2 rounded-xl text-xs font-semibold text-green-400 border border-green-400/20 hidden md:block"
            >
              ✓ Responsive mobile
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -right-8 top-1/4 glass px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 border border-blue-400/20 hidden md:block"
            >
              ⚡ Ultra rapide
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 bottom-1/4 glass px-3 py-2 rounded-xl text-xs font-semibold text-purple-400 border border-purple-400/20 hidden md:block"
            >
              🎨 Design premium
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
