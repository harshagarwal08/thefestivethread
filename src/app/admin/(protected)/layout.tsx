import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "Admin — The Festive Thread" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const authed = jar.get("tft_admin")?.value === process.env.ADMIN_PASSWORD;
  if (!authed) redirect("/admin/login", RedirectType.replace);

  return (
    <div className="min-h-dvh bg-[#F5F1EB] flex flex-col">
      <header className="bg-brown-dark px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-gold font-display text-[1rem]">TFT Admin</span>
          <nav className="flex gap-4">
            {[
              { href: "/admin", label: "Orders" },
              { href: "/admin/discounts", label: "Discounts" },
              { href: "/admin/products", label: "Products" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-[0.65rem] tracking-[0.12em] uppercase text-taupe-light hover:text-cream transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button className="text-[0.6rem] tracking-widest uppercase text-taupe hover:text-cream transition-colors">
            Logout
          </button>
        </form>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
