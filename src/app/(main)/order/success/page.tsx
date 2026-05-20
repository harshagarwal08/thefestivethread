"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

interface Order {
  orderRef: string;
  status: string;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  awb?: string | null;
  courierName?: string | null;
}

type PageState =
  | { kind: "loading" }
  | { kind: "paid"; order: Order }
  | { kind: "pending"; order: Order }
  | { kind: "error"; message: string };

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <p className="text-[#8A7968] text-[0.9rem] animate-pulse">Loading…</p>
      </div>
    }>
      <OrderSuccessInner />
    </Suspense>
  );
}

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    if (!ref) {
      setState({ kind: "error", message: "No order reference found. If you just paid, please WhatsApp us to confirm." });
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const POLL_MS = 2500;

    async function verify() {
      try {
        const res = await fetch(`/api/orders/${ref}`);
        if (!res.ok) {
          setState({ kind: "error", message: "We couldn't find your order. Please contact us." });
          return;
        }
        const order: Order = await res.json();

        if (order.status === "PAID" || order.status === "PAID_UNSHIPPED") {
          // Clear sessionStorage now that we have verified KV data
          sessionStorage.removeItem("tft_last_order");
          setState({ kind: "paid", order });
          return;
        }

        // Payment still pending — webhook hasn't fired yet
        attempts++;
        if (attempts < MAX_ATTEMPTS) {
          setState({ kind: "pending", order });
          setTimeout(verify, POLL_MS);
        } else {
          // Timed out polling — show pending state, webhook will still fire
          setState({ kind: "pending", order });
        }
      } catch {
        setState({ kind: "error", message: "Network error. Please refresh or contact us." });
      }
    }

    verify();
  }, [ref]);

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="print-container max-w-[600px] mx-auto px-4 py-16 flex flex-col gap-8">

        {state.kind === "loading" && (
          <div className="text-center flex flex-col items-center gap-4 py-12">
            <div className="w-6 h-px bg-[#C9972C]/60" />
            <p className="text-[#8A7968] text-[0.9rem] animate-pulse">Confirming your payment…</p>
          </div>
        )}

        {state.kind === "pending" && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-6 h-px bg-[#C9972C]/60" />
            <div className="w-10 h-10 rounded-full border-2 border-[#C9972C] flex items-center justify-center text-[#C9972C] text-base no-print animate-pulse">
              ⏳
            </div>
            <h1 className="font-display text-[2rem] text-[#1C1009]">Payment Received</h1>
            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-[#8A7968]">{state.order.orderRef}</p>
            <div className="bg-[#FBF7F2] border border-[#DDD4C4] px-5 py-4 text-[0.82rem] text-[#4A2C1A] leading-[1.7] text-center max-w-[440px]">
              <p>Your payment went through. We're confirming your order — this usually takes under a minute.</p>
              <p className="text-[#8A7968] mt-2 text-[0.75rem]">You can safely close this page. We'll dispatch within 1–2 business days.</p>
            </div>
            <p className="text-[0.82rem] text-[#8A7968]">
              Questions? WhatsApp us at{" "}
              <a href="https://wa.me/919883088575" className="text-[#B5541E]">+91 98830 88575</a>
            </p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-6 h-px bg-[#C9972C]/60" />
            <h1 className="font-display text-[2rem] text-[#1C1009]">Something went wrong</h1>
            <p className="text-[#8A7968] text-[0.9rem] leading-[1.8] max-w-[400px]">{state.message}</p>
            <p className="text-[0.82rem] text-[#8A7968]">
              WhatsApp us at{" "}
              <a href="https://wa.me/919883088575" className="text-[#B5541E]">+91 98830 88575</a>
            </p>
          </div>
        )}

        {state.kind === "paid" && <PaidReceipt order={state.order} onPrint={handlePrint} />}

      </div>
    </>
  );
}

function PaidReceipt({ order, onPrint }: { order: Order; onPrint: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-6 h-px bg-[#C9972C]/60" />
        <div className="w-10 h-10 rounded-full bg-[#1C1009] text-[#F9F5EF] flex items-center justify-center text-base no-print">
          ✓
        </div>
        <h1 className="font-display text-[2rem] text-[#1C1009] leading-tight">Order Confirmed</h1>
        <p className="text-[0.65rem] tracking-[0.14em] uppercase text-[#8A7968]">{order.orderRef}</p>
      </div>

      {/* Receipt */}
      <div className="border border-[#DDD4C4] bg-white">
        {/* Print header */}
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

        {/* Tracking (if available) */}
        {order.awb && (
          <div className="px-6 py-4 border-b border-[#EDE5D8] flex justify-between items-center text-[0.82rem]">
            <div>
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#B5541E] mb-1">Tracking</p>
              <p className="text-[#1C1009] font-medium">{order.awb}</p>
              {order.courierName && <p className="text-[#8A7968]">{order.courierName}</p>}
            </div>
          </div>
        )}

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

      {/* Dispatch note */}
      <div className="bg-[#F3EDE4] px-5 py-4 text-[0.82rem] text-[#4A2C1A] leading-[1.7]">
        <p className="font-medium mb-1">Tracking your order</p>
        <p className="text-[#8A7968]">
          {order.awb
            ? `Your order has been dispatched via ${order.courierName ?? "courier"} (AWB: ${order.awb}). Track it on the courier's website.`
            : "We'll dispatch within 1–2 business days. You'll receive an email with your tracking details once shipped."}
          {" "}For help, WhatsApp us at{" "}
          <a href="https://wa.me/919883088575" className="text-[#B5541E]">+91 98830 88575</a>.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <button
          onClick={onPrint}
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
  );
}
