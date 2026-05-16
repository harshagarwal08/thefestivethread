import Link from "next/link";
import Image from "next/image";

const shopLinks = [
  { href: "/shop?cat=single", label: "Single Rakhis" },
  { href: "/shop?cat=combo", label: "Rakhi + Lumba" },
  { href: "/shop?cat=kids", label: "Kid's Rakhis" },
  { href: "/hamper", label: "Build a Hamper" },
];

const infoLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact Us" },
  { href: "https://instagram.com/thefestivethread", label: "Instagram", external: true },
];

const helpLinks = [
  { href: "/contact", label: "Shipping Info" },
  { href: "/contact", label: "Custom Orders" },
  { href: "/contact", label: "Bulk Orders" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C1009] text-[#B5A898]">
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 pt-16 pb-10 grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/TFTLogo.png" alt="The Festive Thread by Kavita" width={32} height={32} className="object-contain brightness-200 opacity-80" />
            <div>
              <div className="font-display text-xl text-[#F9F5EF]">The Festive Thread</div>
              <div className="text-[0.55rem] tracking-[0.16em] uppercase text-[#8A7968] mt-0.5">by Kavita</div>
            </div>
          </div>
          <p className="text-sm italic font-display text-[#B5A898]/70 leading-relaxed mt-2">
            Handcrafted with love,<br />tied with tradition.
          </p>
        </div>
        {(
          [
            { title: "Shop", links: shopLinks },
            { title: "Info", links: infoLinks },
            { title: "Help", links: helpLinks },
          ] as { title: string; links: { href: string; label: string; external?: boolean }[] }[]
        ).map(({ title, links }) => (
          <div key={title}>
            <h4 className="text-[0.6rem] tracking-[0.16em] uppercase text-[#F9F5EF] font-medium mb-4">{title}</h4>
            <ul className="flex flex-col gap-3">
              {links.map(({ href, label, external }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener" : undefined}
                    className="text-[0.8rem] text-[#B5A898]/70 hover:text-[#E8B84B] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/7 max-w-[1300px] mx-auto px-4 md:px-10 py-5 flex flex-col sm:flex-row justify-between text-[0.7rem] opacity-40 gap-1">
        <p>© {new Date().getFullYear()} The Festive Thread by Kavita. Made with ♥ in India.</p>
        <p>Delivery across India.</p>
      </div>
    </footer>
  );
}
