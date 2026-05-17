import crypto from "crypto";

const BASE_URL = "https://www.instamojo.com/api/1.1";

function headers() {
  return {
    "X-Api-Key": process.env.INSTAMOJO_API_KEY!,
    "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN!,
    "Content-Type": "application/x-www-form-urlencoded",
  };
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
  const body = new URLSearchParams({
    purpose: `The Festive Thread — ${params.purpose}`,
    amount: params.amount.toFixed(2),
    buyer_name: params.buyerName,
    email: params.email || "noreply@thefestivethread.com",
    redirect_url: params.redirectUrl,
    webhook: params.webhookUrl,
    send_email: "False",
    send_sms: "False",
    allow_repeated_payments: "False",
  });

  const res = await fetch(`${BASE_URL}/payment-requests/`, {
    method: "POST",
    headers: headers(),
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(`Instamojo payment request failed: ${JSON.stringify(data)}`);
  }

  return {
    paymentRequestId: data.payment_request.id,
    paymentUrl: data.payment_request.longurl,
  };
}

export function verifyWebhookMAC(payload: Record<string, string>): boolean {
  const salt = process.env.INSTAMOJO_SALT;
  if (!salt) return process.env.NODE_ENV === "development";
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
