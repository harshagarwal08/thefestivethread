"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-[#F9F5EF]">
      <div className="w-8 h-px bg-[#C9972C]/50 mx-auto mb-8" />
      <span className="text-[0.6rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-4">Something went wrong</span>
      <h1 className="font-display font-light text-[#1C1009] mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
        An unexpected error occurred
      </h1>
      <p className="text-[#8A7968] text-[0.9rem] leading-[1.8] max-w-[340px] mb-10">
        We&apos;re sorry about that. Please try again — or head back to the shop.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="text-[0.7rem] font-medium tracking-[0.12em] uppercase px-8 py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/shop"
          className="text-[0.7rem] tracking-[0.12em] uppercase px-8 py-4 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors"
        >
          Shop Rakhis
        </Link>
      </div>
    </div>
  );
}
