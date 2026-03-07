"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const items = [
  { icon: "💻", title: "Développeur passionné", desc: "Je code depuis l'âge de 8 ans. Le développement web est ma spécialité depuis plusieurs années." },
  { icon: "⚙️", title: "Technologies actuelles", desc: "Je maîtrise les dernières technologies web : Next.js, React, TypeScript, animations avancées." },
  { icon: "⚡", title: "Livraison en 48h", desc: "Votre site est livré en 48 heures. Efficace, sans délais inutiles, sans compromis sur la qualité." },
  { icon: "💰", title: "Tarif clair", desc: "149 € tout compris, sans surprise. Une agence vous facturerait 10 fois ce montant pour un résultat équivalent." },
];

export default function Story() {
  return (
    <section className="py-32 relative overflow-hidden" id="alexandre">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Avatar + Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Main card */}
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              {/* Gradient orb behind */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />

              {/* Skills visual */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 text-center">Compétences</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Next.js", "React", "TypeScript", "Tailwind CSS", "Design UI", "Node.js", "SEO", "Responsive"].map(skill => (
                    <span key={skill} className="glass px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
                {[
                  { value: "16 ans", label: "Développeur web" },
                  { value: "48h", label: "Délai de livraison" },
                  { value: "149 €", label: "Prix tout inclus" },
                  { value: "100%", label: "Satisfaction garantie" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-black gradient-text">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stats */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 glass px-5 py-4 rounded-2xl border border-white/10"
            >
              <div className="text-2xl font-black gradient-text">12+</div>
              <div className="text-xs text-gray-400">Sites livrés</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass px-5 py-4 rounded-2xl border border-white/10"
            >
              <div className="text-2xl font-black gradient-text">⭐ 5/5</div>
              <div className="text-xs text-gray-400">Note clients</div>
            </motion.div>
          </motion.div>

          {/* Right — Text + Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-purple-300 border border-purple-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Qui suis-je ?
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Alexandre,<br />
              <span className="gradient-text">développeur web.</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Lycéen de 16 ans, je me forme au développement web depuis plusieurs années et je souhaite
              exercer ce métier. Pour constituer mon portfolio et acquérir une expérience concrète,
              je propose mes services à des tarifs accessibles — sans compromis sur la qualité du rendu.
              Chaque site livré est une référence supplémentaire, et c&apos;est pourquoi je traite chaque
              commande avec autant d&apos;exigence qu&apos;un professionnel établi.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                  className="glass-hover p-4 rounded-2xl"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Link
                href="/commander"
                className="btn-gradient px-8 py-4 rounded-full text-white font-bold text-base inline-flex items-center gap-2"
              >
                Travailler avec moi →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
