const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    listenerNumber: {
        type: String,
        encrypt: true,
        searchable: true
    },
    seekerNumber: {
        type: String,
        encrypt: true,
        searchable: true
    },
    dateStarted: Date,
    dateEnded: Date,
    reason: String,
    feedback: {
        thumbs: Boolean,
        star: String,

    },
    reports: {
        reporter: String,
        reportReason: String,
    },
})

SessionSchema.plugin(jumblator, {
    secret: process.env.JUMBLATOR_SECRET, //NOTE: change to process.env during production
});


module.exports = mongoose.model("Session", SessionSchema);