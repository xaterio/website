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
        Décrivez votre site idéal
      </h2>
      <p className="text-gray-400 mb-8">
        Plus vous détaillez, meilleur sera le résultat. Parlez-nous de l&apos;ambiance, des sections importantes, de vos clients cibles...
      </p>

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
          {/* Bot messages */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              A
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <p className="text-white text-sm leading-relaxed">
                Bonjour ! 👋 Décrivez-moi votre site idéal — je vais le créer exactement comme vous l&apos;imaginez.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              A
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <p className="text-white text-sm leading-relaxed">
                Par exemple : l&apos;ambiance souhaitée, les sections importantes, un concurrent dont vous aimez le site, vos clients cibles, ce que vous ne voulez surtout pas...
              </p>
            </div>
          </motion.div>

          {/* User input */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3 items-end justify-end">
            <textarea
              value={data.freeDescription || ""}
              onChange={(e) => onChange({ freeDescription: e.target.value })}
              placeholder="Écrivez ici... Ex : Je veux un site sobre et haut de gamme, avec une ambiance sérieuse mais chaleureuse. Mes clients sont des professionnels entre 35 et 55 ans. La section contact doit être très visible. Pas de couleurs trop vives. J'aime le style épuré de [concurrent]..."
              rows={7}
              className="flex-1 rounded-2xl rounded-br-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none resize-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </motion.div>

          <p className="text-gray-600 text-xs text-right">Optionnel · Plus vous détaillez, meilleur sera le résultat</p>
        </div>
      </div>
    </div>
  );
}
