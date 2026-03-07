"use client";

import { motion } from "framer-motion";
import { OrderData } from "@/types";

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function QuizStep6({ data, onChange, onSubmit, loading }: Props) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Dernière étape — On y est presque !
      </h2>
      <p className="text-gray-400 mb-8">
        Entrez votre email pour recevoir votre site web. Vous paierez sur la page suivante.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Votre prénom *
            </label>
            <input
              type="text"
              value={data.clientName || ""}
              onChange={(e) => onChange({ clientName: e.target.value })}
              placeholder="Ex: Marie"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none border border-white/5 focus:border-purple-500/50 transition-colors"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Votre email *
            </label>
            <input
              type="email"
              value={data.clientEmail || ""}
              onChange={(e) => onChange({ clientEmail: e.target.value })}
              placeholder="Ex: marie@monbusiness.fr"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none border border-white/5 focus:border-purple-500/50 transition-colors"
            />
            <p className="text-gray-600 text-xs mt-1.5">
              Votre site vous sera envoyé à cette adresse.
            </p>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-white font-bold mb-4">Récapitulatif de votre commande</h3>

          <div className="space-y-3 text-sm">
            {data.businessTypeLabel && (
              <div className="flex justify-between">
                <span className="text-gray-500">Activité</span>
                <span className="text-white">{data.businessTypeLabel}</span>
              </div>
            )}
            {data.styleLabel && (
              <div className="flex justify-between">
                <span className="text-gray-500">Style</span>
                <span className="text-white">{data.styleLabel}</span>
              </div>
            )}
            {data.pages && data.pages.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Pages</span>
                <span className="text-white">{data.pages.length} page(s)</span>
              </div>
            )}
            {data.businessName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Entreprise</span>
                <span className="text-white">{data.businessName}</span>
              </div>
            )}
            {data.photos && data.photos.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Photos</span>
                <span className="text-white">{data.photos.length} photo(s)</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
            <span className="text-white font-semibold">Total</span>
            <div className="text-right">
              <div className="text-3xl font-black gradient-text">149€</div>
              <div className="text-gray-600 text-xs">paiement unique</div>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={loading || !data.clientEmail || !data.clientName}
            className={`w-full mt-5 py-4 rounded-2xl text-white font-bold text-base transition-all ${
              loading || !data.clientEmail || !data.clientName
                ? "bg-white/10 cursor-not-allowed text-gray-500"
                : "btn-gradient"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                Redirection vers le paiement...
              </span>
            ) : (
              "Payer 149€ et commander →"
            )}
          </button>

          <p className="text-center text-gray-600 text-xs mt-3">
            🔒 Paiement sécurisé via Stripe · Remboursement 7 jours
          </p>
        </motion.div>
      </div>
    </div>
  );
}
