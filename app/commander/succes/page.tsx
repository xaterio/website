"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const email = params.get("email") || "votre email";

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto text-center relative">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(74, 222, 128, 0.4)" }}
        >
          <span className="text-5xl">✓</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-black text-white mb-4"
        >
          Commande confirmée ! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg mb-8 leading-relaxed"
        >
          Merci pour votre confiance ! Notre IA est en train de créer votre site web.
          Vous recevrez votre site à{" "}
          <span className="text-white font-semibold">{email}</span>{" "}
          dans les <span className="gradient-text font-bold">48 heures</span>.
        </motion.p>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 mb-8 text-left"
        >
          <h3 className="text-white font-bold mb-4">Ce qui se passe maintenant :</h3>
          <div className="space-y-3">
            {[
              { icon: "🤖", text: "Notre IA analyse vos informations et génère votre site", time: "En cours" },
              { icon: "✉️", text: "Vous recevrez un email avec le lien de prévisualisation", time: "< 48h" },
              { icon: "🚀", text: "Une fois validé, votre site est mis en ligne", time: "Sur demande" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
                <span className="text-xs text-purple-400 font-semibold whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="btn-outline px-6 py-3 rounded-full text-white font-semibold text-sm"
          >
            ← Retour à l&apos;accueil
          </Link>
          <a
            href="mailto:alexandre.ammi38@gmail.com"
            className="btn-gradient px-6 py-3 rounded-full text-white font-semibold text-sm"
          >
            ✉️ Nous contacter
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-mesh flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" />
    </div>}>
      <SuccessContent />
    </Suspense>
  );
}
