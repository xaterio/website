"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function RevisionChat({ orderId }: { orderId: string }) {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [emailConfirmed, setEmailConfirmed] = useState(!!params.get("email"));
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Bonjour ! Décrivez-moi la modification que vous souhaitez apporter à votre site. Je vais transmettre votre demande et vous enverrai le site mis à jour par email dans quelques minutes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || sent) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/revise-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email, request: userMsg }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Votre demande a bien été reçue ! Je suis en train de modifier votre site. Vous recevrez un email avec le site mis à jour dans quelques minutes. Vous pouvez fermer cette fenêtre.",
        },
      ]);
      setSent(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Désolé, une erreur est survenue : ${err instanceof Error ? err.message : "Erreur inconnue"}. Réessayez ou contactez alexandre.ammi38@gmail.com.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!emailConfirmed) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <div className="glass rounded-3xl p-8 max-w-sm w-full">
          <h2 className="text-white font-black text-xl mb-2">Confirmer votre email</h2>
          <p className="text-gray-400 text-sm mb-6">Entrez l&apos;email utilisé lors de votre commande.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) setEmailConfirmed(true); }}
            placeholder="votre@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm mb-4"
          />
          <button
            onClick={() => email.trim() && setEmailConfirmed(true)}
            className="w-full btn-gradient px-5 py-3 rounded-xl text-white font-bold text-sm"
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh flex flex-col py-6 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/mes-sites?email=${encodeURIComponent(email)}`} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Mes sites
          </Link>
          <span className="font-bold text-white text-sm">
            Alexandre<span className="gradient-text">Dev</span>
          </span>
        </div>

        <div className="glass rounded-3xl flex flex-col overflow-hidden" style={{ minHeight: "500px" }}>
          {/* Chat header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center text-white font-black text-sm">A</div>
              <div>
                <p className="text-white font-bold text-sm">Alexandre</p>
                <p className="text-gray-500 text-xs">Modification de site web</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: "400px" }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "btn-gradient text-white rounded-br-sm"
                        : "bg-white/5 text-gray-300 rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            {sent ? (
              <div className="text-center py-3">
                <p className="text-green-400 font-semibold text-sm">✓ Demande envoyée — vérifiez votre email</p>
                <Link
                  href={`/mes-sites?email=${encodeURIComponent(email)}`}
                  className="mt-3 inline-block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Retour à mes sites
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ex : Change la couleur du bouton en rouge, ajoute mon numéro de téléphone en haut..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                  rows={2}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="btn-gradient px-5 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40 self-end"
                >
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevisionPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" />
      </div>
    }>
      <RevisionChat orderId={orderId} />
    </Suspense>
  );
}
