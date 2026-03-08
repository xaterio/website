"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OrderData } from "@/types";
import QuizStep1 from "@/components/order/QuizStep1";
import QuizStep2 from "@/components/order/QuizStep2";
import QuizStep3 from "@/components/order/QuizStep3";
import QuizStep4 from "@/components/order/QuizStep4";
import QuizStep5 from "@/components/order/QuizStep5";
import QuizStep6Chat from "@/components/order/QuizStep6Chat";
import QuizStep6 from "@/components/order/QuizStep6";

const TOTAL_STEPS = 7;

const stepLabels = [
  "Activité",
  "Style",
  "Pages",
  "Infos",
  "Contenu",
  "Perso",
  "Commande",
];

const canProceed = (step: number, data: OrderData): boolean => {
  if (step === 1) return !!data.businessType;
  if (step === 2) return !!data.style;
  if (step === 3) return (data.pages || []).length > 0;
  if (step === 4) return !!(data.businessName && data.description);
  if (step === 5) return true;
  if (step === 6) return true;
  if (step === 7) return !!(data.clientEmail && data.clientName);
  return false;
};

export default function CommanderPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OrderData>({});
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const updateData = (partial: Partial<OrderData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erreur inconnue");

      window.location.href = resData.url;
    } catch (err) {
      console.error(err);
      alert("Erreur : " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;


  return (
    <div className="min-h-screen gradient-mesh py-8 px-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl animate-pulse-glow" style={{animationDelay:'1.5s'}} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <span className="font-bold text-white">Alexandre<span className="gradient-text">Dev</span></span>
          </Link>
          <div className="glass px-4 py-2 rounded-full text-xs text-gray-400">
            Étape <span className="text-white font-bold">{step}</span> / {TOTAL_STEPS}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          {/* Step labels */}
          <div className="flex justify-between mb-4">
            {stepLabels.map((label, i) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-2 ${i + 1 <= step ? "text-white" : "text-gray-600"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i + 1 < step
                      ? "step-done text-white"
                      : i + 1 === step
                      ? "step-active text-white"
                      : "glass text-gray-600"
                  }`}
                >
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="text-xs hidden sm:block">{label}</span>
              </div>
            ))}
          </div>

          {/* Bar */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #7c3aed, #3b82f6, #ec4899)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="glass rounded-3xl p-8 md:p-10 min-h-[450px] relative overflow-hidden">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 to-blue-600/3 rounded-3xl pointer-events-none" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative"
            >
              {step === 1 && <QuizStep1 data={data} onChange={updateData} />}
              {step === 2 && <QuizStep2 data={data} onChange={updateData} />}
              {step === 3 && <QuizStep3 data={data} onChange={updateData} />}
              {step === 4 && <QuizStep4 data={data} onChange={updateData} />}
              {step === 5 && <QuizStep5 data={data} onChange={updateData} />}
              {step === 6 && <QuizStep6Chat data={data} onChange={updateData} />}
              {step === 7 && <QuizStep6 data={data} onChange={updateData} onSubmit={handleSubmit} loading={loading} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 7 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goPrev}
              disabled={step === 1}
              className={`btn-outline px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                step === 1 ? "opacity-0 pointer-events-none" : "text-white"
              }`}
            >
              ← Précédent
            </button>

            <button
              onClick={goNext}
              disabled={!canProceed(step, data)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                canProceed(step, data)
                  ? "btn-gradient text-white"
                  : "glass text-gray-600 cursor-not-allowed"
              }`}
            >
              {step === 6 ? "Finaliser ma commande →" : "Continuer →"}
            </button>
          </div>
        )}

        {step < 7 && (
          <p className="text-center text-gray-700 text-xs mt-4">
            {step >= 5 ? "Ces champs sont optionnels" : "Cliquez sur une option pour continuer"}
          </p>
        )}
      </div>
    </div>
  );
}
