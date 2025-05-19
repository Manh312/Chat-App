const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmail = async ({from, to, subject, text, html, attachments}) => {
  try {
    const info = transporter.sendMail({
      from: {
        name: 'Chat App',
        address: process.env.USER
      },
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
      attachments,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error while sending email:", err.message);
    throw new Error("Email not sent");
  }
};

module.exports = { sendEmail };
