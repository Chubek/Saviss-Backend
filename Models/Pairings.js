const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const PairingSchema = new Schema({
    acceptedByListener: {
        type: Boolean,
        default: false,
    },
    expired: {
        type: Boolean,
        default: false
    },
    presentedListeners: [String],
    listenerId: String,
    seekerNumber: {
        type: String,
        encrypt: true,
        searchable: true,
    },
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
    seekerPk: {
        type: String,
        encrypt: true,
        searchable: true,
    },
});

PairingSchema.plugin(jumblator, {
    secret: "CHANGE_IN_PRODUCTION", //change to env var in production
});

module.exports = mongoose.model("Pairing", PairingSchema);
