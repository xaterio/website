export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="/commander" className="hover:text-white transition-colors">Commander</a>
          <a href="mailto:alexandre.ammi38@gmail.com" className="hover:text-white transition-colors">Contact</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <p className="text-gray-700 text-xs">
          © {new Date().getFullYear()} AlexandreDev · Fait avec passion 💜
        </p>
      </div>
    </footer>
  );
}
