import nodemailer from "nodemailer";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function createAliyunTransport() {
  const port = Number(process.env.ALIYUN_SMTP_PORT ?? "465");

  return nodemailer.createTransport({
    host: process.env.ALIYUN_SMTP_HOST ?? "smtpdm.aliyun.com",
    port,
    secure: (process.env.ALIYUN_SMTP_SECURE ?? "true") === "true",
    auth: {
      user: requireEnv("ALIYUN_SMTP_USER"),
      pass: requireEnv("ALIYUN_SMTP_PASSWORD")
    }
  });
}

export function getNewsletterSender() {
  return {
    name: process.env.NEWSLETTER_FROM_NAME ?? "open letters",
    address: requireEnv("ALIYUN_SMTP_USER")
  };
}
