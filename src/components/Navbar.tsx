"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/hamper", label: "Build a Hamper" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-[#F9F5EF] transition-all duration-300",
      scrolled ? "py-2.5 shadow-[0_1px_0_rgba(28,16,9,0.10)]" : "py-4 shadow-[0_1px_0_rgba(28,16,9,0.06)]"
    )}>
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 flex items-center gap-4 md:gap-8">

        {/* Logo */}
        <Link href="/" className="flex-1 flex items-center gap-2.5 min-w-0">
          <Image src="/TFTLogo.png" alt="The Festive Thread by Kavita" width={36} height={36} className="object-contain shrink-0" />
          <div className="flex flex-col leading-none min-w-0">
            <span className="font-display text-lg md:text-xl text-[#1C1009] tracking-wide leading-none truncate">
              The Festive Thread
            </span>
            <span className="text-[0.58rem] tracking-[0.18em] uppercase text-[#8A7968] mt-0.5">
              by Kavita
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              "text-[0.7rem] tracking-[0.12em] uppercase transition-colors relative group",
              pathname === href ? "text-[#1C1009]" : "text-[#8A7968] hover:text-[#1C1009]"
            )}>
              {label}
              <span className={cn(
                "absolute -bottom-0.5 left-0 h-px bg-[#B5541E] transition-all duration-300",
                pathname === href ? "right-0" : "right-full group-hover:right-0"
              )} />
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link href="/cart" className="relative shrink-0 text-[#1C1009] hover:text-[#B5541E] transition-colors" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#B5541E] text-[#F9F5EF] text-[0.55rem] font-medium flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-[5px] p-2 shrink-0" aria-label="Toggle menu">
          <span className={cn("block w-5 h-[1.5px] bg-[#1C1009] transition-all duration-300 origin-center", open && "rotate-45 translate-y-[6.5px]")} />
          <span className={cn("block w-5 h-[1.5px] bg-[#1C1009] transition-all duration-300", open && "opacity-0 scale-x-0")} />
          <span className={cn("block w-5 h-[1.5px] bg-[#1C1009] transition-all duration-300 origin-center", open && "-rotate-45 -translate-y-[6.5px]")} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
        <div className="border-t border-[#EDE5D8] bg-[#F9F5EF] px-5 py-5 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={cn("text-sm tracking-wide transition-colors", pathname === href ? "text-[#B5541E]" : "text-[#4A2C1A]")}>
              {label}
            </Link>
          ))}
          <div className="h-px bg-[#EDE5D8] my-1" />
          <Link href="/cart" className="flex items-center justify-between text-sm text-[#4A2C1A]">
            <span>Cart</span>
            {count > 0 && <span className="bg-[#B5541E] text-[#F9F5EF] text-xs px-2 py-0.5 rounded-full">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
