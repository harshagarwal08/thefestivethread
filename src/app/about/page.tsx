import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — The Festive Thread by Kavita",
  description: "Handcrafted rakhis made by a mother of two with love and care.",
};

const values = [
  { num: "01", title: "Handcrafted Always", body: "Every rakhi is made by hand using carefully chosen materials — from freshwater pearls to sandalwood beads to hand-knotted thread." },
  { num: "02", title: "Rooted in Tradition", body: "Raksha Bandhan is one of the most beautiful festivals we have. Every piece honours the bond it celebrates." },
  { num: "03", title: "Small Batch, More Care", body: "I don't mass produce. Each collection is limited, seasonal, and crafted with attention that only a small maker can give." },
  { num: "04", title: "Made in India", body: "All materials are sourced in India. Every rupee supports local artisans and the rich craft tradition of our country." },
];

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-dvh">
      {/* Hero */}
      <div className="relative bg-[#1C1009] py-16 md:py-24 overflow-hidden">
        <div className="absolute -right-[5%] -top-[20%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,151,44,0.12),transparent_60%)]" />
        <div className="max-w-[1300px] mx-auto px-4 md:px-10 relative z-10">
          <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-4">Our Story</span>
          <h1 className="font-display font-light text-[#F9F5EF] leading-[1.1]" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Made with love,<br /><em className="text-[#E8B84B]">rooted in tradition</em>
          </h1>
          <p className="text-[0.75rem] tracking-[0.1em] uppercase text-[#8A7968] mt-4">by Kavita</p>
        </div>
        <div className="mt-10 md:mt-12 h-px bg-gradient-to-r from-transparent via-[#C9972C]/40 to-transparent" />
      </div>

      {/* Story */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-14 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
        <div className="relative aspect-3/4 overflow-hidden">
          <Image src="/images/profile.jpeg" alt="Kavita" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col gap-5 md:gap-6">
          <p className="font-display text-[1.25rem] md:text-[1.4rem] italic text-[#B5541E] leading-[1.6]">
            &ldquo;Every rakhi I make holds a prayer — for health, for love, for the unbreakable bond between siblings.&rdquo;
          </p>
          <p className="text-[#8A7968] leading-[1.9] text-[0.88rem] md:text-[0.92rem]">
            I&apos;m a mother of two, and I&apos;ve been crafting rakhis for as long as I can remember. What started as a small act of love for my own family slowly grew into what is now The Festive Thread.
          </p>
          <p className="text-[#8A7968] leading-[1.9] text-[0.88rem] md:text-[0.92rem]">
            I believe that in a world full of mass-produced things, there&apos;s something sacred about an object made entirely by hand. Each rakhi I create carries hours of intention, threads of memory, and a quiet prayer for the person who will wear it.
          </p>
          <p className="text-[#8A7968] leading-[1.9] text-[0.88rem] md:text-[0.92rem]">
            The Festive Thread is my love letter to Raksha Bandhan — and to every sibling bond it celebrates.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[#EDE5D8] py-14 md:py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map(({ num, title, body }) => (
            <div key={num} className="border-t-2 border-[#B5541E] pt-5">
              <span className="font-display text-[2rem] font-light text-[#EDE5D8] block leading-none mb-3">{num}</span>
              <h3 className="font-display text-[1.1rem] text-[#1C1009] mb-2">{title}</h3>
              <p className="text-[0.82rem] text-[#8A7968] leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="py-16 md:py-24 text-center max-w-[600px] mx-auto px-4 md:px-10">
        <div className="w-8 h-px bg-[#C9972C]/50 mx-auto mb-5" />
        <p className="font-display text-[1.2rem] md:text-[1.3rem] italic text-[#4A2C1A] leading-[1.7] mb-8">
          &ldquo;Thank you for choosing something handmade. You&apos;re not just buying a rakhi — you&apos;re supporting a craft, a tradition, and a dream.&rdquo;
        </p>
        <Link href="/shop"
          className="text-[0.7rem] font-medium tracking-[0.12em] uppercase px-8 py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors inline-block">
          Shop the Collection
        </Link>
      </div>
    </div>
  );
}
