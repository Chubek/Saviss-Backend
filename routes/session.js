const Session = require("../Models/Session");
const router = require('express').Router();
const moment = require("moment");
const WaitingPool = require("../Models/WaitingPool");
const pushStar = require("../Services/PushStar");


router.post("/startSession", async (req, res) => {
    const seekerToken = req.body.Number;
    const seekerReason = req.body.reason;

    const session = new Session({
        seekerNumber: seekerNumber,
        dateStarted: moment(),
        reason: seekerReason
    })

    const savedDoc = await session.save();

    await WaitingPool.findOneAndUpdate({sessionId: savedDoc._id},
        {$set: {seekerReason: seekerReason, requestedAt: moment()}},
        {upsert: true});

    res.sendStatus(200);


})

router.put("/acceptSession", async (req, res) => {
    const sessionId = req.body.sessionId;
    const listenerNumber = req.body.listenerNumber;

    await Session.findOneAndUpdate({_id: sessionId}, {$set: {listenerNumber: listenerNumber}})
    await WaitingPool.findOneAndUpdate({sessionId: sessionId}, {$set: {listenerId: listenerNumber}});

    res.sendStatus(200);
})


router.put("/endSession", async (req, res) => {
    const sessionId = req.body.sessionId;
    const star = req.body.star;
    const thumbs = req.body.thumbs === "up";

    await Session.findOneAndUpdate({_id: sessionId}, {
        $set: {
            endedAt: moment(),
            feedback: {thumbs: thumbs, star: star}
        }
    });
    await WaitingPool.findOneAndUpdate({sessionId: sessionId}, {$set: {ended: moment()}});

    pushStar(sessionId, star);

    res.sendStatus(200);
})