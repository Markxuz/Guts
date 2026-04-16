const nodemailer = require("nodemailer");

let cachedTransport = null;

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function buildTransport() {
  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD || "",
          }
        : undefined,
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

function getTransport() {
  if (!cachedTransport) {
    cachedTransport = buildTransport();
  }

  return cachedTransport;
}

async function sendMail(message) {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "reports@guts.local";
  return getTransport().sendMail({
    from: fromAddress,
    ...message,
  });
}

function resetTransport() {
  cachedTransport = null;
}

module.exports = {
  isSmtpConfigured,
  sendMail,
  resetTransport,
};