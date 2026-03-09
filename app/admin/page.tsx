"use client";

import { useState, useRef, useEffect } from "react";

interface LogEntry {
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  label?: string;
  ville?: string;
  message?: string;
  sent?: number;
  noSite?: number;
  noEmail?: number;
  max?: number;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [ville, setVille] = useState("Grenoble");
  const [max, setMax] = useState("10");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<{ sent: number; noSite: number; noEmail: number } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) setAuthed(true);
  };

  const startProspection = () => {
    setRunning(true);
    setLogs([]);
    setStats(null);

    const url = `/api/admin/prospect?secret=${encodeURIComponent(secret)}&ville=${encodeURIComponent(ville)}&max=${max}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      const data: LogEntry = JSON.parse(e.data);
      if (data.type === "done") {
        setStats({ sent: data.sent!, noSite: data.noSite!, noEmail: data.noEmail! });
        setRunning(false);
        es.close();
      } else {
        setLogs(prev => [...prev, data]);
      }
    };

    es.onerror = () => {
      setLogs(prev => [...prev, { type: "error", message: "Connexion perdue" }]);
      setRunning(false);
      es.close();
    };
  };

  const getLogLine = (log: LogEntry, i: number) => {
    switch (log.type) {
      case "start": return <div key={i} className="text-purple-400">🚀 Prospection lancée — {log.ville} · max {log.max} emails</div>;
      case "search": return <div key={i} className="text-gray-400 mt-2">🔍 Recherche {log.label} à {log.ville}...</div>;
      case "skip_site": return <div key={i} className="text-gray-600">⏭  {log.name} — a déjà un site</div>;
      case "no_site": return <div key={i} className="text-yellow-400">📍 {log.name} — pas de site web</div>;
      case "no_email": return <div key={i} className="text-gray-500">📭 {log.name} — email introuvable{log.phone ? ` · 📞 ${log.phone}` : ""}</div>;
      case "sending": return <div key={i} className="text-blue-400">📤 Envoi à {log.name} → {log.email}...</div>;
      case "sent": return <div key={i} className="text-green-400">✅ Email envoyé à {log.name} ({log.email})</div>;
      case "error": return <div key={i} className="text-red-400">❌ {log.message}</div>;
      default: return null;
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <form onSubmit={handleAuth} className="glass rounded-2xl p-8 w-full max-w-sm border border-white/10">
          <h1 className="text-2xl font-black text-white mb-6">Admin</h1>
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm border border-white/10 focus:border-purple-500/50 focus:outline-none mb-4"
          />
          <button type="submit" className="w-full btn-gradient py-3 rounded-xl text-white font-bold">
            Accéder
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#0a0a0f" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">
          Alexandre<span className="gradient-text">Dev</span> · Admin
        </h1>

        {/* Prospection */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-xl font-black text-white mb-4">📧 Prospection automatique</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Ville</label>
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                disabled={running}
                className="w-full glass rounded-xl px-4 py-3 text-white text-sm border border-white/10 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Nb d'emails max</label>
              <input
                type="number"
                value={max}
                onChange={e => setMax(e.target.value)}
                disabled={running}
                min="1"
                max="50"
                className="w-full glass rounded-xl px-4 py-3 text-white text-sm border border-white/10 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={startProspection}
            disabled={running}
            className="w-full btn-gradient py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {running ? (
              <><div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" /> Prospection en cours...</>
            ) : (
              "🚀 Lancer la prospection"
            )}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-xl p-4 border border-green-500/20 text-center">
              <div className="text-3xl font-black text-green-400">{stats.sent}</div>
              <div className="text-xs text-gray-500 mt-1">Emails envoyés</div>
            </div>
            <div className="glass rounded-xl p-4 border border-yellow-500/20 text-center">
              <div className="text-3xl font-black text-yellow-400">{stats.noSite}</div>
              <div className="text-xs text-gray-500 mt-1">Sans site web</div>
            </div>
            <div className="glass rounded-xl p-4 border border-gray-500/20 text-center">
              <div className="text-3xl font-black text-gray-400">{stats.noEmail}</div>
              <div className="text-xs text-gray-500 mt-1">Email introuvable</div>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-white/10 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, i) => getLogLine(log, i))}
            {running && <div className="text-gray-600 animate-pulse">▌</div>}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
