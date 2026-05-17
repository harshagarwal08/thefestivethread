const BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Shiprocket auth failed: ${data.message ?? res.status}`);
  }

  // Token is valid for 24h — cache for 23h to be safe
  cachedToken = { value: data.token, expiresAt: Date.now() + 23 * 60 * 60 * 1000 };
  return cachedToken.value;
}


async function srFetch(path: string, body: object, retried = false): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Token expired mid-session — refresh once and retry
  if (res.status === 401 && !retried) {
    cachedToken = null;
    return srFetch(path, body, true);
  }

  return res;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface ShiprocketOrderParams {
  orderRef: string;       // e.g. TFT-1234567890
  orderDate: string;      // "YYYY-MM-DD HH:mm"
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  hasHamper: boolean;     // drives weight/dimensions
  items: ShiprocketOrderItem[];
}

export interface ShiprocketResult {
  orderId: number;
  shipmentId: number;
  awb?: string;
  courierName?: string;
}

export async function createShiprocketOrder(params: ShiprocketOrderParams): Promise<ShiprocketResult> {
  // Weight & dimensions: rakhi-only vs hamper
  const weight = params.hasHamper ? 0.75 : 0.15; // kg
  const dimensions = params.hasHamper
    ? { length: 25, breadth: 20, height: 10 }
    : { length: 15, breadth: 10, height: 3 };

  const body = {
    order_id: params.orderRef,
    order_date: params.orderDate,
    pickup_location: "Home",
    channel_id: "",
    comment: "",
    billing_customer_name: params.buyerName,
    billing_last_name: "",
    billing_address: params.address,
    billing_city: params.city,
    billing_state: params.state,
    billing_country: "India",
    billing_pincode: params.pincode,
    billing_email: params.buyerEmail || "noreply@thefestivethread.com",
    billing_phone: params.buyerPhone,
    shipping_is_billing: true,
    order_items: params.items,
    payment_method: "Prepaid",
    sub_total: params.total,
    weight,
    ...dimensions,
  };

  const res = await srFetch("/orders/create/adhoc", body);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Shiprocket order failed: ${JSON.stringify(data)}`);
  }

  return {
    orderId: data.order_id,
    shipmentId: data.shipment_id,
    awb: data.awb_code || undefined,
    courierName: data.courier_name || undefined,
  };
}

export async function getShippingRate(deliveryPincode: string, weightKg: number, retried = false): Promise<number> {
  const token = await getToken();
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE!;

  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight: weightKg.toString(),
    cod: "0",
  });

  const res = await fetch(`${BASE}/courier/serviceability/?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    cachedToken = null;
    if (retried) throw new Error("Shiprocket auth failed after token refresh");
    return getShippingRate(deliveryPincode, weightKg, true);
  }

  const data = await res.json();
  const couriers: Array<{ rate: number; is_surface?: number }> =
    data?.data?.available_courier_companies ?? [];

  if (!couriers.length) throw new Error("No couriers available for this pincode");

  // Pick cheapest air courier rate
  const cheapest = couriers.reduce((min, c) => (c.rate < min.rate ? c : min));
  return Math.ceil(cheapest.rate);
}
