require("dotenv").config();
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
const Schema = mongoose.Schema;
const cryptoRandomString = require("crypto-random-string");

const SuperAdminSchema = Schema({
  userName: String,

  email: String,

  password: String,

  loginDates: { type: [Date] },
  adminIdsCreatedBy: { type: [String] },
});

SuperAdminSchema.plugin(mongooseFieldEncryption, {
  fields: ["email", "userName"],
  secret: process.env.MONGOOSE_ENCRYPT_SECRET,
  saltGenerator: cryptoRandomString,
});

module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
