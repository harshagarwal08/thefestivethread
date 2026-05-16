import ContactClient from "./ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — The Festive Thread by Kavita",
  description: "Get in touch for orders, custom rakhis, bulk orders, or any questions.",
};

export default function ContactPage() {
  return (
    <div className="pt-16 min-h-dvh">
      <div className="bg-[#EDE5D8] py-12 md:py-16 border-b border-[#DDD4C4]">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10">
          <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-2">Get in Touch</span>
          <h1 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Let&apos;s talk<br /><em className="text-[#B5541E]">rakhis</em>
          </h1>
        </div>
      </div>
      <ContactClient />
    </div>
  );
}
