require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
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
});

module.exports = mongoose.model("Admin", AdminSchema);
