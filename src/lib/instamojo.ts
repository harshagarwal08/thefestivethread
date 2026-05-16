import crypto from "crypto";

const IS_TEST = process.env.INSTAMOJO_CLIENT_ID?.startsWith("TEST");
const BASE_URL = IS_TEST
  ? "https://test.instamojo.com"
  : "https://www.instamojo.com";

// OAuth2 token cached in memory
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE_URL}/oauth2/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.INSTAMOJO_CLIENT_ID!,
      client_secret: process.env.INSTAMOJO_CLIENT_SECRET!,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Instamojo auth failed: ${JSON.stringify(data)}`);
  }

  // Cache for slightly less than expiry
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export interface PaymentRequestParams {
  amount: number;
  buyerName: string;
  email: string;
  phone: string;
  purpose: string;
  remarks: string;
  redirectUrl: string;
  webhookUrl: string;
}

export interface PaymentRequestResponse {
  paymentRequestId: string;
  paymentUrl: string;
}

export async function createPaymentRequest(params: PaymentRequestParams): Promise<PaymentRequestResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/v3/gateway/orders/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.buyerName,
      email: params.email || "noreply@thefestivethread.com",
      phone: params.phone,
      amount: params.amount.toFixed(2),
      transaction_id: params.purpose,
      purpose: `The Festive Thread — ${params.purpose}`,
      redirect_url: params.redirectUrl,
      webhook_url: params.webhookUrl,
      description: params.remarks,
      send_email: false,
      send_sms: false,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.id) {
    throw new Error(`Instamojo order failed: ${JSON.stringify(data)}`);
  }

  return {
    paymentRequestId: data.id,
    paymentUrl: data.payment_options?.payment_url ?? data.longurl,
  };
}

// Webhook MAC verification (same logic for both old and new API)
export function verifyWebhookMAC(payload: Record<string, string>): boolean {
  const salt = process.env.INSTAMOJO_SALT;
  if (!salt) return process.env.NODE_ENV === "development"; // only skip in local dev
  const receivedMAC = payload.mac;
  if (!receivedMAC) return false;

  const { mac: _mac, ...rest } = payload;
  void _mac;

  const message = Object.keys(rest)
    .sort()
    .map((k) => rest[k])
    .join("|");

  const expected = crypto
    .createHmac("sha1", salt)
    .update(message)
    .digest("hex");

  return expected === receivedMAC;
}
