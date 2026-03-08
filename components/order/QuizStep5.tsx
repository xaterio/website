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

  if (!isResto) {
    return (
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          Presque terminé !
        </h2>
        <p className="text-gray-400 mb-8">
          Vos informations sont complètes. Cliquez sur &ldquo;Finaliser&rdquo; pour passer à la commande.
        </p>
        <div className="glass rounded-2xl p-8 border border-white/5 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-white font-bold text-lg">Tout est prêt !</p>
          <p className="text-gray-400 text-sm mt-2">Nous allons créer votre site sur mesure.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Votre carte / menu
      </h2>
      <p className="text-gray-400 mb-8">
        Listez vos plats et prix. Plus c&apos;est détaillé, plus le site sera précis.
        Si vous n&apos;avez pas encore de menu, laissez vide — on inventera un menu réaliste.
      </p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Vos plats et prix (format libre)
        </label>
        <textarea
          value={data.menuText || ""}
          onChange={(e) => onChange({ menuText: e.target.value })}
          placeholder={`Exemple :
Entrées :
- Bruschetta tomate/basilic — 7€
- Carpaccio de bœuf — 12€

Pizzas :
- Margherita — 11€
- 4 fromages — 13€

Desserts :
- Tiramisu maison — 7€`}
          rows={14}
          className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 border border-white/5 transition-colors resize-none"
        />
        <p className="text-gray-600 text-xs mt-2">
          Vous pouvez aussi décrire des catégories, ingrédients, allergènes, etc.
        </p>
      </motion.div>
    </div>
  );
}
