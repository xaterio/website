"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

const TUBE_H = 320;

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
  const fillH = useTransform(smooth, [0, 1], [0, TUBE_H]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return smooth.on("change", (v) => setProgress(v));
  }, [smooth]);

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex items-center gap-5">

      {/* ── Tube ── */}
      <div className="relative flex-shrink-0" style={{ width: 20, height: TUBE_H }}>

        {/* Glass track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.6)",
          }}
        />

        {/* Liquid fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            height: fillH,
            background: "linear-gradient(to top, #3b0764, #6d28d9, #8b5cf6, #c4b5fd)",
          }}
        />

        {/* Glass highlight stripe */}
        <div
          className="absolute top-3 bottom-3 rounded-full pointer-events-none"
          style={{
            left: 3,
            width: 3,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.14), transparent 55%)",
          }}
        />

        {/* Surface glow */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            bottom: fillH,
            left: -5,
            right: -5,
            height: 7,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.9)",
            filter: "blur(5px)",
          }}
          animate={{ opacity: [0.45, 1, 0.45], scaleX: [0.8, 1.25, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bubbles */}
        <Bubble size={3.5} delay={0}   duration={4}   />
        <Bubble size={2.5} delay={1.8} duration={5.5} />
        <Bubble size={2}   delay={3.5} duration={4.5} />

        {/* Section dots — light up when liquid reaches them */}
        {sections.map((s) => {
          const reached = progress >= s.pct - 0.015;
          return (
            <motion.div
              key={s.label}
              className="absolute rounded-full"
              style={{
                width: 12,
                height: 12,
                bottom: s.pct * TUBE_H - 6,
                left: "50%",
                marginLeft: -6,
                zIndex: 2,
                background: reached ? "#a78bfa" : "rgba(255,255,255,0.08)",
                border: "2px solid rgba(255,255,255,0.18)",
                boxShadow: reached ? "0 0 14px rgba(167,139,250,0.9), 0 0 4px rgba(167,139,250,0.5)" : "none",
                transition: "background 0.4s, box-shadow 0.4s",
              }}
            />
          );
        })}
      </div>

      {/* ── Labels ── */}
      <div className="relative" style={{ height: TUBE_H }}>
        {sections.map((s) => {
          const reached = progress >= s.pct - 0.015;
          return (
            <div
              key={s.label}
              className="absolute flex items-center gap-2"
              style={{ bottom: s.pct * TUBE_H - 7 }}
            >
              {/* connecting dash */}
              <div
                className="h-px w-4 transition-colors duration-500"
                style={{ background: reached ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.06)" }}
              />
              <a
                href={s.href}
                className="text-sm font-medium leading-none whitespace-nowrap transition-colors duration-500"
                style={{ color: reached ? "rgb(216,180,254)" : "rgb(75,85,99)" }}
              >
                {s.label}
              </a>
            </div>
          );
        })}
      </div>

    </div>
  );
}

function Bubble({ size, delay, duration }: { size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: "50%",
        marginLeft: -size / 2,
        background: "rgba(196,181,253,0.55)",
        bottom: 0,
      }}
      animate={{
        y: [0, -TUBE_H * 0.88],
        opacity: [0, 0.85, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
