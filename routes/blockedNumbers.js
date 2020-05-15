require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const PairingSchema = require("../Models/Pairings");
const AdminAuth = require("../Middleware/AdminAuth");
const BlockedNumbersSchema = require("../Models/BlockedNumbers");
const AdminSchema = require("../Models/Admin");

router.post("/block", AdminAuth, (req, res) => {
  const adminId = req.admin.id;
  const { number, reportedMessage } = req.body;

  const blockedNumber = new BlockedNumbersSchema({
    blockedNumber: number,
    reportedMessage: reportedMessage,
  });

  blockedNumber.save().then((savedDoc) => {
    AdminSchema.findOneAndUpdate(
      { _id: adminId },
      { $set: { $push: { numbersBlockedId: savedDoc._id } } }
    )
      .then(() => res.status(200).json({ numberBlocked: true }))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  });
});

router.get("/get/single/:blockid", AdminAuth, (req, res) => {
  BlockedNumbersSchema.findOne({ _id: req.params.blockid })
    .then((blockDoc) => {
      if (!blockDoc) {
        res.status(404).json({ noBlockDoc: true });
        return false;
      }
      res.status(200).json({ blockDoc });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

module.exports = router;
