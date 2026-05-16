"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  tag?: string;
  fallbackBg: string;
}

export default function ProductGallery({ images, productName, tag, fallbackBg }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="md:sticky md:top-24 flex flex-col gap-3">
        {/* Main image */}
        <div
          className="relative aspect-3/4 overflow-hidden cursor-zoom-in"
          style={{ background: images.length ? undefined : fallbackBg }}
          onClick={() => images.length && setLightbox(true)}
        >
          {images.length ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[active]}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#8A7968]">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="22" r="13" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 50c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs tracking-widest italic">Photo coming soon</p>
            </div>
          )}
          {tag && (
            <span className="absolute top-3 left-3 bg-[#1C1009] text-[#F9F5EF] text-[0.6rem] tracking-[0.14em] uppercase px-2.5 py-1 font-medium z-10">
              {tag}
            </span>
          )}
          {images.length > 0 && (
            <div className="absolute bottom-3 right-3 z-10 bg-[#1C1009]/60 px-2 py-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-3/4 w-16 overflow-hidden shrink-0 transition-all duration-200 ${
                  active === i
                    ? "ring-2 ring-[#B5541E] ring-offset-1"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image src={src} alt={`${productName} view ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0E0906]/92 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
              onClick={() => setLightbox(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="relative w-[min(90vw,560px)] aspect-3/4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[active]}
                alt={productName}
                fill
                className="object-contain"
                sizes="560px"
                priority
              />
            </motion.div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
                >
                  ←
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
                >
                  →
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-6 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
