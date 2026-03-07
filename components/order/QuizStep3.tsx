"use client";

import { motion } from "framer-motion";
import { OrderData, PageType } from "@/types";

const pages: { value: PageType; label: string; icon: string; desc: string; recommended?: boolean }[] = [
  { value: "accueil", label: "Accueil", icon: "🏠", desc: "Page principale, obligatoire", recommended: true },
  { value: "a-propos", label: "À propos", icon: "👤", desc: "Votre histoire, qui vous êtes" },
  { value: "services", label: "Services / Prestations", icon: "⚙️", desc: "Ce que vous proposez" },
  { value: "galerie", label: "Galerie photos", icon: "🖼️", desc: "Photos de vos réalisations" },
  { value: "menu", label: "Menu / Carte", icon: "📋", desc: "Pour restaurants, cafés..." },
  { value: "contact", label: "Contact", icon: "📬", desc: "Formulaire + carte", recommended: true },
  { value: "blog", label: "Blog / Actualités", icon: "✍️", desc: "Articles et actualités" },
  { value: "reservation", label: "Réservation / RDV", icon: "📅", desc: "Prise de rendez-vous en ligne" },
];

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

export default function QuizStep3({ data, onChange }: Props) {
  const selected = data.pages || [];

  const toggle = (page: PageType) => {
    if (selected.includes(page)) {
      onChange({ pages: selected.filter((p) => p !== page) });
    } else {
      onChange({ pages: [...selected, page] });
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Quelles pages voulez-vous ?
      </h2>
      <p className="text-gray-400 mb-8">
        Sélectionnez toutes les pages souhaitées. Minimum recommandé : Accueil + Contact.{" "}
        <span className="text-purple-400">{selected.length} page(s) sélectionnée(s)</span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pages.map((page, i) => (
          <motion.button
            key={page.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => toggle(page.value)}
            className={`option-card rounded-2xl p-4 text-left relative ${
              selected.includes(page.value) ? "selected" : ""
            }`}
          >
            {page.recommended && (
              <span className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                Recommandé
              </span>
            )}
            <div className="text-2xl mb-2">{page.icon}</div>
            <div className="text-white font-semibold text-sm mb-1">{page.label}</div>
            <div className="text-gray-500 text-xs">{page.desc}</div>
            {selected.includes(page.value) && (
              <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {selected.length > 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-amber-400 text-sm"
        >
          ⚠️ Plus de 5 pages : un délai supplémentaire de 24h peut s&apos;appliquer.
        </motion.p>
      )}
    </div>
  );
}
