const {Expo} = require('expo-server-sdk')
const router = require('express').Router();
const Listener = require("../Models/Listener");
const _ = require("lodash");


let expo = new Expo();
let batch = [];


router.post('/notifyListeners', async (req, res) => {


    const listenersDoc = await Listener.find({available: true});

    for (let pushToken of _.map(listenersDoc, 'pushToken')) {


        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

    }

    batch.push({
        to: _.map(listenersDoc, 'pushToken'),
        sound: 'default',
        body: req.body.body,
        data: req.body.data,
    })

    let chunks = expo.chunkPushNotifications(batch);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);

        } catch (error) {
            console.error(error);
        }
    }
    let receiptIds = [];
    for (let ticket of tickets) {
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }
    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (let chunk of receiptIdChunks) {
        try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);


            for (let receiptId in receipts) {
                let {status, message, details} = receipts[receiptId];
                if (status === 'ok') {
                    continue;
                } else if (status === 'error') {
                    console.error(
                        `There was an error sending a notification: ${message}`
                    );
                    if (details && details.error) {

                        console.error(`The error code is ${details.error}`);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }


})


module.exports = router;