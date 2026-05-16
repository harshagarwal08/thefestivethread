import type { Metadata } from "next";
import { Suspense } from "react";
import HamperClient from "./HamperClient";

export const metadata: Metadata = {
  title: "Build a Hamper — The Festive Thread by Kavita",
  description: "Create a personalised rakhi gift hamper with a box, chocolates, roli chawal, and a beautiful card.",
};

export default function HamperPage() {
  return (
    <div className="pt-16 min-h-dvh">
      <div className="bg-[#1C1009] py-12 md:py-16 relative overflow-hidden">
        <div className="absolute -right-[5%] -top-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,151,44,0.10),transparent_60%)]" />
        <div className="max-w-[1300px] mx-auto px-4 md:px-10 relative z-10">
          <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#C9972C] block mb-3">Gift Builder</span>
          <h1 className="font-display font-light text-[#F9F5EF] leading-[1.1]" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            Build a <em className="text-[#E8B84B]">Hamper</em>
          </h1>
          <p className="text-[#8A7968] text-[0.82rem] mt-3 max-w-[460px] leading-[1.7]">
            Choose your box and chocolate. We&apos;ll include roli chawal and a rakhi card. Checkout in one tap.
          </p>
        </div>
        <div className="mt-10 h-px bg-gradient-to-r from-transparent via-[#C9972C]/30 to-transparent" />
      </div>
      <Suspense>
        <HamperClient />
      </Suspense>
    </div>
  );
}
