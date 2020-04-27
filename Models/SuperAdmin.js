require('dotenv').config()
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
const Schema = mongoose.Schema;
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");

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
});

module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
