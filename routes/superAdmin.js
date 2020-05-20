require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdminSchema = require("../Models/SuperAdmin");
const AdminSchema = require("../Models/Admin");
const CryptoJS = require("crypto-js");
const SuperAdminAuth = require("../Middleware/SuperAdminAuth");
const AsyncHandler = require("express-async-handler");
const helpers = require("../Services/Helpers");
//POSTs

router.post("/create", async (req, res) => {
  const { userName, email, password } = req.body;

  const superDocs = await SuperAdminSchema.find({});
  if (superDocs.length > 0) {
    res.status(403).json({ superAdminExists: true });
    return false;
  }

  const superAdmin = new SuperAdminSchema({
    userName: userName,
    email: email,
    password: bcrypt.hashSync(password, 12),
  });

  await superAdmin.save();

  res.status(200).json({ superAdminCreated: true });
});

router.post("/auth", (req, res) => {
  const { email, userName, password } = req.body;

  if (email && !userName) {
    SuperAdminSchema.findOne({
      email: email,
    }).then((superDoc) => {
      bcrypt.compare(password, superDoc.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          jwt.sign(
            { id: superDoc._id },
            process.env.JWT_SECRET,
            (err, token) => {
              if (err) throw err;

              res.status(200).json({ token: token, superDoc });
            }
          );
        }
      });
    });
    return true;
  } else if (userName && !email) {
    SuperAdminSchema.findOne({
      userName: userName,
    }).then((superDoc) => {
      bcrypt.compare(password, superDoc.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          jwt.sign(
            { id: superDoc._id },
            process.env.JWT_SECRET,
            (err, token) => {
              if (err) throw err;

              res.status(200).json({ token: token, superDoc });
            }
          );
        }
      });
    });
    return true;
  } else if (userName && email) {
    SuperAdminSchema.findOne({
      userName: userName,
    }).then((superDoc) => {
      bcrypt.compare(password, superDoc.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          jwt.sign(
            { id: superDoc._id },
            process.env.JWT_SECRET,
            (err, token) => {
              if (err) throw err;

              res.status(200).json({ token: token, superDoc });
            }
          );
        }
      });
    });
    return true;
  }
});

router.put("/edit/info", SuperAdminAuth, (req, res) => {
  const superId = req.super.id;
  const { userName, email } = req.body;

  SuperAdminSchema.findOneAndUpdate(
    { _id: superId },
    { userName: userName, email: email }
  )
    .then(() => res.status(200).json({ superUpdated: true }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/change/password", SuperAdminAuth, (req, res) => {
  const superId = req.super.id;
  const { oldPassword, newPassword } = req.body;

  SuperAdminSchema.findOne({ _id: superId }).then((superDoc) => {
    bcrypt.compare(oldPassword, superDoc.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        bcrypt.hash(newPassword, 12, (err, hash) => {
          if (err) throw err;
          SuperAdminSchema.findOneAndUpdate(
            { _id: superId },
            { password: hash }
          )
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

router.post("/create/admin", SuperAdminAuth, async (req, res) => {
  const superId = req.super.id;
  const { adminUserName, adminEmail, adminPassword } = req.body;
  const adminNumber = helpers.popNumber(req.body.adminNumber);

  const userNameCheck = await AdminSchema.findOne({
    userName: adminUserName,
  });
  if (userNameCheck) {
    res.status(401).json({ isSame: "userName" });
    return false;
  }

  const numberCheck = await AdminSchema.findOne({ phoneNumber: adminNumber });
  if (numberCheck) {
    res.status(401).json({ isSame: "number" });
    return false;
  }

  const emailCheck = await AdminSchema.findOne({ email: adminEmail });
  if (emailCheck) {
    res.status(401).json({ isSame: "email" });
    return false;
  }

  const admin = new AdminSchema({
    userName: adminUserName,
    email: adminEmail,
    phoneNumber: adminNumber,
    password: bcrypt.hashSync(adminPassword, 12),
  });

  const savedDoc = admin.save();

  await SuperAdminSchema.findOneAndUpdate(
    { _id: superId },
    { $push: { adminIdsCreatedBy: savedDoc._id } }
  );
  res.status(200).json({ adminCreated: true });
});

router.put("/delete/admin", SuperAdminAuth, (req, res) => {
  const adminId = req.body.adminId;

  AdminSchema.findOneAndUpdate(
    { _id: adminId },
    { "bannedStatus.banned": true, "bannedStatus.banDate": new Date() }
  )
    .then(() => res.status(200).json({ adminBanned: true }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

module.exports = router;
