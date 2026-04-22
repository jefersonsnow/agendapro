require('dotenv').config();
const nodemailer = require('nodemailer');

async function verify() {
  console.log("Testing Gmail SMTP with user:", process.env.SMTP_USER);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SUCCESS: Gmail SMTP is working!");
  } catch (err) {
    console.log("❌ FAILED:", err.message);
  }
}
verify();
