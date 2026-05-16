"use client";

import { useState } from "react";

const infoCards = [
  { title: "Order a Rakhi", body: "Looking for something specific or want to ask about availability? Fill in the form or reach out directly." },
  { title: "Custom Orders", body: "Want a rakhi in a specific colour, theme, or style? I take custom orders with love." },
  { title: "Shipping Info", body: "I ship pan-India. Orders placed before July 2026 will reach you comfortably before Raksha Bandhan." },
  { title: "Bulk & Corporate", body: "Gifting rakhis to your team or clients? I offer bulk orders with special pricing." },
];

const WA_NUMBER = "919883088575";

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hi! I'm ${form.name}.\n\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank");
    setSent(true);
  };

  const inputCls = "border border-[#DDD4C4] px-4 py-3 text-[0.88rem] text-[#1C1009] bg-[#F9F5EF] outline-none focus:border-[#B5541E] transition-colors placeholder:text-[#B5A898] font-light w-full";
  const labelCls = "text-[0.6rem] tracking-[0.16em] uppercase font-medium text-[#4A2C1A]";

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-12 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 md:gap-16">
      {/* Info */}
      <div className="flex flex-col gap-6 md:gap-8">
        {infoCards.map(({ title, body }) => (
          <div key={title}>
            <h3 className="font-display text-[1.1rem] text-[#1C1009] mb-1.5">{title}</h3>
            <p className="text-[0.82rem] text-[#8A7968] leading-[1.7]">{body}</p>
          </div>
        ))}
        <div className="border-t border-[#EDE5D8] pt-5 mt-1">
          <p className="text-[0.65rem] tracking-[0.12em] uppercase text-[#8A7968] mb-3">Or reach directly</p>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2.5 bg-[#25D366] text-white text-[0.78rem] font-medium px-5 py-3 hover:bg-[#1ebe5a] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Form */}
      {sent ? (
        <div className="flex flex-col items-center justify-center gap-4 py-14 bg-[#F3EDE4] border border-[#DDD4C4] text-center px-8">
          <span className="text-[#C9972C] text-2xl">✦</span>
          <h3 className="font-display text-2xl text-[#1C1009]">WhatsApp opened!</h3>
          <p className="text-[0.85rem] text-[#8A7968] max-w-[260px]">Your message is pre-filled. Send it and I&apos;ll reply within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { name: "name",  label: "Your Name *",    type: "text", placeholder: "Full name",          required: true },
              { name: "phone", label: "Phone Number *", type: "tel",  placeholder: "+91 XXXXX XXXXX",    required: true },
            ].map(({ name, label, type, placeholder, required }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className={labelCls}>{label}</label>
                <input type={type} name={name} value={form[name as keyof typeof form]} onChange={set}
                  placeholder={placeholder} required={required} className={inputCls} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={set}
              placeholder="your@email.com" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Your Message *</label>
            <textarea name="message" value={form.message} onChange={set} rows={5}
              placeholder="Tell me about your order, custom requirements, or any questions…"
              required className={`${inputCls} resize-none`} />
          </div>
          <button type="submit"
            className="w-full text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
            Send via WhatsApp
          </button>
          <p className="text-[0.66rem] text-[#8A7968] text-center">Opens WhatsApp with your message pre-filled.</p>
        </form>
      )}
    </div>
  );
}
