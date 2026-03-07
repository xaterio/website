"use client";

import { motion } from "framer-motion";
import { OrderData } from "@/types";
import { useState, useCallback } from "react";

interface Props {
  data: OrderData;
  onChange: (data: Partial<OrderData>) => void;
}

export default function QuizStep5({ data, onChange }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const current = data.photos || [];
    onChange({ photos: [...current, ...validFiles].slice(0, 10) });
  }, [data.photos, onChange]);

  const removePhoto = (index: number) => {
    const current = data.photos || [];
    onChange({ photos: current.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
        Vos photos & votre logo
      </h2>
      <p className="text-gray-400 mb-8">
        Ajoutez votre logo et des photos de votre activité.
        Plus vous en mettez, plus votre site sera personnalisé. (Max 10 photos)
      </p>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          dragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/10 bg-white/2 hover:border-white/20"
        }`}
      >
        <div className="text-5xl mb-4">📸</div>
        <p className="text-white font-semibold mb-2">Glissez vos photos ici</p>
        <p className="text-gray-500 text-sm mb-4">ou cliquez pour sélectionner</p>
        <label className="btn-gradient px-6 py-2.5 rounded-full text-white font-semibold text-sm cursor-pointer inline-block">
          Choisir des photos
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        <p className="text-gray-600 text-xs mt-3">PNG, JPG, WEBP · Max 10 images · 10MB chacune</p>
      </motion.div>

      {/* Preview grid */}
      {data.photos && data.photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6"
        >
          {data.photos.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Logo
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tips */}
      <div className="mt-6 glass rounded-xl p-4">
        <p className="text-sm font-semibold text-white mb-2">💡 Conseils pour de meilleures photos</p>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• La 1ère photo sera utilisée comme logo/photo principale</li>
          <li>• Photos de bonne qualité, bien éclairées</li>
          <li>• Photos de votre local, vos produits, votre équipe</li>
          <li>• Pas d&apos;obligation — l&apos;IA peut générer un site sans photos</li>
        </ul>
      </div>
    </div>
  );
}
