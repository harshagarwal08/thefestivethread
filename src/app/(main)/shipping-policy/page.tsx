import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — The Festive Thread by Kavita",
};

export default function ShippingPolicyPage() {
  return (
    <div className="pt-16 min-h-dvh bg-[#F9F5EF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-3">Legal</span>
        <h1 className="font-display font-light text-[#1C1009] text-4xl mb-2">Shipping &amp; Delivery Policy</h1>
        <p className="text-[0.72rem] text-[#8A7968] mb-10">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-[#4A2C1A] text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Delivery Coverage</h2>
            <p>We ship across India. Orders are dispatched from Howrah, West Bengal.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Delivery Timeframe</h2>
            <p>Orders are typically delivered within <strong>7–8 business days</strong> of order confirmation. Delivery timelines may vary depending on your location and courier availability. Remote or rural areas may require additional time.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Processing Time</h2>
            <p>As all rakhis are handcrafted, please allow 1–2 days for order processing before dispatch. You will be contacted via phone or WhatsApp once your order has been shipped.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Shipping Charges</h2>
            <p>Shipping charges, if applicable, will be communicated at the time of order confirmation. For bulk or hamper orders, shipping may be calculated based on weight and destination.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Order Tracking</h2>
            <p>Once dispatched, tracking details will be shared with you via WhatsApp or phone. Please ensure your contact number is accurate at the time of ordering.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Delays</h2>
            <p>We are not responsible for delays caused by courier partners, natural events, public holidays, or circumstances beyond our control. We will make every effort to keep you informed if there is a delay.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Contact</h2>
            <p>For shipping queries, call or WhatsApp us at +91 98830 88575 or reach us on Instagram at <a href="https://instagram.com/thefestivethread" target="_blank" rel="noopener noreferrer" className="text-[#B5541E] hover:underline">@thefestivethread</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
