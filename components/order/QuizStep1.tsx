"use client";

import { motion } from "framer-motion";
import { OrderData, BusinessType } from "@/types";

const businesses: { value: BusinessType; label: string; icon: string; desc: string }[] = [
  { value: "restaurant", label: "Restaurant / Café", icon: "🍽️", desc: "Bistrot, brasserie, fast-food, bar..." },
  { value: "artisan", label: "Artisan / Métier", icon: "🔨", desc: "Plombier, électricien, peintre, menuisier..." },
  { value: "medecin", label: "Médecin / Santé", icon: "🏥", desc: "Médecin, dentiste, kiné, psychologue..." },
  { value: "coiffeur", label: "Beauté / Bien-être", icon: "💇", desc: "Coiffeur, esthéticienne, spa, nail art..." },
  { value: "commerce", label: "Commerce / Boutique", icon: "🛍️", desc: "Boutique physique, vitrine en ligne, marché..." },
  { value: "association", label: "Association / ONG", icon: "🤝", desc: "Association, club sportif, ONG..." },
  { value: "autre", label: "Autre activité", icon: "✨", desc: "Coach, consultant, auto-entrepreneur..." },
];

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

export default function QuizStep1({ data, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Quel type d&apos;activité avez-vous ?
      </h2>
      <p className="text-gray-400 mb-8">
        Choisissez la catégorie qui correspond le mieux à votre business.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {businesses.map((biz, i) => (
          <motion.button
            key={biz.value}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onChange({ businessType: biz.value, businessTypeLabel: biz.label })}
            className={`option-card rounded-2xl p-4 text-left ${
              data.businessType === biz.value ? "selected" : ""
            }`}
          >
            <div className="text-3xl mb-3">{biz.icon}</div>
            <div className="text-white font-semibold text-sm mb-1">{biz.label}</div>
            <div className="text-gray-500 text-xs">{biz.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
