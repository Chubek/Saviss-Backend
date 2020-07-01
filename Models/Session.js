const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    listenerNumber: String,
    seekerNumber: String,
    dateStarted: Date,
    dateEnded: Date,
    reason: String,
    feedback: {
        thumbs: Boolean,
        star: String,

    }
})

module.exports = mongoose.model("Session", SessionSchema);