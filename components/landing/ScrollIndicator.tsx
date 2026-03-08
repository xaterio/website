"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Spirale SVG : 6 tours, largeur 36, hauteur 320
const W = 36;
const H = 320;
const TURNS = 6;
const CX = W / 2;

// Génère les points de la spirale
function buildSpiral(): string {
  const pts: string[] = [];
  const steps = TURNS * 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * TURNS * 2 * Math.PI;
    const r = (W / 2 - 3) * 0.85;
    const x = CX + r * Math.sin(angle);
    const y = H - t * H;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

const SPIRAL_PATH = buildSpiral();

const sections = [
  { label: "Accueil",  href: "#",          pct: 0    },
  { label: "À propos", href: "#alexandre", pct: 0.20 },
  { label: "Process",  href: "#comment",   pct: 0.48 },
  { label: "Tarif",    href: "#tarif",     pct: 0.65 },
  { label: "FAQ",      href: "#faq",       pct: 0.83 },
];

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22 });
  const [progress, setProgress] = useState(0);
  const [pathLen, setPathLen] = useState(1000);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    return smooth.on("change", (v) => setProgress(v));
  }, [smooth]);

  const filled = pathLen * progress;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex items-center gap-3">

      {/* Spirale SVG */}
      <div className="relative flex-shrink-0" style={{ width: W, height: H }}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          {/* Track (fond) */}
          <path
            d={SPIRAL_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Fill animé */}
          <path
            ref={pathRef}
            d={SPIRAL_PATH}
            fill="none"
            stroke="url(#spiralGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${pathLen - filled}`}
            strokeDashoffset={0}
            style={{ transition: "stroke-dasharray 0.3s ease" }}
          />
          {/* Lueur au bout */}
          {progress > 0.01 && (() => {
            const steps = TURNS * 40;
            const idx = Math.round(progress * steps);
            const t = idx / steps;
            const angle = t * TURNS * 2 * Math.PI;
            const r = (W / 2 - 3) * 0.85;
            const x = CX + r * Math.sin(angle);
            const y = H - t * H;
            return (
              <circle cx={x} cy={y} r={4} fill="#a78bfa"
                style={{ filter: "drop-shadow(0 0 6px #a78bfa)" }} />
            );
          })()}
          <defs>
            <linearGradient id="spiralGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#3b0764" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Labels */}
      <div className="relative" style={{ height: H }}>
        {sections.map((s) => {
          const reached = progress >= s.pct - 0.015;
          return (
            <div key={s.label} className="absolute flex items-center gap-2"
              style={{ bottom: s.pct * H - 7 }}>
              <div className="h-px w-3 transition-colors duration-500"
                style={{ background: reached ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.06)" }} />
              <a href={s.href}
                className="text-xs font-medium leading-none whitespace-nowrap transition-colors duration-500"
                style={{ color: reached ? "rgb(216,180,254)" : "rgb(75,85,99)" }}>
                {s.label}
              </a>
            </div>
          );
        })}
      </div>

    </div>
  );
}
