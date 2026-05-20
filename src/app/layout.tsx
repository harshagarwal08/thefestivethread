import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Festive Thread — Handcrafted Rakhis",
  description:
    "Beautiful handcrafted rakhis, bhaiya-bhabhi sets, children's rakhis, and gift hampers made with love. Pan-India delivery for Raksha Bandhan.",
  keywords: "rakhis, handcrafted rakhi, raksha bandhan, rakhi hamper, bhaiya bhabhi rakhi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
