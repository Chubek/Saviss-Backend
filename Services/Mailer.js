require("dotenv").config({ path: "../.env" });
var nodemailer = require("nodemailer");

function sendMail(to, subject, text) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "chubakbidpaa@gmail.com",
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "chubakbidpaa@gmail.com",
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
