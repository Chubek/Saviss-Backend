const User = require("../Models/User");
const router = require("express").Router();
const moment = require("moment");
const _ = require("lodash");
const SendOTP = require("../Services/SendOTP");
const AdminAuth = require("../Middleware/AdminAuth");
const Session = require("../Models/Session")
const jwt = require("jsonwebtoken");
const UserAuth = require("../Middleware/UserAuth")

router.post("/auth", async (req, res) => {
    const number = req.body.number;
    const otp = req.body.otp;

    const user = await User.findOne({number: number});

    if (!user) {
        res.sendStatus(404);
        return false;
    }

    if (user.banned) {
        res.sendStatus(407);
        return false;
    }

    const expiryHour = moment(user.otpCreationHour).diff(moment(), 'minutes') <= 30;

    if (!expiryHour) {
        res.sendStatus(401);
        return false;
    }


    if (user.otp !== otp) {
        res.sendStatus(403);
        return false;
    }

    res.status(200).json({token: jwt.sign(number, process.env.JWT_SECRET)});

})

router.put("/requestOtp", async (req, res) => {
    const number = req.body.number;
    const isTest = req.body.isTest === "true";
    const pushToken = req.body.pushToken;

    let otp;

    if (isTest) {
        otp = "9999"
    } else {
        otp = _.random(9) + _.random(9) + _.random(9) + _.random(9);
        await SendOTP(otp, number);
    }

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


router.put("/ignore", async (req, res) => {
    const {number, role, sessionId} = req.body;

    const session = await Session.findOne({_id: sessionId});

    const ignoredNumber = role === "Listener" ? session.seekerNumber : session.listenerNumber;

    await User.findOneAndUpdate({number: number}, {$set: {$push: {$ignoredNumbers: {ignoredNumber}}}});

    res.sendStatus(200);
})

router.get("/getIgnored", UserAuth, async (req, res) => {
    const user = await User.findOne({number: req.number});

    res.status(200).json({ignoredNumbers: user.ignoredNumbers});

})

module.exports = router;