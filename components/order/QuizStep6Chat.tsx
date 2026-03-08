"use client";

import { motion } from "framer-motion";
import { OrderData } from "@/types";

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

export default function QuizStep6Chat({ data, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Personnalisation
      </h2>
      <p className="text-gray-400 mb-8">
        Dites-nous exactement ce que vous voulez — l&apos;IA suivra vos instructions à la lettre.
      </p>

      {/* Wants / Don't wants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block text-sm font-bold text-white mb-2">
            ✅ Ce que vous voulez <span className="text-green-400">absolument</span>
          </label>
          <textarea
            value={data.customWants || ""}
            onChange={(e) => onChange({ customWants: e.target.value })}
            placeholder={"Ex : mets en avant nos 10 ans d'expérience, ton chaleureux et familial, section certifications..."}
            rows={4}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none border border-green-500/20 focus:border-green-500/50 transition-colors resize-none"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-bold text-white mb-2">
            ❌ Ce que vous <span className="text-red-400">ne voulez pas</span>
          </label>
          <textarea
            value={data.customDontWants || ""}
            onChange={(e) => onChange({ customDontWants: e.target.value })}
            placeholder={"Ex : pas de section blog, pas de couleur rose, pas de tournures trop formelles..."}
            rows={4}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none border border-red-500/20 focus:border-red-500/50 transition-colors resize-none"
          />
        </motion.div>
      </div>

      {/* Complement chatbox */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Complément</p>
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              A
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Alex IA</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                <span className="text-green-400 text-xs">En ligne</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Bot message */}
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                A
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs md:max-w-sm" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                <p className="text-white text-sm leading-relaxed">
                  Bonjour ! 👋 Décrivez librement votre site idéal ici — l&apos;ambiance, les sections importantes, un concurrent dont vous aimez le site, vos clients cibles... Tout ce que vous me donnez me permet de créer quelque chose de vraiment unique pour vous.
                </p>
              </div>
            </div>

            {/* User input */}
            <div className="flex gap-3 items-end justify-end">
              <textarea
                value={data.freeDescription || ""}
                onChange={(e) => onChange({ freeDescription: e.target.value })}
                placeholder="Écrivez votre message... Ex : Je voudrais un site sobre et moderne avec une ambiance haut de gamme. Mes clients sont des professionnels entre 30 et 50 ans. J'aime le style du site de [concurrent]. La section la plus importante c'est le contact..."
                rows={5}
                className="flex-1 rounded-2xl rounded-br-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none resize-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <p className="text-gray-600 text-xs text-right">Optionnel · Plus vous détaillez, meilleur sera le résultat</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
