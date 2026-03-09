"use client";

import { motion } from "framer-motion";
import { OrderData } from "@/types";

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

const fields = [
  { key: "businessName", label: "Nom de votre entreprise *", placeholder: "Ex: Bistrot Le Soleil", required: true },
  { key: "foundedYear", label: "Année de création de l'entreprise", placeholder: "Ex: 2018", required: false },
  { key: "slogan", label: "Slogan ou accroche", placeholder: "Ex: La tradition au cœur de votre assiette", required: false },
  { key: "description", label: "Description de votre activité *", placeholder: "Décrivez ce que vous faites, vos spécialités, ce qui vous rend unique...", required: true, multiline: true },
  { key: "address", label: "Adresse", placeholder: "Ex: 12 rue des Fleurs, 69001 Lyon", required: false },
  { key: "phone", label: "Téléphone", placeholder: "Ex: 04 78 12 34 56", required: false },
  { key: "email", label: "Email de contact (affiché sur le site)", placeholder: "Ex: contact@monbusiness.fr", required: false },
] as const;

export default function QuizStep4({ data, onChange }: Props) {
  const handleChange = (key: string, value: string) => {
    onChange({ [key]: value });
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Parlez-nous de votre business
      </h2>
      <p className="text-gray-400 mb-8">
        Ces informations seront intégrées directement dans votre site.
        Plus vous en donnez, meilleur sera le résultat.
      </p>

      <div className="space-y-5 max-w-2xl">
        {fields.map((field, i) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
            </label>
            {"multiline" in field && field.multiline ? (
              <textarea
                value={(data as Record<string, string>)[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 border border-white/5 transition-colors resize-none"
              />
            ) : (
              <input
                type="text"
                value={(data as Record<string, string>)[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 border border-white/5 transition-colors"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
