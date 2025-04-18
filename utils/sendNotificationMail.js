const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const DOMAIN_URL_RESPONSE = process.env.DOMAIN_URL_RESPONSE;
const corsUrl = process.env.CORS_URL;
const supportMail = process.env.SUPPORT_MAIL;
const supportPhone = process.env.SUPPORT_PHONE;

async function sendNotificationMail(
  email,
  username,
  description,
  intro,
  subject
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "SMARTPM | Plan, Track, Deliver",
      link: DOMAIN_URL_RESPONSE,
      copyright: "All right reserved by © SMARTPM",
    },
  });
  const emailTemplate = {
    body: {
      name: username,
      intro: `${intro}`,
      signature: "Your truly",
      outro: `
      <div style="border-top: 1px solid #ddd; margin: 20px 0; padding-top: 10px;">
        <strong style="font-size: 16px;">Description:</strong>
        <p style="font-size: 14px; color: #555;">${description}</p>
      </div>
      <p style="font-size: 14px; color: #777;"><a href="${corsUrl}">SMARTPM</a></p>
      <p style="font-size: 14px; color: #4285F4;">E-mail: ${supportMail}</p>
      <p style="font-size: 14px; color: #777;">Tel: ${supportPhone}</p>
    `,
    },
  };

  const emailBody = mailGenerator.generate(emailTemplate);

  const message = {
    from: EMAIL,
    to: email,
    subject: `${subject}`,
    html: emailBody,
  };
  await transporter.sendMail(message);
}

module.exports = sendNotificationMail;
