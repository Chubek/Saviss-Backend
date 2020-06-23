const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API)
const router = require("express").Router();
const ChannelAuth = require("../Middleware/ChannelAuth");
const ListenerAuth = require("../Middleware/ListenerAuth")

router.post("/accept", [ListenerAuth, ChannelAuth], (req, res) => {
    const channel = req.channel;
    const listenerId = req.listener.id;

    channel.publish("accepted", JSON.stringify({sessionId: req.channelName}), (e) => {
        if (e) throw e;
        console.log(`${req.channelName} was accepted by ${listenerId}`);
    })

})

router.post("/leave", ChannelAuth, (req, res) => {
    const channel = req.channel;

    channel.publish("left", null, (e) => {
        if (e) throw e;
        console.log("Seeker or Listener of the chat " + req.channelName + " left the session.")
    })
})


router.post('/sendMessage', ChannelAuth, (req, res) => {
    const channel = req.channel;
    const channelName = req.channelName;

    const data = {
        user: req.body.name,
        msg: req.body.msg,
    }
    channel.publish('message', JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('publish succeeded ' + data.msg + " on channel " + channelName);

    })
    res.send({status: 'okay', data: data});

});


module.exports = router;
