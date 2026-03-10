"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface LogEntry {
  id: number;
  type: string;
  name?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  message?: string;
  category?: string;
  dept?: string;
  cityMain?: string;
  total?: number;
  sent?: number;
  emailsSent?: number;
  smsSent?: number;
  skippedSite?: number;
  skippedEmail?: number;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "En attente",  color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  paid:       { label: "Payé",         color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
  generating: { label: "Génération",  color: "#8b5cf6", bg: "rgba(139,92,246,.12)" },
  delivered:  { label: "Livré",        color: "#10b981", bg: "rgba(16,185,129,.12)" },
  error:      { label: "Erreur",       color: "#ef4444", bg: "rgba(239,68,68,.12)"  },
};

const MAX_OPTIONS = [1, 10, 50, 100, 200, 500, 1000];

let logIdCounter = 0;

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<{ logsUrl: string } | null>(null);
  const [dept, setDept] = useState("");
  const [maxEmails, setMaxEmails] = useState(100);
  const [liveLog, setLiveLog] = useState<LogEntry[]>([]);
  const [liveStats, setLiveStats] = useState({ sent: 0, skippedSite: 0, skippedEmail: 0 });
  const [prospectError, setProspectError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "prospect">("dashboard");
  const abortRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getSecret();
    if (s) { setSecret(s); setSecretInput(s); loadDashboard(s); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLog]);

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

  const addLog = (entry: Omit<LogEntry, "id">) => {
    setLiveLog(prev => [...prev, { ...entry, id: ++logIdCounter }]);
  };

  const handleStream = async () => {
    setStreaming(true);
    setLiveLog([]);
    setLiveStats({ sent: 0, skippedSite: 0, skippedEmail: 0 });
    setProspectError("");
    setTriggerResult(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/admin/prospect-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, departement: dept.trim() || undefined, max: maxEmails }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Erreur de connexion au stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(part.slice(6));
            if (ev.type === "start") {
              addLog({ type: "start", dept: ev.dept, cityMain: ev.city });
            } else if (ev.type === "collecting") {
              addLog({ type: "collecting" });
            } else if (ev.type === "collected") {
              addLog({ type: "collected", total: ev.count });
            } else if (ev.type === "checking") {
              addLog({ type: "checking", name: ev.name, city: ev.city });
            } else if (ev.type === "skip_site") {
              addLog({ type: "skip_site", name: ev.name, city: ev.city, website: ev.website });
              setLiveStats(s => ({ ...s, skippedSite: s.skippedSite + 1 }));
            } else if (ev.type === "skip_email") {
              addLog({ type: "skip_email", name: ev.name, city: ev.city, phone: ev.phone });
              setLiveStats(s => ({ ...s, skippedEmail: s.skippedEmail + 1 }));
            } else if (ev.type === "skip_contacted") {
              // silent skip
            } else if (ev.type === "sent" || ev.type === "sent_sms") {
              addLog({ type: ev.type, name: ev.name, city: ev.city, email: ev.email, phone: ev.phone, total: ev.total });
              setLiveStats(s => ({ ...s, sent: ev.total }));
            } else if (ev.type === "error") {
              addLog({ type: "error", name: ev.name, message: ev.message });
            } else if (ev.type === "warn") {
              addLog({ type: "warn", message: ev.message });
            } else if (ev.type === "done") {
              addLog({ type: "done", sent: ev.sent, emailsSent: ev.emailsSent, smsSent: ev.smsSent, skippedSite: ev.skippedSite, skippedEmail: ev.skippedEmail });
              await loadDashboard(secret);
            } else if (ev.type === "fatal") {
              setProspectError(ev.message);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setProspectError(e instanceof Error ? e.message : "Erreur inconnue");
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    addLog({ type: "stopped" });
    setStreaming(false);
  };

  const handleTriggerGHA = async () => {
    setTriggering(true);
    setTriggerResult(null);
    setProspectError("");
    try {
      const res = await fetch("/api/admin/trigger-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, departement: dept.trim() || undefined, max: maxEmails }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur GitHub Actions");
      setTriggerResult(json);
    } catch (e) {
      setProspectError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setTriggering(false);
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
                  <div className="text-xs font-bold tracking-widests text-gray-500 uppercase">Prospection</div>
                  <div className="text-2xl font-black text-purple-400">
                    {data?.prospection.total || 0}
                    <span className="text-xs text-gray-500 font-normal ml-1">contactés</span>
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
                      disabled={streaming}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Emails max</label>
                    <select
                      value={maxEmails}
                      onChange={e => setMaxEmails(parseInt(e.target.value))}
                      disabled={streaming}
                      className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40"
                    >
                      {MAX_OPTIONS.map(n => (
                        <option key={n} value={n}>{n} email{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GitHub Actions */}
                <div className="mb-3">
                  <button
                    onClick={handleTriggerGHA}
                    disabled={triggering || streaming}
                    className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${triggering || streaming ? "bg-purple-900/50 cursor-not-allowed" : "btn-gradient"}`}
                  >
                    {triggering ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Lancement…</>
                    ) : `⚡ Lancer — ${maxEmails} email${maxEmails > 1 ? "s" : ""}`}
                  </button>
                  <div className="text-xs text-gray-600 text-center mt-1.5">via GitHub Actions · pas de timeout · tu peux fermer la page</div>
                </div>

                {triggerResult && (
                  <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 mb-3">
                    ✅ Prospection lancée !{" "}
                    <a href={triggerResult.logsUrl} target="_blank" rel="noreferrer" className="underline text-purple-400">
                      Voir les logs GitHub →
                    </a>
                  </div>
                )}

                {/* Direct streaming */}
                <div className="flex gap-2">
                  {!streaming ? (
                    <button
                      onClick={handleStream}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      🔌 Direct (résultats en direct)
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <div className="w-3 h-3 rounded-sm bg-red-400" />
                      Arrêter
                    </button>
                  )}
                </div>

                {prospectError && (
                  <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                    ❌ {prospectError}
                  </div>
                )}
              </div>

              {/* Live feed */}
              <AnimatePresence>
                {liveLog.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">

                    {/* Stats bar */}
                    {(streaming || liveStats.sent > 0) && (
                      <div className="flex gap-3 mb-3 pb-3 border-b border-white/5">
                        <div className="text-center flex-1">
                          <div className="text-xl font-black text-green-400">{liveStats.sent}</div>
                          <div className="text-xs text-gray-500">envoyés</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-xl font-black text-amber-400">{liveStats.skippedSite}</div>
                          <div className="text-xs text-gray-500">ont un site</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-xl font-black text-gray-500">{liveStats.skippedEmail}</div>
                          <div className="text-xs text-gray-500">sans contact</div>
                        </div>
                      </div>
                    )}

                    {/* Terminal log */}
                    <div className="font-mono text-xs space-y-0.5 max-h-80 overflow-y-auto">
                      {liveLog.map((entry) => (
                        <LogLine key={entry.id} entry={entry} />
                      ))}
                      {streaming && (
                        <div className="flex items-center gap-1.5 text-purple-400 pt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          <span>en cours…</span>
                        </div>
                      )}
                      <div ref={logEndRef} />
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

function LogLine({ entry }: { entry: LogEntry }) {
  if (entry.type === "start") {
    return (
      <div className="py-1 border-b border-white/5 mb-1">
        <span className="text-gray-500">Département :</span>{" "}
        <span className="text-white font-bold">{entry.dept}</span>
        <br />
        <span className="text-gray-500">Ville principale :</span>{" "}
        <span className="text-purple-300">{entry.cityMain}</span>
      </div>
    );
  }
  if (entry.type === "collecting") {
    return (
      <div className="text-purple-400 flex items-center gap-1.5 py-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        Collecte de toutes les catégories en parallèle…
      </div>
    );
  }
  if (entry.type === "collected") {
    return (
      <div className="text-purple-300 border-b border-white/5 pb-1.5 mb-1">
        ✓ {entry.total} entreprises trouvées — tri alphabétique
      </div>
    );
  }
  if (entry.type === "checking") {
    return (
      <div className="text-gray-600 flex items-center gap-1">
        <span className="text-gray-700">→</span>
        <span className="text-gray-400 truncate">{entry.name}</span>
        <span className="text-gray-700 shrink-0">{entry.city}</span>
      </div>
    );
  }
  if (entry.type === "skip_site") {
    return (
      <div className="flex items-center gap-1.5">
        <span>🌐</span>
        <span className="text-amber-400 truncate">{entry.name}</span>
        <span className="text-gray-600 shrink-0 text-xs">a déjà un site</span>
      </div>
    );
  }
  if (entry.type === "skip_email") {
    return (
      <div className="flex items-center gap-1.5">
        <span>📭</span>
        <span className="text-gray-500 truncate">{entry.name}</span>
        {entry.phone && <span className="text-gray-600 shrink-0">{entry.phone}</span>}
        {!entry.phone && <span className="text-gray-700 shrink-0 text-xs">pas de contact</span>}
      </div>
    );
  }
  if (entry.type === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5"
      >
        <span>✉️</span>
        <span className="text-green-400 font-semibold truncate">{entry.name}</span>
        <span className="text-green-600 shrink-0 truncate">{entry.email}</span>
      </motion.div>
    );
  }
  if (entry.type === "sent_sms") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5"
      >
        <span>📱</span>
        <span className="text-purple-400 font-semibold truncate">{entry.name}</span>
        <span className="text-purple-600 shrink-0 truncate">{entry.email}</span>
        {entry.phone && <span className="text-purple-700 shrink-0">{entry.phone}</span>}
      </motion.div>
    );
  }
  if (entry.type === "error") {
    return (
      <div className="flex items-center gap-1.5 text-red-400">
        <span>❌</span>
        <span className="truncate">{entry.name}</span>
      </div>
    );
  }
  if (entry.type === "warn") {
    return <div className="text-amber-600 truncate">⚠ {entry.message}</div>;
  }
  if (entry.type === "stopped") {
    return <div className="text-red-400 border-t border-white/5 pt-1 mt-1">⏹ Arrêté manuellement</div>;
  }
  if (entry.type === "done") {
    const parts = [];
    if ((entry.emailsSent || 0) > 0) parts.push(`${entry.emailsSent} email${(entry.emailsSent || 0) > 1 ? "s" : ""}`);
    if ((entry.smsSent || 0) > 0) parts.push(`${entry.smsSent} SMS`);
    const summary = parts.length ? parts.join(" + ") : "aucun contact";
    return (
      <div className="border-t border-white/5 pt-1.5 mt-1 text-green-400">
        ✅ Terminé — {summary} envoyé{(entry.sent || 0) > 1 ? "s" : ""}
      </div>
    );
  }
  return null;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/3 rounded-xl py-3 px-2 text-center">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
