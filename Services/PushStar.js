const {Expo} = require('expo-server-sdk')
const User = require("../Models/User");
const Session = require("../Models/Session");

module.exports = async (sessionId, star) => {
    const session = await Session.findOne({_id: sessionId});
    const userListener = await User.findOne({number: session.listenerNumber});
    const userSeeker = await User.findOne({number: session.seekerNumber});


    const pushTokens = [userListener.pushToken];

    const expo = new Expo();

    for (let pushToken of pushTokens) {

        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
        }

        let messages = []

        messages.push({
            to: pushToken,
            sound: 'default',
            body: `You received a ${star} star from your chat partner!`,
            data: {}
        })


        let chunks = expo.chunkPushNotifications(messages);

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    }

}

