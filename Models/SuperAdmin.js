require("dotenv").config();
const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const SuperAdminSchema = Schema({
  userName: String,

  email: String,

  password: String,

  loginDates: { type: [Date] },
  adminIdsCreatedBy: { type: [String] },
});

SuperAdminSchema.plugin(jumblator, {
  secret: "CHANGE_IN_PRODUCTION",
});

module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
