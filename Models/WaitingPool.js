const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const WaitingPoolSchema = new Schema({
    sessionId: String,
    seekerReason: String,
    seekerNumber: {
        type: String,
        encrypt: true,
        searchable: true
    },
    listenerId: {
        type: String,
        default: ''
    },
    requestedAt: String,
    ended: {
        type: Boolean,
        default: false
    }
})

WaitingPoolSchema.plugin(jumblator, {
    secret: process.env.JUMBLATOR_SECRET, //NOTE: change to process.env during production
});

module.exports = mongoose.model("WaitingPool", WaitingPoolSchema);