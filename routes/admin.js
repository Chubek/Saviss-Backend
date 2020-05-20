require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminSchema = require("../Models/Admin");
const CryptoJS = require("crypto-js");
const AdminAuth = require("../Middleware/AdminAuth");
const SuperAdminAuth = require("../Middleware/SuperAdminAuth");
const helpers = require("../Services/Helpers");
//GETs
router.get("/get/all", SuperAdminAuth, async (req, res) => {
  const adminDocs = await AdminSchema.find({});

  if (adminDocs.length < 0) {
    res.status(404).json({ noAdminFound: true });
    return false;
  }
  res.status(200).json({ adminDocs });
});

router.get("/get/single/:adminid", SuperAdminAuth, async (req, res) => {
  const adminDoc = await AdminSchema.findOne({ _id: req.params.adminid });

  if (!adminDoc) {
    res.status(404).json({ noAdmin: true });
    return false;
  }

  res.status(200).json({ adminDoc });
});

//POSTs

router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  AdminSchema.findOne({
    email: email,
  }).then((adminDoc) => {
    if (!adminDoc) {
      res.status(404).json({ adminExists: false });
      return false;
    }

    bcrypt.compare(password, adminDoc.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        jwt.sign({ id: adminDoc._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) throw err;
          AdminSchema.findOneAndUpdate(
            {
              _id: adminDoc._id,
            },
            { $push: { loginDates: new Date() } }
          )
            .then(() => {
              res.status(200).json({ token: token, adminDoc });
            })
            .catch((e) => {
              console.error(e);
              res.sendStatus(500);
            });
        });
      } else {
        res.status(403).json({ passwordCorrect: false });
      }
    });
  });
});

//PUTs

router.put("/edit/info", AdminAuth, (req, res) => {
  const adminId = req.admin.id;
  const { email, userName } = req.body;
  const phoneNumber = helpers.popNumber(req.body.phoneNumber);

  AdminSchema.findOneAndUpdate(
    { _id: adminId },
    {
      userName: userName,

      phoneNumber: phoneNumber,

      email: email,
    }
  )
    .then(() => res.status(200).json({ adminEdited: true }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/change/password", AdminAuth, (req, res) => {
  const adminId = req.admin.id;
  const { oldPassword, newPassword } = req.body;

  AdminSchema.findOne({ _id: adminId }).then((adminDoc) => {
    bcrypt.compare(oldPassword, adminDoc.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        bcrypt.hash(newPassword, 12, (err, hash) => {
          if (err) throw err;
          AdminSchema.findOneAndUpdate({ _id: adminId }, { password: hash })
            .then(() => res.status(200).json({ passwordChanged: true }))
            .catch((e) => {
              console.error(e);
              res.sendStatus(500);
            });
        });
      }
    });
  });
});

router.put("/set/approval/:listenerid", AdminAuth, (req, res) => {
  const listenerId = req.params.listenerid;
  const approval = req.body.approval === "true" ? true : false;

  ListenerSchema.findOneAndUpdate(
    { _id: listenerId },
    {
      "approvalStatus.approved": approval,
      $set: { "approvalStatus.approvalChangeDate": new Date() },
    }
  )
    .then(() => res.status(200).json({ isApproved: approval }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/ban/:listenerid", AdminAuth, (req, res) => {
  const listenerId = req.params.listenerid;
  const adminId = req.admin.id;
  const endDate = req.body.endDate;

  ListenerSchema.findByIdAndUpdate(
    { _id: listenerId },
    {
      $push: {
        "bannedStatus.formerBans": {
          banDate: "bannedStatus.banDate",
          expireDate: "bannedStatus.expireDate",
        },
      },
      $set: {
        "bannedStatus.banDate": new Date(),
        "bannedStatus.expireDate": endDate,
      },
    }
  )
    .then(() => {
      AdminSchema.findOneAndUpdate(
        { _id: adminId },
        { $push: { bannedListenersId: listenerId } }
      ).then(() => res.status(200).json({ listenerBanned: true }));
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

module.exports = router;
