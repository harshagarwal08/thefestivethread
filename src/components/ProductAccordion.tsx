"use client";

import { useState } from "react";

interface AccordionItem {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export default function ProductAccordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number[]>(
    items.map((item, i) => (item.defaultOpen ? i : -1)).filter((i) => i >= 0)
  );

  const toggle = (i: number) =>
    setOpen((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  return (
    <div className="divide-y divide-[#EDE5D8] border-t border-b border-[#EDE5D8]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between py-4 text-left group"
          >
            <span className="text-[0.72rem] tracking-[0.12em] uppercase font-medium text-[#4A2C1A] group-hover:text-[#B5541E] transition-colors">
              {item.title}
            </span>
            <span className={`text-[#B5A898] text-lg leading-none transition-transform duration-200 ${open.includes(i) ? "rotate-45" : ""}`}>
              +
            </span>
          </button>
          {open.includes(i) && (
            <div className="pb-4 text-[0.84rem] text-[#8A7968] leading-[1.8]">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
