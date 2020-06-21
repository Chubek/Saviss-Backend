require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const PairingSchema = require("../Models/Pairings");
const SeekerAuth = require("../Middleware/SeekerAuth");
const ListenerAuth = require("../Middleware/ListenerAuth");
const BlockedNumberSchema = require("../Models/BlockedNumbers");
const auths = {SeekerAuth, ListenerAuth};
const faker = require("faker");
const DecryptMW = require("../Middleware/DecryptMW");
const helpers = require("../Services/Helpers");
const WaitingPool = require("../Models/WaitingPool")

router.post("/createSession", async (req, res) => {
    const seekerNumber = helpers.popNumber(req.body.seekerNumber);
    const seekerNick = faker.internet.userName();
    const seekerReason = req.body.seekerReason;

    try {
        const blockedNumbers = await BlockedNumberSchema.findOne({blockedNumber: seekerNumber});

        if (blockedNumbers) {
            res.sendStatus(403);
            return false;
        }

        const sessionSchema = new PairingSchema({
            seekerNumber: seekerNumber,
            seekerReason: seekerReason,
            seekerNick: seekerNick
        });


        const savedDoc = await sessionSchema.save();

        const waitingPool = new WaitingPool({
            sessionId: savedDoc._id,
        })

        await waitingPool.save();


        res.status(200).json({sessionId: savedDoc._id});
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e});

    }

});


/*
router.post("/pairup/category", async (req, res) => {
  const seekerNumber = helpers.popNumber(req.body.seekerNumber);
  const categories = req.body.categories;
  const seekerNick = faker.internet.userName();

  const blockedNumber = await BlockedNumberSchema.findOne({
    blockedNumber: seekerNumber,
  });
  if (blockedNumber) {
    res.status(403).json({ numberBlocked: true });
    return false;
  }

  ListenerSchema.find({
    "approvalStatus.approved": true,
    "status.online": true,
    "status.currentEngagedSessionId": "None",
    categories: { $in: categories },
  }).then((listenerDocs) => {
    if (listenerDocs.length == 0) {
      res.status(404).json({ noListenerFound: true });
      return false;
    }

    listenerDocs = _.shuffle(listenerDocs);
    const presentedListeners = [];
    listenerDocs.forEach((selectedListener) => {
      presentedListeners.push(selectedListener._id);
    });

    const pairing = new PairingSchema({
      $push: {
        presentedListeners: { $each: presentedListeners },
        seekerNumber: seekerNumber,
        seekerNick: seekerNick,
        $push: { categories: { $each: categories } },
      },
    });

    pairing
      .save()
      .then((savedDoc) => {
        res.status(200).json({
          presentedListeners: presentedListeners,
          sessionDoc: savedDoc,
        });
      })
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  });
});
*/

router.put("/accept/:sessionId", ListenerAuth, async (req, res) => {
    const listenerId = req.listener.id;
    const sessionId = req.params.sessionId;

    try {
        const sessionDoc = await PairingSchema.findOne({_id: sessionId});

        if (sessionDoc.acceptedByListener && !sessionSchema.endHour) {
            res.sendStatus(403);
            return false;
        }

        await PairingSchema.findOneAndUpdate({_id: sessionId}, {
            acceptedByListener: true,
            startHour: new Date().toISOString().substr(11, 8),
            listenerId: listenerId
        });

        await WaitingPool.findOneAndUpdate({sessionId: sessionId}, {listenerId: listenerId});

        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e});
    }

});

router.put("/disconnect/:sessionId", async (req, res) => {
    const sessionId = req.params.sessionId;

    try {
        await PairingSchema.findOneAndUpdate({_id: sessionId}, {endHour: new Date().toISOString().substr(11, 8)});
        await WaitingPool.findOneAndUpdate({sessionId: sessionId}, {ended: true});
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e});
    }


});

router.get("/poll/:sessionId", async (req, res) => {
    const sessionId = req.params.sessionId;

    try {
        const sessionDoc = await PairingSchema.findOne({_id: sessionId});
        res.status(200).json({acceptedByListener: sessionDoc.acceptedByListener});
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
})

router.put("/report/by/listener/:sessionId", ListenerAuth, (req, res) => {
    const listenerId = req.listener.id;
    const seekerNumber = helpers.popNumber(req.body.seekerNumber);
    const sessionId = req.params.sessionId;
    const message = req.body.message;

    PairingSchema.findOneAndUpdate(
        {_id: sessionId},
        {
            "report.reportedBy": listenerId,
            "report.reportedEntity": seekerNumber,
            "report.reportedMessage": message,
        }
    )
        .then(() => {
            ListenerSchema.findOneAndUpdate(
                {_id: listenerId},
                {
                    $push: {
                        infractionsReported: {
                            sessionId: sessionId,
                            reporterNumber: seekerNumber,
                            reportedMessage: message,
                            reportDate: new Date(),
                        },
                    },
                }
            )
                .then(() => res.status(200).json({reported: true}))
                .catch((e) => {
                    console.error(e);
                    res.sendStatus(500);
                });
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});

router.get("/get/all", (req, res) => {
    PairingSchema.find({})
        .then((sessionDocs) => {
            if (sessionDocs.length < 1) {
                res.status(404).json({noSessionFound: true});
                return false;
            }
            res.status(200).json({sessionDocs});
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});

router.get("/get/single/:sessionid", (req, res) => {
    PairingSchema.findOne({_id: req.params.sessionid})
        .then((sessionDoc) => {
            if (!sessionDoc) {
                res.status(404).json({noSessionFound: true});
                return false;
            }
            res.status(200).json({sessionDoc});
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});


module.exports = router;
