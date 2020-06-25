const ably = require('ably').Realtime;
const ablyRealtime = new ably(process.env.ABLY_API);

function ChannelAuth(req, res, next) {
    const channelName = req.header("x-session-id");

    req.channel = ablyRealtime.channels.get(channelName);
    req.channelName = channelName;
    next();
}

module.exports = ChannelAuth;