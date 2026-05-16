"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { cdnUrl } from "@/lib/cloudinary";

const featuredIds = ["cb-12", "sr-07", "sr-12", "cb-01"];
const featured = featuredIds.map((id) => products.find((p) => p.id === id)!);

const shopCategories = [
  { label: "Single Rakhis",    count: "26 designs", cat: "single", desc: "For every brother — simple threads to jewel-set masterpieces." },
  { label: "Rakhi + Lumba",    count: "12 sets",    cat: "combo",  desc: "Because bhabhi deserves to celebrate too. Perfectly matched pairs." },
  { label: "Kid's Rakhis",count: "3 designs",  cat: "kids",   desc: "Bright, bold, and made for little wrists." },
];

// Cards shuffle outward from center — pixel offsets from the 260×340 container
const heroCards = [
  { src: "/rakhis2026/rakhis/R08.png",  rot: -11, fx: -36, fy:  27, delay: 0.15, z: 1 },
  { src: "/rakhis2026/combo/C04-1.png", rot:   7, fx:  47, fy:   7, delay: 0.08, z: 2 },
  { src: "/rakhis2026/rakhis/R03.png",  rot:  -3, fx:  10, fy:  20, delay: 0,    z: 3 },
  { src: "/rakhis2026/rakhis/R14.png",  rot:  13, fx:  78, fy:  41, delay: 0.22, z: 1 },
  { src: "/rakhis2026/combo/C01-1.png", rot:  -7, fx: -16, fy:  48, delay: 0.30, z: 0 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-dvh flex items-center overflow-hidden bg-[#1C1009]">

        {/* Grain texture overlay — makes dark bg feel like handmade paper */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Warm glow — anchored to bottom-right, well away from cards */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(181,84,30,0.18)_0%,transparent_60%)]" />
        {/* Gold accent top-left */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(201,151,44,0.08)_0%,transparent_60%)]" />

        <div className="max-w-[1300px] mx-auto px-4 md:px-10 pt-24 pb-16 w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center min-h-dvh relative z-10">

          {/* ── Left: Copy ── */}
          <motion.div variants={container} initial="hidden" animate="show">

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-8 text-[#8A7968] text-[0.62rem] tracking-[0.22em] uppercase"
            >
              <span className="w-8 h-px bg-[#C9972C]/50" />
              <span>Raksha Bandhan 2026 Collection</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-light leading-[0.93] mb-8 text-[#F9F5EF]"
              style={{ fontSize: "clamp(3.6rem, 5.5vw, 6rem)" }}
            >
              Every thread
              <br />
              <em className="italic" style={{ color: "#E8B84B" }}>tells a story</em>
              <br />
              of love.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="leading-[1.9] max-w-[440px] mb-10 text-[0.88rem]"
              style={{ color: "#8A7968" }}
            >
              Handcrafted rakhis made with intention — for brothers who deserve
              something real, not something mass-produced. Our 2026 collection
              is here. Each piece takes hours to make. None are quite the same.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center mb-14">
              <Link
                href="/shop"
                className="text-[0.7rem] font-medium tracking-[0.14em] uppercase px-8 py-4 bg-[#B5541E] text-[#F9F5EF] hover:bg-[#D4713A] transition-colors duration-300"
              >
                Shop 2026 Collection
              </Link>
              <Link
                href="/about"
                className="text-[0.7rem] tracking-[0.14em] uppercase hover:text-[#F9F5EF] transition-colors"
                style={{ color: "#8A7968" }}
              >
                Meet the maker →
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-8 pt-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[["41", "Handcrafted designs"], ["100%", "Made by hand"], ["India", "Shipped nationwide"]].map(
                ([val, label], i) => (
                  <div key={i} className="flex items-center gap-8">
                    {i > 0 && <div className="w-px h-9" style={{ background: "rgba(255,255,255,0.08)" }} />}
                    <div>
                      <div className="font-display text-[1.7rem] font-light leading-none" style={{ color: "#E8B84B" }}>
                        {val}
                      </div>
                      <div className="text-[0.58rem] tracking-[0.16em] uppercase mt-1" style={{ color: "#8A7968" }}>
                        {label}
                      </div>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </motion.div>

          {/* ── Right: Stacked rakhi card pile ── */}
          <div className="relative hidden lg:flex items-center justify-center h-[600px]">
            {/* The stack sits in the centre of its container */}
            <div className="relative w-[260px] h-[340px]">
              {heroCards.map((card, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  style={{ zIndex: card.z }}
                  initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.88 }}
                  animate={{ opacity: 1, x: card.fx, y: card.fy, rotate: card.rot, scale: 1 }}
                  transition={{ duration: 1.1, delay: card.delay, ease: [0.34, 1.3, 0.64, 1] }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ y: [0, i % 2 === 0 ? -5 : 5, 0] }}
                    transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 + i * 0.3 }}
                  >
                    <div
                      className="w-full h-full overflow-hidden"
                      style={{
                        boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)",
                        outline: card.z === 3 ? "1px solid rgba(201,151,44,0.3)" : "none",
                        outlineOffset: "3px",
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image src={cdnUrl(card.src)} alt="Handcrafted rakhi" fill className="object-cover" sizes="260px" priority={card.z === 3} />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Subtle ambient pool of light under the stack — dark-safe */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[240px] pointer-events-none -z-10"
              style={{
                background: "radial-gradient(ellipse, rgba(201,151,44,0.07) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-10 hidden lg:flex flex-col items-center gap-3 text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "#4A2C1A" }}>
          <div className="w-px h-12 bg-gradient-to-b from-[#B5541E] to-transparent" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Promise strip ── */}
      <div className="bg-[#B5541E] py-3.5">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10 flex flex-wrap justify-center gap-6 md:gap-10">
          {["Pan-India Delivery", "Every Rakhi Handcrafted", "Secure Payments via Instamojo", "Custom Orders Welcome"].map((t) => (
            <div key={t} className="text-[#F9F5EF] text-[0.68rem] tracking-[0.1em] uppercase">{t}</div>
          ))}
        </div>
      </div>

      {/* ── Featured ── */}
      <section className="py-14 md:py-24 max-w-[1300px] mx-auto px-4 md:px-10 w-full">
        <div className="text-center mb-14">
          <span className="block text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] mb-2">2026 Favourites</span>
          <h2 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            Made to be remembered
          </h2>
          <p className="text-[#8A7968] text-sm mt-2 max-w-sm mx-auto">
            Not just a rakhi — a moment your brother will keep coming back to.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="text-[0.72rem] tracking-[0.12em] uppercase border border-[#1C1009] px-8 py-3.5 hover:bg-[#1C1009] hover:text-[#F9F5EF] transition-colors inline-block"
          >
            See All 41 Designs
          </Link>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="bg-[#EDE5D8] py-14 md:py-24">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image src={cdnUrl("/images/profile.jpeg")} alt="Kavita" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E]">The Maker</span>
            <h2 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(2rem, 3vw, 2.75rem)" }}>
              A mother&apos;s hands,<br /><em className="text-[#B5541E]">a sister&apos;s heart</em>
            </h2>
            <p className="text-[#8A7968] leading-[1.85] text-[0.9rem]">
              I started making rakhis for my own family — tired of finding the same plastic-wrapped threads in every store. If Raksha Bandhan means something, the rakhi should too.
            </p>
            <p className="text-[#8A7968] leading-[1.85] text-[0.9rem]">
              The Festive Thread is my small act of keeping a beautiful tradition alive, one handmade rakhi at a time. Every design in our 2026 collection is made by me, in my home, with materials I handpick myself.
            </p>
            <Link href="/about" className="text-[0.72rem] tracking-[0.12em] uppercase text-[#B5541E] hover:text-[#1C1009] transition-colors mt-4 self-start">
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-14 md:py-24 bg-[#F3EDE4]">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10">
          <div className="text-center mb-14">
            <span className="block text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] mb-2">Shop by Type</span>
            <h2 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
              Find the right rakhi
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#DDD4C4] divide-x divide-y divide-[#DDD4C4]">
            {shopCategories.map(({ label, count, cat, desc }) => (
              <Link
                key={cat}
                href={`/shop?cat=${cat}`}
                className="group relative p-10 overflow-hidden bg-[#F9F5EF] hover:bg-[#1C1009] transition-colors duration-300 block"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[0.62rem] tracking-[0.16em] uppercase text-[#B5541E] group-hover:text-[#E8B84B] transition-colors">{count}</span>
                  <h3 className="font-display text-xl text-[#1C1009] group-hover:text-[#F9F5EF] transition-colors">{label}</h3>
                  <p className="text-[0.78rem] text-[#8A7968] group-hover:text-[#B5A898] transition-colors leading-relaxed">{desc}</p>
                  <span className="text-[#B5541E] group-hover:text-[#E8B84B] group-hover:translate-x-1.5 transition-all duration-300 mt-2 inline-block">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative bg-[#1C1009] py-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-[5%] -top-[40%] w-[600px] h-[600px] rounded-full bg-[#B5541E]/8" />
          <div className="absolute -left-[5%] bottom-[-30%] w-[400px] h-[400px] rounded-full bg-[#C9972C]/6" />
        </div>
        <div className="relative z-10 max-w-[680px] mx-auto px-4 md:px-10">
          <span className="block text-[0.62rem] tracking-[0.22em] uppercase text-[#E8B84B] mb-6">Raksha Bandhan 2026</span>
          <h2
            className="font-display font-light text-[#F9F5EF] leading-[1.1] mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.75rem)" }}
          >
            Don&apos;t send your brother
            <br />
            <em className="text-[#E8B84B]">just another rakhi.</em>
          </h2>
          <p className="text-[#8A7968] text-[0.9rem] leading-relaxed mb-10 max-w-[420px] mx-auto">
            Send him one that took hours to make. One he&apos;ll actually keep. Order early — each piece is made to order and we ship across India.
          </p>
          <Link
            href="/shop"
            className="text-[0.72rem] font-medium tracking-[0.12em] uppercase px-10 py-4 bg-[#B5541E] text-[#F9F5EF] hover:bg-[#D4713A] transition-colors inline-block"
          >
            Shop the 2026 Collection
          </Link>
        </div>
      </section>
    </>
  );
}
