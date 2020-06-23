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
})

router.post("/accepted/:sessionId", (req, res) => {
    if (e) throw e;
    const sessionId = req.params.sessionId;

    channel.publish("accepted", JSON.stringify({sessionId: sessionId}), (e) => {
        console.log(`${sessionId} was accepted.`)
    })

})

router.post("/expired/:sessionId", (req, res) => {
    if (e) throw e;
    const sessionId = req.params.sessionId;

    channel.publish("expired", JSON.stringify({sessionId: sessionId}), (e) => {

    })
})

module.exports = router;