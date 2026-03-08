"use client";

import { motion } from "framer-motion";
import { OrderData } from "@/types";

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

const RESTAURANT_TYPES = ["restaurant", "boulangerie", "cafe", "traiteur", "pizzeria", "bar"];

export default function QuizStep5({ data, onChange }: Props) {
  const isResto = RESTAURANT_TYPES.some(t =>
    (data.businessType || "").toLowerCase().includes(t) ||
    (data.businessTypeLabel || "").toLowerCase().includes(t)
  );

  const testimonials = data.testimonials || [
    { name: "", city: "", text: "" },
    { name: "", city: "", text: "" },
    { name: "", city: "", text: "" },
  ];

  const updateTesti = (index: number, field: "name" | "city" | "text", value: string) => {
    const updated = testimonials.map((t, i) => i === index ? { ...t, [field]: value } : t);
    onChange({ testimonials: updated });
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Votre contenu
      </h2>
      <p className="text-gray-400 mb-8">
        Renseignez vos vraies informations — le site sera fidèle à ce que vous mettez ici.
      </p>

      {isResto && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <label className="block text-sm font-bold text-white mb-1">
            🍽️ Votre carte / menu
          </label>
          <p className="text-gray-500 text-xs mb-3">Listez vos plats et prix. Laissez vide si vous n&apos;avez pas encore de menu.</p>
          <textarea
            value={data.menuText || ""}
            onChange={(e) => onChange({ menuText: e.target.value })}
            placeholder={`Entrées :\n- Bruschetta tomate/basilic — 7€\n\nPizzas :\n- Margherita — 11€\n- 4 fromages — 13€\n\nDesserts :\n- Tiramisu maison — 7€`}
            rows={10}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none border border-white/5 focus:border-purple-500/50 transition-colors resize-none"
          />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <label className="block text-sm font-bold text-white mb-1">
          ⭐ Avis clients réels <span className="text-gray-500 font-normal">(optionnel)</span>
        </label>
        <p className="text-gray-500 text-xs mb-4">
          Si vous avez de vrais avis clients, ajoutez-les ici — sinon la section sera supprimée du site.
        </p>

        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/5">
              <p className="text-xs text-gray-500 mb-3 font-semibold">Avis {i + 1}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Prénom et initiale (ex: Marie L.)"
                  value={testimonials[i]?.name || ""}
                  onChange={(e) => updateTesti(i, "name", e.target.value)}
                  className="glass rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm border border-white/5 focus:border-purple-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={testimonials[i]?.city || ""}
                  onChange={(e) => updateTesti(i, "city", e.target.value)}
                  className="glass rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm border border-white/5 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Le texte de l'avis..."
                value={testimonials[i]?.text || ""}
                onChange={(e) => updateTesti(i, "text", e.target.value)}
                rows={2}
                className="w-full glass rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm border border-white/5 focus:border-purple-500/50 focus:outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chatbox — uniquement pour les non-restaurants */}
      {!isResto && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Décrivez votre site idéal</p>
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
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <p className="text-gray-600 text-xs text-right">Optionnel · Plus vous détaillez, meilleur sera le résultat</p>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
