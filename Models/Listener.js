require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
const Schema = mongoose.Schema;

const ListenrSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    unique: true,
  },
  emailVerificationCode: Number,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  cell: {
    number: String,
    activated: {
      type: Boolean,
      default: true,
    },
  },
  otp: {
    password: String,
    creationHour: String,
    used: {
      type: Boolean,
      default: false,
    },
  },
  approvalStatus: {
    approved: {
      type: Boolean,
      default: false,
    },
    approvalChangeDate: Date,
  },
  avatar: {
    src: String,
    sha256: String,
  },
  categories: {
    type: [String],
    default: ["General"],
  },
  infractionsReported: [
    {
      sessionId: String,
      reportedNumber: String,
      reportedMessage: String,
      reportDate: Date,
    },
  ],
  reportedBySeekers: [
    {
      sessionId: String,
      reporterNumber: String,
      reportedMessage: String,
      reportDate: Date,
    },
  ],
  bannedStatus: {
    banDate: Date,
    expireDate: Date,
    formerBans: Array,
  },
  sessionIds: [String],
  status: {
    currentEngagedSessionId: String, //if disengaged, will be "None"
    online: Boolean,
  },
});

ListenrSchema.plugin(mongooseFieldEncryption, {
  fields: ["email", "number", "otp.password"],
  secret: process.env.MONGOOSE_ENCRYPT_SECRET,
});

module.exports = mongoose.model("Listener", ListenrSchema);
