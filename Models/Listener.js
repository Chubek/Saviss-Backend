require("dotenv").config();
const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const ListenrSchema = new Schema({
  userName: {
    type: String,
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
  },
  email: {
    type: String,
    encrypt: true,
    searchable: true,
  },
  emailVerificationCode: Number,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  cell: {
    type: String,
    encrypt: true,
    searchable: true,
  },

  cellActivated: {
    type: Boolean,
    default: true,
  },

  otp: {
    password: {
      type: String,
      encrypt: true,
      searchable: true,
    },
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
    currentEngagedSessionId: {
      type: String,
      default: "None",
    }, //if disengaged, will be "None"
    online: Boolean,
  },
  publicKey: {
    type: String,
    encrypt: true,
    searchable: true,
  },
});

ListenrSchema.plugin(jumblator, {
  secret: "CHANGEDURINGPRODUCTION", //NOTE: change to process.env during production
});

module.exports = mongoose.model("Listener", ListenrSchema);
