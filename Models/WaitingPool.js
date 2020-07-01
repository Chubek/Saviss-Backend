const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WaitingPoolSchema = new Schema({
    sessionId: String,
    seekerReason: String,
    seekerNumber: String,
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

module.exports = mongoose.model("WaitingPool", WaitingPoolSchema);