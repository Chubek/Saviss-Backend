const mongooseFieldEncryption = require("mongoose-field-encryption")
  .fieldEncryption;
const Schema = mongoose.Schema;

const PairingSchema = new Schema({
  acceptedByListener: {
    type: Boolean,
    default: false,
  },
  presentedListeners: [String],
  listenerId: String,
  seekerNumber: String,
  listenerNick: String,
  seekerNick: String,
  categories: [String],
  seekerReason: String,
  sessionDate: {
    type: Date,
    default: Date.now,
  },
  startHour: String,
  endHour: String,
  report: {
    reportedBy: String,
    reportedEntity: String,
    reportedMessage: String,
  },
});

PairingSchema.plugin(mongooseFieldEncryption, {
  fields: ["seekerNumber"],
  secret: process.env.MONGOOSE_ENCRYPT_SECRET,
});

module.exports = mongoose.model("Pairing", PairingSchema);
