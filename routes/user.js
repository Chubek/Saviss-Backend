const User = require("../Models/User");
const router = require("express").Router();
const moment = require("moment");
const _ = require("lodash");
const SendOTP = require("../Services/SendOTP");
const AdminAuth = require("../Middleware/AdminAuth");

router.post("/auth", async (req, res) => {
    const number = req.body.number;
    const otp = req.body.otp;

    const user = await User.find({number: number});

    if (!user) {
        res.sendStatus(404);
        return false;
    }

    const expiryHour = moment(user.otpCreationHour).add(2, 'hours') <= moment();

    if (expiryHour && user.otp === otp) {
        res.sendStatus(200)
    } else {
        res.sendStatus(403);
    }
})

router.put("/requestOtp", async (req, res) => {
    const number = req.body.number;
    const isTest = req.body.isTest === "true";
    const pushToken = req.body.pushToken;

    let otp;

    if (isTest) otp = "9999";

    otp = _.random(9) + _.random(9) + _.random(9) + _.random(9);

    await User.findOneAndUpdate({number: number}, {
        $set: {
            otp: otp,
            otpCreationHour: moment(),
            pushToken: pushToken
        }
    }, {upsert: true});

    res.sendStatus(200);

})

router.put("/ban", AdminAuth, async (req, res) => {
    const number = req.body.number;

    await User.findOneAndUpdate({number: number}, {$set: {banned: true}}, {upsert: true});

    res.sendStatus(200);

})

router.put("/report", async (req, res) => {
    const number = req.body.number;
    const reportReason = req.body.reportReason;

    if (!reportReason) {
        res.sendStatus(403);
        return false;
    }

    await User.findOneAndUpdate({number: number},
        {$set: {$push: {reports: {reportDate: moment(), reportReason: reportReason}}}},
        {upsert: true});

    res.sendStatus(200);
})

router.put("/ignore", async (req, res) => {
    const {number, ignoredNumber} = req.body;

    await User.findOneAndUpdate({number: number}, {$set: {$push: {$ignoredNumber: {ignoredNumber}}}});

    res.sendStatus(200);
})

module.exports = router;