const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API)
const router = require("express").Router();
const ChannelAuth = require("../Middleware/ChannelAuth");
const ListenerAuth = require("../Middleware/ListenerAuth")
const uuid = require("node-uuid");

router.post("/accept", [ListenerAuth, ChannelAuth], (req, res) => {
    const channel = req.channel;
    const listenerId = req.listener.id;

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

    const data = {
        _id: uuid(),
        user: {
            _id: req.body.name.toLowerCase() === "listener" ? 1 : 2,
            name: req.body.name,
        },
        text: req.body.msg,
        createdAt: new Date()
    }
    channel.publish('message', JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('publish succeeded ' + data.text + " on channel by " + req.user.name + " " + channelName);

    })
    res.send({status: 'okay', data: data});

});


module.exports = router;
