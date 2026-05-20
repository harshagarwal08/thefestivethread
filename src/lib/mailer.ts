export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_FROM_NAME ?? "The Festive Thread",
        email: process.env.BREVO_FROM_EMAIL ?? "thefestivethread.updates@gmail.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Brevo email failed: ${JSON.stringify(err)}`);
  }
}
