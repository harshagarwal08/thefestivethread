import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — The Festive Thread by Kavita",
};

export default function RefundPolicyPage() {
  return (
    <div className="pt-16 min-h-dvh bg-[#F9F5EF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-3">Legal</span>
        <h1 className="font-display font-light text-[#1C1009] text-4xl mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-[0.72rem] text-[#8A7968] mb-10">Last updated: May 2026</p>

        <div className="flex flex-col gap-8 text-[#4A2C1A] text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">No Returns or Refunds</h2>
            <p>All sales are final. Due to the handcrafted and perishable nature of our products (rakhis and gift hampers including chocolates), we do not accept returns or offer refunds once an order has been placed and payment confirmed.</p>
            <p className="mt-3">We encourage you to review your order carefully before completing your purchase.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Order Cancellations</h2>
            <p>Cancellations are not accepted once payment has been received, as orders are processed immediately. If you believe you have made an error in your order, please contact us within 2 hours of placing the order at +91 98830 88575 and we will do our best to assist, subject to order status.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Damaged or Incorrect Items</h2>
            <p>If your order arrives damaged or you receive an incorrect item, please contact us within 48 hours of delivery with a photograph of the item. We will assess the issue and, at our discretion, arrange a replacement or store credit.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Payment Failures</h2>
            <p>If your payment fails but an amount has been deducted from your account, it will be automatically reversed by your bank or payment provider within 5–7 business days. Contact us if it is not resolved within that period.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-[#1C1009] mb-2">Contact</h2>
            <p>For any concerns, reach us at +91 98830 88575 or on Instagram at <a href="https://instagram.com/thefestivethread" target="_blank" rel="noopener noreferrer" className="text-[#B5541E] hover:underline">@thefestivethread</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
