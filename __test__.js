/*const SendOTP = require("./Services/SendOTP");
const _ = require("lodash");

const sendOTPWrapper = () => {
  const password = _.random(100, 999) + _.random(1000, 9999);
  SendOTP(password, "919881073848");
};

const sendOTPCycle = (cycleNumber) => {
  for (i = 0; i < cycleNumber; i++) {
    sendOTPWrapper();
  }
};

sendOTPCycle(5);
*/
require("dotenv").config();
const cryptoRandomString = require("crypto-random-string");
const fieldEncryption = require("mongoose-field-encryption");

fieldEncryption.encrypt(
  "email",
  process.env.MONGOOSE_ENCRYPT_SECRET,
  cryptoRandomString
);
