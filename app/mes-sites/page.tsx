"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  business_name: string;
  business_type: string;
  style: string;
  status: string;
  created_at: string;
  site_html: string | null;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  paid:       { label: "Paiement reçu", color: "text-blue-400" },
  generating: { label: "Génération en cours...", color: "text-yellow-400" },
  delivered:  { label: "Livré", color: "text-green-400" },
  error:      { label: "Erreur", color: "text-red-400" },
  refunded:   { label: "Remboursé", color: "text-gray-500" },
};

export default function MesSitesPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const handleRefund = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir être remboursé ? Le site sera désactivé.")) return;
    setRefundingId(orderId);
    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Mettre à jour le statut localement
      setOrders((prev) =>
        prev ? prev.map((o) => o.id === orderId ? { ...o, status: "refunded" } : o) : prev
      );
      alert("Remboursement effectué. Vous recevrez les fonds sous 5-10 jours ouvrés.");
    } catch (err) {
      alert("Erreur : " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setRefundingId(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/mes-sites?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh py-16 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center text-white font-black text-sm">A</div>
            <span className="font-bold text-white">Alexandre<span className="gradient-text">Dev</span></span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-black text-white mb-3">Mes sites web</h1>
          <p className="text-gray-400">Entrez votre email pour retrouver vos commandes</p>
        </motion.div>

        {/* Email form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "..." : "Rechercher"}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </motion.div>

        {/* Results */}
        {orders !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {orders.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-gray-400">Aucune commande trouvée pour cet email.</p>
                <Link href="/commander" className="mt-4 inline-block btn-gradient px-6 py-3 rounded-full text-white font-semibold text-sm">
                  Commander un site →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const st = statusLabel[order.status] || { label: order.status, color: "text-gray-400" };
                  const date = new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass rounded-2xl p-5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-white font-bold text-lg">{order.business_name || "Mon site"}</h3>
                        <p className="text-gray-500 text-sm">{date}</p>
                        <span className={`text-sm font-semibold ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        {order.site_html && (
                          <a
                            href={`/sites/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline px-4 py-2 rounded-full text-white text-sm font-semibold"
                          >
                            Voir →
                          </a>
                        )}
                        {order.status === "delivered" && (
                          <button
                            onClick={() => router.push(`/mes-sites/${order.id}?email=${encodeURIComponent(email)}`)}
                            className="btn-gradient px-4 py-2 rounded-full text-white text-sm font-semibold"
                          >
                            Modifier
                          </button>
                        )}
                        {order.status === "generating" && (
                          <span className="text-yellow-400 text-sm animate-pulse">En cours...</span>
                        )}
                        {order.status === "delivered" && (
                          <button
                            onClick={() => handleRefund(order.id)}
                            disabled={refundingId === order.id}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs px-3 py-2 rounded-full border border-white/5 disabled:opacity-40"
                          >
                            {refundingId === order.id ? "..." : "Remboursement"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
