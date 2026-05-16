import crypto from "crypto";

const BASE_URL = process.env.INSTAMOJO_ENV === "live"
  ? "https://www.instamojo.com/api/1.1"
  : "https://test.instamojo.com/api/1.1";

const HEADERS = {
  "X-Api-Key": process.env.INSTAMOJO_API_KEY!,
  "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN!,
  "Content-Type": "application/x-www-form-urlencoded",
};

export interface PaymentRequestParams {
  amount: number;
  buyerName: string;
  email: string;
  phone: string;
  purpose: string; // order ref — shown on Instamojo receipt
  remarks: string; // encoded order data, returned in webhook
  redirectUrl: string;
  webhookUrl: string;
}

export interface PaymentRequestResponse {
  paymentRequestId: string;
  paymentUrl: string;
}

export async function createPaymentRequest(params: PaymentRequestParams): Promise<PaymentRequestResponse> {
  const body = new URLSearchParams({
    purpose: params.purpose,
    amount: params.amount.toFixed(2),
    buyer_name: params.buyerName,
    email: params.email || "noreply@thefestivethread.com",
    phone: params.phone,
    remarks: params.remarks,
    redirect_url: params.redirectUrl,
    webhook: params.webhookUrl,
    send_email: "false",
    send_sms: "false",
    allow_repeated_payments: "false",
  });

  const res = await fetch(`${BASE_URL}/payment-requests/`, {
    method: "POST",
    headers: HEADERS,
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || `Instamojo error: ${res.status}`);
  }

  return {
    paymentRequestId: data.payment_request.id,
    paymentUrl: data.payment_request.longurl,
  };
}

// Verifies webhook MAC to ensure payload isn't tampered
// Instamojo MAC: HMAC-SHA1(salt, sorted values of all params except mac joined by |)
export function verifyWebhookMAC(payload: Record<string, string>): boolean {
  const salt = process.env.INSTAMOJO_SALT!;
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
