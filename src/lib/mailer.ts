import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: `"${process.env.BREVO_FROM_NAME ?? "The Festive Thread"}" <${process.env.BREVO_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}
