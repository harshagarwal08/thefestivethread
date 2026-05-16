"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBox, getChocolate } from "@/lib/hamperOptions";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  variant?: string;
  hamper?: { boxId: string; chocolateId: string };
  lineTotal: number;
}

interface OrderAddress {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

interface SavedOrder {
  orderRef: string;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tft_last_order");
      if (raw) {
        setOrder(JSON.parse(raw));
        sessionStorage.removeItem("tft_last_order");
      }
    } catch {}
  }, []);

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="print-container max-w-[600px] mx-auto px-4 py-16 flex flex-col gap-8">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-6 h-px bg-[#C9972C]/60" />
          <div className="w-10 h-10 rounded-full bg-[#1C1009] text-[#F9F5EF] flex items-center justify-center text-base no-print">
            ✓
          </div>
          <h1 className="font-display text-[2rem] text-[#1C1009] leading-tight">Order Confirmed</h1>
          {order && (
            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-[#8A7968]">{order.orderRef}</p>
          )}
        </div>

        {order ? (
          <>
            {/* Receipt */}
            <div className="border border-[#DDD4C4] bg-white">
              {/* Store header — visible in print */}
              <div className="px-6 py-5 border-b border-[#EDE5D8] text-center hidden print:block">
                <p className="font-display text-xl text-[#1C1009]">The Festive Thread</p>
                <p className="text-[0.7rem] text-[#8A7968] mt-1">Order Receipt — {order.orderRef}</p>
              </div>

              {/* Items */}
              <div className="px-6 py-5 flex flex-col gap-3 border-b border-[#EDE5D8]">
                <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#B5541E] mb-1">Items Ordered</p>
                {order.items.map((item, i) => {
                  const hamperLabel = item.hamper
                    ? `${getBox(item.hamper.boxId as never).label} · ${getChocolate(item.hamper.chocolateId as never).label} · Roli Chawal · Card`
                    : null;
                  return (
                    <div key={i} className="flex justify-between gap-4 text-[0.82rem]">
                      <div>
                        <span className="text-[#1C1009]">{item.name}</span>
                        <span className="text-[0.6rem] tracking-widest uppercase text-taupe-light ml-2">{item.id.toUpperCase()}</span>
                        {item.variant && <span className="text-[#8A7968]"> · {item.variant}</span>}
                        {hamperLabel && <p className="text-[0.7rem] text-[#8A7968] mt-0.5">Hamper: {hamperLabel}</p>}
                        <span className="text-[#8A7968]"> × {item.quantity}</span>
                      </div>
                      <span className="text-[#1C1009] font-medium shrink-0">₹{item.lineTotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 flex flex-col gap-2 border-b border-[#EDE5D8]">
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-[#8A7968]">Subtotal</span>
                  <span className="text-[#1C1009]">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-[#8A7968]">Shipping</span>
                  <span className="text-[#1C1009]">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#EDE5D8]">
                  <span className="text-[0.68rem] tracking-[0.1em] uppercase font-medium text-[#4A2C1A]">Total Paid</span>
                  <span className="font-display text-[1.3rem] text-[#B5541E]">₹{order.total}</span>
                </div>
              </div>

              {/* Address */}
              <div className="px-6 py-5">
                <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#B5541E] mb-3">Delivery Address</p>
                <div className="text-[0.82rem] text-[#4A2C1A] flex flex-col gap-1">
                  <p className="font-medium">{order.address.name}</p>
                  <p className="text-[#8A7968]">{order.address.phone}</p>
                  <p className="text-[#8A7968]">{order.address.line1}</p>
                  <p className="text-[#8A7968]">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                  {order.address.notes && <p className="text-[#8A7968] italic mt-1">"{order.address.notes}"</p>}
                </div>
              </div>
            </div>

            {/* Tracking note */}
            <div className="bg-[#F3EDE4] px-5 py-4 text-[0.82rem] text-[#4A2C1A] leading-[1.7]">
              <p className="font-medium mb-1">Tracking your order</p>
              <p className="text-[#8A7968]">
                We'll dispatch within 1–2 business days. You'll receive an SMS with your tracking link once shipped.
                For help, WhatsApp us at{" "}
                <a href="https://wa.me/919883088575" className="text-[#B5541E]">+91 98830 88575</a>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
              >
                Download Receipt
              </button>
              <Link
                href="/shop"
                className="flex-1 text-center text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 border border-[#DDD4C4] text-[#4A2C1A] hover:border-[#1C1009] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          /* Fallback if sessionStorage was cleared / direct visit */
          <div className="text-center flex flex-col items-center gap-4">
            <p className="text-[#8A7968] text-[0.9rem] leading-[1.8]">
              Thank you for your order! We'll dispatch within 1–2 business days.<br />
              You'll receive an SMS with tracking once shipped.
            </p>
            <p className="text-[0.82rem] text-[#8A7968]">
              Questions? WhatsApp us at{" "}
              <a href="https://wa.me/919883088575" className="text-[#B5541E]">+91 98830 88575</a>
            </p>
            <Link href="/shop" className="mt-2 text-[0.7rem] tracking-[0.12em] uppercase px-8 py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
