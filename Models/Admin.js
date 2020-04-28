require("dotenv").config();
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
const cryptoRandomString = require("crypto-random-string");
const Schema = mongoose.Schema;

const AdminSchema = Schema({
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  loginDates: [Date],
  numbersBlockedId: [String],
  bannedListenersId: [String],
  bannedStatus: {
    banned: Boolean,
    banDate: Date,
  },
});

AdminSchema.plugin(mongooseFieldEncryption, {
  fields: ["email", "userName", "phoneNumber"],
  secret: process.env.MONGOOSE_ENCRYPT_SECRET,
  saltGenerator: cryptoRandomString,
});

module.exports = mongoose.model("Admin", AdminSchema);
