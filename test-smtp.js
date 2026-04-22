require('dotenv').config();
const nodemailer = require('nodemailer');

const hosts = ["smtp.hostinger.com", "smtp.titan.email"];

async function testHosts() {
  for (const host of hosts) {
    console.log(`Testing ${host}...`);
    const smtpConfig = {
      host: host,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || "contato@agendar.napp.pt",
        pass: process.env.SMTP_PASS || "D@vivida13", 
      },
    };
    const transporter = nodemailer.createTransport(smtpConfig);
    try {
      await new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
          if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });
      console.log(`✅ SUCCESS with host: ${host}`);
      return;
    } catch (err) {
      console.log(`❌ Failed for ${host}`);
    }
  }
  console.log("All common hosts failed.");
}
testHosts();
