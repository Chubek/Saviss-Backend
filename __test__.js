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


const cryptoRandomString = require("crypto-random-string");
const fieldEncryption = require("mongoose-field-encryption");

console.log(
  fieldEncryption.encrypt(
    "email",
    process.env.MONGOOSE_ENCRYPT_SECRET,
    cryptoRandomString
  )
);

require("dotenv").config();
const cryptoRandomString = require("crypto-random-string");
const fieldEncryption = require("mongoose-field-encryption");
const helpers = require("./Services/Helpers");
const assert = require("assert");

const cell = helpers.popNumber("0919881073848");

const cellEncrypted =
  "31393265313935376530373565323634:4e60d94ddf813b3a9c91c3ffada481ea";
/*
const cellEncryptedTwice = fieldEncryption.encrypt(
  cell,
  process.env.MONGOOSE_ENCRYPT_SECRET,
  cryptoRandomString
);

const cellNumberDecrypted = fieldEncryption.decrypt(
  cellEncrypted,
  process.env.MONGOOSE_ENCRYPT_SECRET
);

console.log(cell, "\n", cellNumberDecrypted);
assert(cell === cellNumberDecrypted, "Cells weren't equal");
*/

const jumblator = require("mongoose-jumblator").default;

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/jumblator");

console.log(jumblator);
const mySchema = mongoose.Schema({
  fieldOne: {
    type: String,
    encrypt: true,
    searchable: "true",
  },
  fieldTwo: {
    fieldTwoOne: {
      type: String,
      encrypt: true,
      searchable: true,
    },
  },
  fieldThree: {
    type: String,
    encrypt: true,
  },
  fieldFour: Number,
});

mySchema.plugin(jumblator, { secret: "HellltoTheChiefBaby" });

const myModel = mongoose.model("TestTestTest", mySchema);

const myDoc = new myModel({
  fieldOne: "Dell",
  "fieldTwo.fieldTwoOne": "billy",
  fieldThree: "Hilly",
  fieldFour: 231,
});

myDoc.save().then((doc) => console.log(doc));
