const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    number: {
        type: String,
        encrypt: true,
        searchable: true
    },
    otp: String,
    otpCreationHour: Date,
    banned: Boolean,
    ignoredNumbers: [String],
    pushToken: String
})


UserSchema.plugin(jumblator, {
    secret: process.env.JUMBLATOR_SECRET, //NOTE: change to process.env during production
});

module.exports = mongoose.model("User", UserSchema);