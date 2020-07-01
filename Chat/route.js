const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API)
const router = require("express").Router();
const ChannelAuth = require("../Middleware/ChannelAuth");
const ListenerAuth = require("../Middleware/ListenerAuth")
const uuid = require("node-uuid");

router.post("/accept", ChannelAuth, (req, res) => {
    const channel = req.channel;
    const listenerId = req.body.listenerNumber

    channel.publish("accepted", JSON.stringify({sessionId: req.channelName}), (e) => {
        if (e) throw e;
        console.log(`${req.channelName} was accepted by ${listenerId}`);
    })

    res.sendStatus(200);

})

router.post("/leave", ChannelAuth, (req, res) => {
    const channel = req.channel;

    channel.publish("left", null, (e) => {
        if (e) throw e;
        console.log("Seeker or Listener of the chat " + req.channelName + " left the session.")
    })
    res.sendStatus(200);

})


router.post('/sendMessage', ChannelAuth, (req, res) => {
    const channel = req.channel;
    const channelName = req.channelName;

    channel.publish('message', req.body.data, (err) => {
        if (err) throw err;
        console.log('publish succeeded ' + JSON.parse(req.body.data).text + " on channel " + channelName);

    })
    res.send({status: 'okay', data: data});

});


module.exports = router;
