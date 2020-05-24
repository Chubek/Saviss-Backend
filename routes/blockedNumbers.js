require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const PairingSchema = require("../Models/Pairings");
const AdminAuth = require("../Middleware/AdminAuth");
const BlockedNumbersSchema = require("../Models/BlockedNumbers");
const AdminSchema = require("../Models/Admin");
const helpers = require("../Services/Helpers");

router.post("/block", AdminAuth, (req, res) => {
  const adminId = req.admin.id;
  let { number, reportedMessage } = req.body;
  number = helpers.popNumber(number);

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

router.put("/unblock", AdminAuth, async (req, res) => {
  let { number } = req.body;
  number = helpers.popNumber(number);

  const numberCheck = await BlockedNumbersSchema.findOne({
    blockedNumber: number,
  });  

  if (!numberCheck) {
    res.status(404).json({ numberExists: false });
    return false;
  }

  await BlockedNumbersSchema.findOneAndUpdate(
    { blockedNumber: number },
    { blockedNumber: "Unblocked" }
  );

  res.status(200).json({ numberUnblocked: true });
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
