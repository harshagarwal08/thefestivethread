import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — The Festive Thread by Kavita",
};

export default function TermsPage() {
  return (
    <div className="pt-16 min-h-dvh bg-[#F9F5EF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-3">Legal</span>
        <h1 className="font-display font-light text-[#1C1009] text-4xl mb-2">Terms &amp; Conditions</h1>
        <p className="text-[0.72rem] text-[#8A7968] mb-10">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-[#4A2C1A] text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">1. Overview</h2>
            <p>By placing an order on this website, you agree to the following terms. The Festive Thread by Kavita is a home-based business selling handcrafted rakhis and gift hampers, operating from Howrah, West Bengal, India.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">2. Orders</h2>
            <p>All orders are subject to availability. We reserve the right to cancel any order in the event of unforeseen circumstances such as stock unavailability or inability to fulfil delivery. In such cases, a full refund will be issued.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">3. Pricing</h2>
            <p>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Shipping charges, if any, are displayed at checkout. Prices are subject to change without notice, but confirmed orders will be honoured at the price shown at the time of purchase.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">4. Payments</h2>
            <p>Payments are processed securely through Instamojo. We do not store any card or payment information. By completing a purchase, you confirm that the payment method used belongs to you or that you have authorisation to use it.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">5. Handcrafted Nature of Products</h2>
            <p>All rakhis are handmade. Minor variations in colour, size, or finish from product photographs are inherent to the craft and are not considered defects. We take care to represent products accurately.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">6. Limitation of Liability</h2>
            <p>Our liability is limited to the value of your order. We are not responsible for any indirect or consequential loss arising from delays or product variations.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">7. Contact</h2>
            <p>For any queries, contact us at +91 98830 88575 or via Instagram at <a href="https://instagram.com/thefestivethread" target="_blank" rel="noopener noreferrer" className="text-[#B5541E] hover:underline">@thefestivethread</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
