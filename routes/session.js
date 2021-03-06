const Session = require("../Models/Session");
const router = require('express').Router();
const moment = require("moment");
const WaitingPool = require("../Models/WaitingPool");
const pushStar = require("../Services/PushStar");
const UserAuth = require("../Middleware/UserAuth");

router.post("/startSession", UserAuth, async (req, res) => {
    const seekerNumber = req.number;
    const seekerReason = req.body.reason;

    const session = new Session({
        seekerNumber: seekerNumber,
        dateStarted: moment(),
        reason: seekerReason
    })

    const savedDoc = await session.save();

    await WaitingPool.findOneAndUpdate({sessionId: savedDoc._id},
        {$set: {seekerReason: seekerReason, seekerNumber: seekerNumber, requestedAt: moment()}},
        {upsert: true});

    res.status(200).json({sessionId: savedDoc._id});


})

router.put("/acceptSession", UserAuth, async (req, res) => {
    const sessionId = req.number;
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
    await WaitingPool.findOneAndUpdate({sessionId: sessionId}, {$set: {ended: true}});

    pushStar(sessionId, star);

    res.sendStatus(200);
})


router.put("/report/:sessionId", async (req, res) => {
    const sessionId = req.params.sessionId;
    const reportReason = req.body.reportReason;
    const reporter = req.body.reporter;

    if (!reportReason) {
        res.sendStatus(403);
        return false;
    }

    await Session.findOneAndUpdate({_id: sessionId},
        {$set: {report: {reporter: reporter, reportReason: reportReason}}},
        {upsert: true});

    res.sendStatus(200);
})


router.put("/disconnect/:sessionId", async (req, res) => {
    await Session.findOneAndUpdate({_id: req.params.sessionId}, {$set: {endedAt: moment()}});
    await WaitingPool.findOneAndUpdate({sessionId: req.params.sessionId}, {$set: {ended: moment()}});

    res.sendStatus(200);
})


module.exports = router;