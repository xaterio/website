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

    </div>
  );
}
