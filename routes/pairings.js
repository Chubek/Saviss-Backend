require("dotenv").config({ path: "../.env" });
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const PairingSchema = require("../Models/Pairings");
const SeekerAuth = require("../Middleware/SeekerAuth");
const auths = { SeekerAuth, ListenerAuth };
const faker = require("faker");

router.post("/pairup/randomly", (req, res) => {
  const seekerNumber = req.body.seekerNumber;
  const seekerNick = faker.internet.userName();

  ListenerSchema.find({
    "status.online": true,
    "status.currentEngagedSessionId": "None",
    categories: { $in: ["General"] },
  }).then((listenerDocs) => {
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

router.post("/pairup/category", (req, res) => {
  const seekerNumber = req.body.seekerNumber;
  const categories = req.body.categories;
  const seekerNick = faker.internet.userName();
  ListenerSchema.find({
    "status.online": true,
    "status.currentEngagedSessionId": "None",
    categories: { $in: categories },
  }).then((listenerDocs) => {
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

router.put("/accept/session/:sessionid", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const sessionId = req.params.sessionid;
  const listenerNick = faker.internet.userName();

  PairingSchema.findOne({ _id: sessionId }).then((sessionDoc) => {
    jwt.sign(
      { id: listenerId },
      process.env.JWT_SECRET,
      (err, listenerToken) => {
        if (err) throw err;
        jwt.sign(
          { number: sessionDoc.seekerNumber },
          process.env.JWT_SECRET,
          (err, seekerToken) => {
            if (err) throw err;

            PairingSchema.findOneAndUpdate(
              { _id: sessionDoc._id },
              {
                acceptedByListener: true,
                $set: { listenerId: listenerId, listenerNick: listenerNick },
              },
              { new: true }
            ).then((sessionDoc) =>
              res.status(200).json({
                tokens: { listener: listenerToken, seeker: seekerToken },
                nicks: { seeker: seekerNick, listener: listenerNick },
                sessionDoc,
              })
            );
          }
        );
      }
    );
  });
});

router.put("/disconnect", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const sessionId = req.body.sessionId;

  ListenerSchema.findOne({ _id: listenerId })
    .then((listenerDoc) => {
      ListenerSchema.findOneAndUpdate(
        { _id: listenerId },
        {
          "status.currentEngagedSessionId": "None",
          $addToSet: { sessionIds: listenerDoc.status.currentEngagedSessionId },
        }
      )
        .then(() => {
          PairingSchema.findOneAndUpdate(
            { _id: sessionId },
            { seekerNumber: null }
          )
            .then(() => res.status(200).json({ disconnected: true }))
            .catch((e) => {
              console.error(e);
              res.sendStatus(500);
            });
        })
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

router.put(
  "/report/by/seeker",
  [auths.ListenerAuth, auths.SeekerAuth],
  (req, res) => {
    const listenerId = req.listener.id;
    const seekerNumber = req.body.seekerNumber;
    const sessionId = req.body.sessionId;
    const message = req.body.message;

    PairingSchema.findOneAndUpdate(
      { _id: sessionId },
      {
        "report.reportedBy": seekerNumber,
        "report.reportedEntity": listenerId,
        "report.reportedMessage": message,
      }
    )
      .then(() => {
        ListenerSchema.findOneAndUpdate(
          { _id: listenerId },
          {
            $push: {
              reportedBySeekers: {
                sessionId: sessionId,
                reporterNumber: seekerNumber,
                reportedMessage: message,
                reportDate: new Date(),
              },
            },
          }
        )
          .then(() => res.status(200).json({ reported: true }))
          .catch((e) => {
            console.error(e);
            res.sendStatus(500);
          });
      })
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
);

router.put(
  "/report/by/listener",
  [auths.ListenerAuth, auths.SeekerAuth],
  (req, res) => {
    const listenerId = req.listener.id;
    const seekerNumber = req.body.seekerNumber;
    const sessionId = req.body.sessionId;
    const message = req.body.message;

    PairingSchema.findOneAndUpdate(
      { _id: sessionId },
      {
        "report.reportedBy": listenerId,
        "report.reportedEntity": seekerNumber,
        "report.reportedMessage": message,
      }
    )
      .then(() => {
        ListenerSchema.findOneAndUpdate(
          { _id: listenerId },
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
          .then(() => res.status(200).json({ reported: true }))
          .catch((e) => {
            console.error(e);
            res.sendStatus(500);
          });
      })
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
);

router.get("/get/all", (req, res) => {
  PairingSchema.find({})
    .then((sessionDocs) => res.status(200).json({ sessionDocs }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.get("/get/single/:sessionid", (req, res) => {
  PairingSchema.findOne({ _id: req.params.sessionid })
    .then((sessionDoc) => res.status(200).json({ sessionDoc }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});
