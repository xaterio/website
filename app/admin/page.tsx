"use client";

import { useState, useEffect, useCallback } from "react";

const SECRET = typeof window !== "undefined"
  ? new URLSearchParams(window.location.search).get("secret") || ""
  : "";

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
  city: string;
  status: "sent" | "skip_site" | "skip_email" | "skip_contacted" | "error";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: "En attente",   color: "#f59e0b" },
  paid:       { label: "Payé",          color: "#3b82f6" },
  generating: { label: "Génération",   color: "#8b5cf6" },
  delivered:  { label: "Livré",         color: "#10b981" },
  error:      { label: "Erreur",        color: "#ef4444" },
};

export default function AdminPage() {
  const [secret, setSecret] = useState(SECRET);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [prospecting, setProspecting] = useState(false);
  const [dept, setDept] = useState("");
  const [maxEmails, setMaxEmails] = useState("10");
  const [prospectResults, setProspectResults] = useState<{ sent: number; total: number; results: ProspectResult[] } | null>(null);
  const [prospectError, setProspectError] = useState("");

  const loadDashboard = useCallback(async (sec: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prospect?secret=${encodeURIComponent(sec)}`);
      if (res.status === 401) { setAuthed(false); return; }
      const json = await res.json();
      setData(json);
      setAuthed(true);
    } catch {
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    await loadDashboard(secret);
  };

  const handleProspect = async () => {
    setProspecting(true);
    setProspectResults(null);
    setProspectError("");
    try {
      const res = await fetch("/api/admin/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, departement: dept || undefined, max: parseInt(maxEmails) }),
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

  useEffect(() => {
    if (SECRET) loadDashboard(SECRET);
  }, [loadDashboard]);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Admin</div>
          <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Entrez le mot de passe admin</div>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Secret admin"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 14, marginBottom: 12, outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={handleLogin}
            style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            Accéder →
          </button>
        </div>
      </div>
    );
  }

  const s = (key: string) => data?.orders.byStatus[key] || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#07070f", color: "#f0f0ff", fontFamily: "system-ui, sans-serif", padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Alexandre<span style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dev</span></div>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>Tableau de bord admin</div>
        </div>
        <button onClick={() => loadDashboard(secret)} disabled={loading} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9ca3af", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
          {loading ? "..." : "↻ Rafraîchir"}
        </button>
      </div>

      {/* Commandes stats */}
      <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 14 }}>Commandes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <Stat label="Total" value={data?.orders.total || 0} color="#a78bfa" />
          <Stat label="Livrés" value={s("delivered")} color="#10b981" />
          <Stat label="En cours" value={s("generating") + s("paid") + s("pending")} color="#f59e0b" />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>Récentes</div>
        {data?.orders.recent.map(o => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0ff" }}>{o.business_name || "—"}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{o.email}</div>
            </div>
            <div style={{ background: (STATUS_LABELS[o.status]?.color || "#888") + "22", color: STATUS_LABELS[o.status]?.color || "#888", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
              {STATUS_LABELS[o.status]?.label || o.status}
            </div>
          </div>
        ))}
      </div>

      {/* Prospection stats */}
      <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280" }}>Prospection</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#a78bfa" }}>{data?.prospection.total || 0} <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>emails</span></div>
        </div>

        {data?.prospection.recent.slice(0, 4).map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0ff" }}>{p.company_name}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{p.city} · {p.email}</div>
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>{new Date(p.contacted_at).toLocaleDateString("fr")}</div>
          </div>
        ))}
      </div>

      {/* Lancer prospection */}
      <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.25)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: 16 }}>Lancer la prospection</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 5 }}>Département</label>
            <input
              value={dept}
              onChange={e => setDept(e.target.value)}
              placeholder="Ex : 38, 69, 75…"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 5 }}>Emails max</label>
            <select
              value={maxEmails}
              onChange={e => setMaxEmails(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "#1a1a2e", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            >
              {[5, 10, 15].map(n => <option key={n} value={n}>{n} emails</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleProspect}
          disabled={prospecting}
          style={{ width: "100%", background: prospecting ? "rgba(124,58,237,.4)" : "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: prospecting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {prospecting ? (
            <>
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Envoi en cours…
            </>
          ) : "🚀 Lancer la prospection"}
        </button>

        {prospectError && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", fontSize: 13 }}>
            ❌ {prospectError}
          </div>
        )}

        {prospectResults && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              <Stat label="Envoyés" value={prospectResults.sent} color="#10b981" small />
              <Stat label="Ont site" value={prospectResults.results.filter(r => r.status === "skip_site").length} color="#f59e0b" small />
              <Stat label="Sans mail" value={prospectResults.results.filter(r => r.status === "skip_email").length} color="#6b7280" small />
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {prospectResults.results.filter(r => r.status === "sent").map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 12 }}>
                  <div>
                    <span style={{ color: "#10b981", marginRight: 6 }}>✓</span>
                    <span style={{ color: "#f0f0ff" }}>{r.company}</span>
                    <span style={{ color: "#6b7280", marginLeft: 6 }}>{r.city}</span>
                  </div>
                  <span style={{ color: "#6b7280" }}>{r.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", color: "#374151", fontSize: 12 }}>
        alexwebdesign.pro · Admin
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Stat({ label, value, color, small = false }: { label: string; value: number; color: string; small?: boolean }) {
  return (
    <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: small ? "10px 12px" : "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: small ? 20 : 26, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
    </div>
  );
}
