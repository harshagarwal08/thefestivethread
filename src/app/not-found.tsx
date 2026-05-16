import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-[#F9F5EF]">
      <div className="w-8 h-px bg-[#C9972C]/50 mx-auto mb-8" />
      <span className="text-[0.6rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-4">404</span>
      <h1 className="font-display font-light text-[#1C1009] mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
        This thread leads nowhere
      </h1>
      <p className="text-[#8A7968] text-[0.9rem] leading-[1.8] max-w-[340px] mb-10">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s find you something beautiful instead.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/shop"
          className="text-[0.7rem] font-medium tracking-[0.12em] uppercase px-8 py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
        >
          Shop Rakhis
        </Link>
        <Link
          href="/"
          className="text-[0.7rem] tracking-[0.12em] uppercase px-8 py-4 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
