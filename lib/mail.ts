import nodemailer from "nodemailer";

const smtpConfig = {
  host: process.env.SMTP_HOST || "agendar.napp.pt",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: process.env.SMTP_SECURE !== "false", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "contato@agendar.napp.pt",
    pass: process.env.SMTP_PASS || "", 
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"AgendarPro" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error: "Failed to send email" };
  }
}
