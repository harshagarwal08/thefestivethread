import { kv } from "@/lib/kv";

interface Order {
  orderRef: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discountAmount?: number;
  discountCode?: string;
  createdAt: string;
  paidAt?: string;
  paymentId?: string;
  shiprocketOrderId?: number;
  awb?: string;
  courierName?: string;
  address: {
    name: string; phone: string; email?: string;
    line1: string; city: string; state: string; pincode: string; notes?: string;
  };
  items: Array<{ id: string; name: string; quantity: number; variant?: string; lineTotal: number }>;
  hamperItems?: Array<{
    boxLabel: string; chocolateLabel: string;
    rakhis: Array<{ name: string; quantity: number }>;
    lineTotal: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:       "bg-yellow-100 text-yellow-700",
  PAID:          "bg-green-100 text-green-700",
  PAID_UNSHIPPED:"bg-orange-100 text-orange-700",
  SHIPPED:       "bg-blue-100 text-blue-700",
};

export default async function AdminOrders() {
  const keys = await kv.keys("order:*");
  const orders: Order[] = [];

  if (keys.length) {
    const values = await Promise.all(keys.map((k) => kv.get<Order>(k)));
    orders.push(...(values.filter(Boolean) as Order[]));
  }

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paid = orders.filter((o) => o.status !== "PENDING");
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Paid Orders", value: paid.length },
          { label: "Revenue", value: `₹${revenue}` },
          { label: "Pending", value: orders.filter((o) => o.status === "PENDING").length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#DDD4C4] p-4">
            <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[#8A7968] mb-1">{s.label}</p>
            <p className="font-display text-[1.5rem] text-[#1C1009]">{s.value}</p>
          </div>
        ))}
      </div>

      <h1 className="font-display text-[1.4rem] text-[#1C1009] mb-4">All Orders</h1>

      {orders.length === 0 ? (
        <p className="text-[#8A7968] text-sm">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.orderRef} className="bg-white border border-[#DDD4C4] overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#F9F5EF] border-b border-[#EDE5D8]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[0.8rem] font-semibold text-[#1C1009]">{order.orderRef}</span>
                  <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2 py-0.5 font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  {order.awb && (
                    <a href={`https://shiprocket.co/tracking/${order.awb}`} target="_blank" rel="noopener"
                      className="text-[0.62rem] text-blue-600 underline">
                      AWB: {order.awb}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-[1.1rem] text-[#B5541E]">₹{order.total}</span>
                  <span className="text-[0.65rem] text-[#8A7968]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Customer */}
                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] uppercase text-[#B5541E] mb-2">Customer</p>
                  <p className="text-[0.82rem] font-medium text-[#1C1009]">{order.address.name}</p>
                  <p className="text-[0.75rem] text-[#8A7968]">{order.address.phone}{order.address.email ? ` · ${order.address.email}` : ""}</p>
                  <p className="text-[0.75rem] text-[#8A7968] mt-1 leading-[1.6]">
                    {order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}
                  </p>
                  {order.address.notes && (
                    <p className="text-[0.7rem] text-[#8A7968] italic mt-1">"{order.address.notes}"</p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] uppercase text-[#B5541E] mb-2">Items</p>
                  <div className="flex flex-col gap-1">
                    {order.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-[0.75rem]">
                        <span className="text-[#4A2C1A]">{it.name}{it.variant ? ` (${it.variant})` : ""} × {it.quantity}</span>
                        <span className="text-[#1C1009] font-medium">₹{it.lineTotal}</span>
                      </div>
                    ))}
                    {order.hamperItems?.map((h, i) => (
                      <div key={`h${i}`} className="text-[0.75rem]">
                        <div className="flex justify-between">
                          <span className="text-[#4A2C1A] font-medium">Hamper — {h.boxLabel} · {h.chocolateLabel}</span>
                          <span className="text-[#1C1009] font-medium">₹{h.lineTotal}</span>
                        </div>
                        {h.rakhis.map((r, j) => (
                          <p key={j} className="text-[#8A7968] pl-3">↳ {r.name} × {r.quantity}</p>
                        ))}
                      </div>
                    ))}
                    <div className="border-t border-[#EDE5D8] mt-1 pt-1 flex flex-col gap-0.5">
                      <div className="flex justify-between text-[0.72rem] text-[#8A7968]">
                        <span>Shipping</span><span>{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
                      </div>
                      {order.discountAmount ? (
                        <div className="flex justify-between text-[0.72rem] text-emerald-600">
                          <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                          <span>−₹{order.discountAmount}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-[0.78rem] font-semibold text-[#1C1009]">
                        <span>Total</span><span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {order.shiprocketOrderId && (
                <div className="px-5 py-2 bg-[#F9F5EF] border-t border-[#EDE5D8] text-[0.65rem] text-[#8A7968]">
                  Shiprocket #{order.shiprocketOrderId}
                  {order.paymentId && ` · Payment: ${order.paymentId}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
