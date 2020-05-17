require("dotenv").config();
const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const AdminSchema = Schema({
  userName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    encryption: true,
    searchable: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    unique: true,
    encryption: true,
    searchable: true,
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

AdminSchema.plugin(jumblator, {
  secret: "CHANGEINPRODUCTION", //set to dotenv in production
});

module.exports = mongoose.model("Admin", AdminSchema);
