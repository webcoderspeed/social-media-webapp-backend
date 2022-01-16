import nodemailer from 'nodemailer';

const sendEmail = async ({
  email,
  subject,
  message
}) => {

  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    secureConnection: false,
    port: process.env.NODEMAILER_PORT,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    }
  });

  // define the email options
  const link = message.split('to:')[1].split('.')[0];

  const mailOptions = {
    from: `The Entertainment Convoy <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: subject,
    text: message,
    html: `
    <p>
    <a href=${link}>Click here to reset your password</a>
    </p>
    `
  }

  // sending the email
  await transporter.sendMail(mailOptions);
}

export default sendEmail;