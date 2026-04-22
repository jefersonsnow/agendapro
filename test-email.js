require('dotenv').config();
const nodemailer = require('nodemailer');

const smtpConfig = {
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "", 
  },
};

console.log("SMTP Config:", { ...smtpConfig, auth: { user: smtpConfig.auth.user, pass: '***' } });

const transporter = nodemailer.createTransport(smtpConfig);
transporter.verify(function (error, success) {
  if (error) {
    console.log("Verify Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
