require("dotenv").config();
var nodemailer = require("nodemailer");

const { SMTP_USER, SMTP_PASS, SMTP_SERVER, SMTP_FROM } = process.env;

function sendMail(to, subject, text) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: 465,
      secure: true, // secure:true for port 465, secure:false for port 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: SMTP_FROM,
      to: to,
      subject: subject,
      text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
        console.error(error);
      } else {
        resolve({ message: "Email sent to: " + to, emailSent: true });
        console.log("Email sent: " + info.response);
      }
    });
  });
}

module.exports = sendMail;
