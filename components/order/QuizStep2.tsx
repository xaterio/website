"use client";

import { motion } from "framer-motion";
import { OrderData, StylePreference } from "@/types";

const styles: { value: StylePreference; label: string; desc: string; preview: { bg: string; accent: string; font: string } }[] = [
  {
    value: "moderne",
    label: "Moderne & Tech",
    desc: "Dark mode, gradients, ultra contemporain",
    preview: { bg: "#0d1117", accent: "#6366f1", font: "bold" },
  },
  {
    value: "elegant",
    label: "Élégant & Luxe",
    desc: "Noir & or, typographie fine, raffiné",
    preview: { bg: "#1a1409", accent: "#d97706", font: "light" },
  },
  {
    value: "colore",
    label: "Coloré & Dynamique",
    desc: "Couleurs vives, fun, plein d'énergie",
    preview: { bg: "#0f0a1a", accent: "#ec4899", font: "bold" },
  },
  {
    value: "minimaliste",
    label: "Minimaliste & Clean",
    desc: "Blanc, épuré, essentiel, élégance simple",
    preview: { bg: "#fafafa", accent: "#1f2937", font: "regular" },
  },
  {
    value: "nature",
    label: "Nature & Zen",
    desc: "Vert, bois, doux, écologique, apaisant",
    preview: { bg: "#0d1a0d", accent: "#4ade80", font: "regular" },
  },
  {
    value: "tech",
    label: "Professionnel & Corporate",
    desc: "Bleu, sérieux, confiance, B2B",
    preview: { bg: "#040d1f", accent: "#3b82f6", font: "medium" },
  },
];

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

export default function QuizStep2({ data, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Quelle ambiance pour votre site ?
      </h2>
      <p className="text-gray-400 mb-8">
        Choisissez le style qui correspond à l&apos;image que vous voulez donner.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {styles.map((style, i) => (
          <motion.button
            key={style.value}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onChange({ style: style.value, styleLabel: style.label })}
            className={`option-card rounded-2xl overflow-hidden text-left ${
              data.style === style.value ? "selected" : ""
            }`}
          >
            {/* Style preview */}
            <div
              className="h-20 relative overflow-hidden"
              style={{ background: style.preview.bg }}
            >
              {/* Fake elements */}
              <div className="absolute top-3 left-3 right-3">
                <div className="h-2 w-16 rounded mb-2" style={{ background: style.preview.accent + "cc" }} />
                <div className="h-1.5 w-24 rounded mb-1" style={{ background: style.preview.accent + "44" }} />
                <div className="h-1.5 w-20 rounded" style={{ background: style.preview.accent + "22" }} />
              </div>
              <div
                className="absolute bottom-3 left-3 h-5 w-14 rounded-full"
                style={{ background: style.preview.accent }}
              />
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="text-white font-semibold text-sm mb-1">{style.label}</div>
              <div className="text-gray-500 text-xs">{style.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
