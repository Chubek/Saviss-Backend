const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API)
const channel = ablyRealtime.channels.get('ably-chat');
const router = require("express").Router();

router.post('/send_message', (req, res) => {
    var data = {
        user: req.body.name,
        msg: req.body.msg,
        action: req.body.action
    }
    channel.publish('data', data, (err) => {
        if (err) {
            console.log('publish failed with error ' + err);
        } else {
            console.log('publish succeeded ' + data.msg);
        }
    })
    res.send({status: 'okay', data: data});

});


module.exports = router;
