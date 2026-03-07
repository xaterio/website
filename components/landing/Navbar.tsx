"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3 shadow-2xl" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-bold text-white text-lg">
            Alexandre<span className="gradient-text">Dev</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#alexandre" className="hover:text-white transition-colors">À propos</a>
          <a href="#comment" className="hover:text-white transition-colors">Comment ça marche</a>
          <a href="#tarif" className="hover:text-white transition-colors">Tarif</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/mes-sites"
            className="hidden md:block text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Mes sites
          </Link>
          <Link
            href="/commander"
            className="btn-gradient px-5 py-2.5 rounded-full text-white font-semibold text-sm"
          >
            Commander mon site →
          </Link>
        </div>
      </div>
    </nav>
  );
}
