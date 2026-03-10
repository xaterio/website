"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getSecret() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("secret") || "";
}

interface DashboardData {
  orders: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{ id: string; business_name: string; email: string; status: string; created_at: string }>;
  };
  prospection: {
    total: number;
    recent: Array<{ company_name: string; email: string; city: string; contacted_at: string }>;
  };
}

interface ProspectResult {
  company: string;
  email: string;
  phone?: string;
  city: string;
  status: "sent" | "sent_sms" | "skip_site" | "skip_email" | "skip_contacted" | "error";
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "En attente",  color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  paid:       { label: "Payé",         color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
  generating: { label: "Génération",  color: "#8b5cf6", bg: "rgba(139,92,246,.12)" },
  delivered:  { label: "Livré",        color: "#10b981", bg: "rgba(16,185,129,.12)" },
  error:      { label: "Erreur",       color: "#ef4444", bg: "rgba(239,68,68,.12)"  },
};

const RESULT_META: Record<ProspectResult["status"], { icon: string; color: string; label: string }> = {
  sent:              { icon: "✉️", color: "#10b981", label: "Email envoyé" },
  sent_sms:          { icon: "📱", color: "#a78bfa", label: "Email + SMS" },
  skip_site:         { icon: "🌐", color: "#f59e0b", label: "A déjà un site" },
  skip_email:        { icon: "📭", color: "#6b7280", label: "Email introuvable" },
  skip_contacted:    { icon: "📋", color: "#4b5563", label: "Déjà contacté" },
  error:             { icon: "❌", color: "#ef4444", label: "Erreur" },
};

const MAX_OPTIONS = [10, 50, 100, 200, 500, 1000];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [prospecting, setProspecting] = useState(false);
  const [dept, setDept] = useState("");
  const [maxEmails, setMaxEmails] = useState(100);
  const [prospectResults, setProspectResults] = useState<{ sent: number; sentSms: number; total: number; results: ProspectResult[] } | null>(null);
  const [prospectError, setProspectError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "prospect">("dashboard");

  useEffect(() => {
    const s = getSecret();
    if (s) { setSecret(s); setSecretInput(s); loadDashboard(s); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = useCallback(async (sec: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prospect?secret=${encodeURIComponent(sec)}`);
      if (res.status === 401) { setAuthed(false); return; }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      setSecret(sec);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => loadDashboard(secretInput);

  const handleProspect = async () => {
    setProspecting(true);
    setProspectResults(null);
    setProspectError("");
    try {
      const res = await fetch("/api/admin/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, departement: dept.trim() || undefined, max: maxEmails }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setProspectResults(json);
      await loadDashboard(secret);
    } catch (e) {
      setProspectError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setProspecting(false);
    }
  };

  const s = (key: string) => data?.orders.byStatus[key] || 0;

  /* ── LOGIN ── */
  if (!authed) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 w-full max-w-sm relative z-10"
        >
          <div className="text-2xl font-black text-white mb-1">
            Alexandre<span className="gradient-text">Dev</span>
          </div>
          <div className="text-gray-500 text-sm mb-6">Accès administration</div>
          <input
            type="password"
            value={secretInput}
            onChange={e => setSecretInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Mot de passe admin"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm mb-3"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full btn-gradient px-5 py-3 rounded-xl text-white font-bold text-sm"
          >
            {loading ? "Vérification..." : "Accéder →"}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── DASHBOARD ── */
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6">
          <div>
            <div className="text-xl font-black text-white">Alexandre<span className="gradient-text">Dev</span></div>
            <div className="text-gray-500 text-xs mt-0.5">Administration</div>
          </div>
          <button
            onClick={() => loadDashboard(secret)}
            disabled={loading}
            className="glass px-3 py-2 rounded-xl text-gray-400 text-xs font-medium hover:text-white transition-colors"
          >
            {loading ? "..." : "↻ Refresh"}
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex gap-1 mb-5">
          {(["dashboard", "prospect"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "btn-gradient text-white" : "text-gray-400 hover:text-white"}`}
            >
              {tab === "dashboard" ? "📊 Dashboard" : "🚀 Prospection"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── TAB DASHBOARD ── */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">

              {/* Commandes stats */}
              <div className="glass rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Commandes</div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StatCard label="Total" value={data?.orders.total || 0} color="#a78bfa" />
                  <StatCard label="Livrés" value={s("delivered")} color="#10b981" />
                  <StatCard label="En cours" value={s("generating") + s("paid") + s("pending")} color="#f59e0b" />
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Récentes</div>
                <div className="space-y-0">
                  {data?.orders.recent.map((o, i) => (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{o.business_name || "—"}</div>
                        <div className="text-xs text-gray-500">{o.email}</div>
                      </div>
                      <div
                        className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ color: STATUS_META[o.status]?.color, background: STATUS_META[o.status]?.bg }}
                      >
                        {STATUS_META[o.status]?.label || o.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Prospection stats */}
              <div className="glass rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Prospection</div>
                  <div className="text-2xl font-black text-purple-400">
                    {data?.prospection.total || 0}
                    <span className="text-xs text-gray-500 font-normal ml-1">emails</span>
                  </div>
                </div>
                {data?.prospection.recent.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{p.company_name}</div>
                      <div className="text-xs text-gray-500">{p.city} · {p.email}</div>
                    </div>
                    <div className="text-xs text-gray-600">{new Date(p.contacted_at).toLocaleDateString("fr")}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TAB PROSPECTION ── */}
          {activeTab === "prospect" && (
            <motion.div key="prospect" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">

              {/* Config */}
              <div className="glass rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Configuration</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Département</label>
                    <input
                      value={dept}
                      onChange={e => setDept(e.target.value)}
                      placeholder="Ex : 38, 69, 75"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Emails max</label>
                    <select
                      value={maxEmails}
                      onChange={e => setMaxEmails(parseInt(e.target.value))}
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {MAX_OPTIONS.map(n => (
                        <option key={n} value={n}>{n} emails</option>
                      ))}
                    </select>
                  </div>
                </div>

                {maxEmails >= 200 && (
                  <div className="text-xs text-yellow-500/80 bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-3 py-2 mb-4">
                    ⏱ {maxEmails} emails peut prendre {Math.round(maxEmails * 2.5 / 60)} à {Math.round(maxEmails * 4 / 60)} min. La fenêtre doit rester ouverte.
                  </div>
                )}

                <button
                  onClick={handleProspect}
                  disabled={prospecting}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${prospecting ? "bg-purple-900/50 cursor-not-allowed" : "btn-gradient"}`}
                >
                  {prospecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours… gardez la page ouverte
                    </>
                  ) : `🚀 Lancer — ${maxEmails} emails`}
                </button>

                {prospectError && (
                  <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    ❌ {prospectError}
                  </div>
                )}
              </div>

              {/* Résultats */}
              <AnimatePresence>
                {prospectResults && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Résultats</div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <StatCard label="Envoyés" value={prospectResults.sent} color="#10b981" />
                      <StatCard label="Avec SMS" value={prospectResults.sentSms || 0} color="#a78bfa" />
                      <StatCard label="Ignorés" value={prospectResults.total - prospectResults.sent} color="#6b7280" />
                    </div>
                    <div className="space-y-0 max-h-72 overflow-y-auto">
                      {prospectResults.results.map((r, i) => {
                        const meta = RESULT_META[r.status];
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.03, 0.5) }}
                            className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span>{meta.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">{r.company}</div>
                                {r.email && <div className="text-xs text-gray-500 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ""}</div>}
                              </div>
                            </div>
                            <div className="text-xs font-medium ml-2 shrink-0" style={{ color: meta.color }}>{meta.label}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/3 rounded-xl py-3 px-2 text-center">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
