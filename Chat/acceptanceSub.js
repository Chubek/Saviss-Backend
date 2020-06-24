const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API);
const channel = ablyRealtime.channels.get("waiting-pool");
const router = require("express").Router();

router.post("/entered/:sessionId", (req, res) => {
    const sessionId = req.params.sessionId;

    channel.publish("entered", JSON.stringify({sessionId: sessionId}), (e) => {
        if (e) throw e;
        console.log(`${sessionId} joined the waiting pool.`)
    })

    res.sendStatus(200);
})

router.post("/accepted/:sessionId", (req, res) => {
    if (e) throw e;
    const sessionId = req.params.sessionId;

    channel.publish("accepted", JSON.stringify({sessionId: sessionId}), (e) => {
        console.log(`${sessionId} was accepted.`)
    })

    res.sendStatus(200);
})

router.post("/expired/:sessionId", (req, res) => {

    const sessionId = req.params.sessionId;

    channel.publish("expired", JSON.stringify({sessionId: sessionId}), (e) => {
        if (e) throw e;
        channel.publish("accepted", JSON.stringify({sessionId: sessionId}), (e) => {
            console.log(`${sessionId} was expired.`)
        })
    })

    res.sendStatus(200);
})

module.exports = router;