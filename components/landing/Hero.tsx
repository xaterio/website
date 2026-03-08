"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const reviews = [
  { initial: "M", color: "#7c3aed", name: "Marie L.", city: "Lyon", text: "Site livré en 24h chrono, exactement ce que je voulais. Je recommande à 100% !", stars: 5 },
  { initial: "S", color: "#3b82f6", name: "Sébastien R.", city: "Bordeaux", text: "Design très moderne et professionnel. Mes clients me complimentent sur mon site.", stars: 5 },
  { initial: "L", color: "#ec4899", name: "Laure D.", city: "Paris", text: "Mes clients adorent le résultat ! Le site est rapide, beau et facile à utiliser.", stars: 5 },
  { initial: "T", color: "#10b981", name: "Thomas B.", city: "Marseille", text: "Rapport qualité/prix imbattable. Pour 149€ j'ai un site que j'aurais payé 2000€ ailleurs.", stars: 5 },
  { initial: "N", color: "#f97316", name: "Nadia K.", city: "Grenoble", text: "Très réactif et à l'écoute. Il a su comprendre exactement ce que je voulais.", stars: 5 },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, []);

  const r = reviews[current];

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

          <div className="flex items-center gap-3 glass px-5 py-3 rounded-full border border-white/10 text-sm text-gray-400">
            <span className="text-yellow-400">★★★★★</span>
            <span><span className="text-white font-semibold">+12 clients</span> satisfaits</span>
          </div>
        </motion.div>

        {/* Avis clients — grande section défilante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-6 border border-white/10 text-left"
            >
              <div className="text-yellow-400 text-lg mb-3">★★★★★</div>
              <p className="text-white text-base leading-relaxed mb-4">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: r.color }}>
                  {r.initial}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{r.name}</div>
                  <div className="text-gray-500 text-xs">{r.city}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Points indicateurs */}
          <div className="flex justify-center gap-2 mt-4">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: i === current ? "#a78bfa" : "rgba(255,255,255,0.15)", transform: i === current ? "scale(1.4)" : "scale(1)" }}
              />
            ))}
          </div>
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

      </div>
    </section>
  );
}
