require("dotenv").config();
const axios = require("axios");

const { OTP_API_KEY } = process.env;

function sendOTP(otp, number) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://2factor.in/API/R1/",
        new URLSearchParams({
          module: "SMS_OTP",
          apikey: OTP_API_KEY,
          to: number,
          otpvalue: otp,
        })
      )
      .then((res) => {
        resolve({ smsSent: true, result: res });
        console.log(res);
      })
      .catch((e) => {
        reject(e);
        console.error(e);
      });
  });
}

module.exports = sendOTP;
