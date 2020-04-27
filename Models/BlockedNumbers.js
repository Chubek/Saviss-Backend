const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;

const BlockedNumbersSchema = Schema({
  blockedNumber: {
    type: String,
    unique: true,
  },
  dateBlocked: {
    type: Date,
    default: Date.now,
  },
  reportedMessage: String,
});

BlockedNumbersSchema.plugin(mongooseFieldEncryption, {
  fields: ["blockedNumber"],
  secret: process.env.MONGOOSE_ENCRYPT_SECRET,
});

module.exports = mongoose.model("BlockedNumber", BlockedNumbersSchema);
