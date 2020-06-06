const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const cryptoRandomString = require("crypto-random-string");
const BlockedNumbersSchema = Schema({
  blockedNumber: {
    type: String,    
    encrypt: true,
    searchable: true,
  },
  dateBlocked: {
    type: Date,
    default: Date.now,
  },
  reportedMessage: String,
});

BlockedNumbersSchema.plugin(jumblator, {
  secret: "CHANGE_IN_PRODUCTION", //set to env var in production
});

module.exports = mongoose.model("BlockedNumber", BlockedNumbersSchema);
