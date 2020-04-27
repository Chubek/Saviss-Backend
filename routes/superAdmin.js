require("dotenv").config({ path: "../.env" });
const router = require("express").Router();
const fieldEncryption = require("mongoose-field-encryption");
const ListenerSchema = require("../Models/Listener");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdminSchema = require("../Models/SuperAdmin");
const AdminSchema = require("../Models/Admin");
const CryptoJS = require("crypto-js");
const SuperAdminAuth = require("../Middleware/SuperAdminAuth");
//POSTs

router.post("/create", (req, res) => {
  const { isDefault, userName, email, password } = req.body;

  SuperAdminSchema.find({}).then((superDocs) => {
    if (superDocs.length > 0) {
      res.status(403).json({ superAdminExists: true });
      return false;
    }
  });

  if (isDefault) {
    const superAdmin = new SuperAdminSchema({});

    superAdmin
      .save()
      .then(() => res.status(200).json({ superAdminCreated: true }))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  } else if (!isDefault) {
    const userNameEnc = CryptoJS.AES.encrypt(userName, process.env.AES_KEY);
    const emailEnc = CryptoJS.AES.encrypt(email, process.env.AES_KEY);

    bcrypt.hash(password, 12, (err, hash) => {
      if (err) throw err;

      const superAdmin = new SuperAdminSchema({
        userName: userNameEnc,
        email: emailEnc,
        password: hash,
      });

      superAdmin
        .save()
        .then(() => res.status(200).json({ superAdminCreated: true }))
        .catch((e) => {
          console.error(e);
          res.sendStatus(500);
        });
    });
  }
});

router.post("/auth", (req, res) => {
  const { userName, email, password } = req.body;

  const userNameEnc = fieldEncryption.encrypt(
    CryptoJS.AES.encrypt(userName, process.env.AES_KEY),
    process.env.MONGOOSE_ENCRYPT_SECRET
  );
  const emailEnc = fieldEncryption.encrypt(
    CryptoJS.AES.encrypt(email, process.env.AES_KEY),
    process.env.MONGOOSE_ENCRYPT_SECRET
  );
  const passwordEnc = fieldEncryption.encrypt(
    CryptoJS.AES.encrypt(password, process.env.AES_KEY),
    process.env.MONGOOSE_ENCRYPT_SECRET
  );

  SuperAdminSchema.findOne({
    $or: [{ userName: userNameEnc }, { email: emailEnc }],
  }).then((superDoc) => {
    bcrypt.compare(password, superDoc.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        jwt.sign({ id: superDoc._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) throw err;
          superDoc.userName = CryptoJS.AES.decrypt(
            superDoc.userName,
            process.env.AES_KEY
          );
          superDoc.email = CryptoJS.AES.decrypt(
            superDoc.email,
            process.env.AES_KEY
          );

          res.status(200).json({ token: token, superDoc });
        });
      }
    });
  });
});

router.put("/edit/info", SuperAdminAuth, (req, res) => {
  const superId = req.super.id;
  const { userName, email } = req.body;

  const userNameEnc = CryptoJS.AES.encrypt(userName, process.env.AES_KEY);
  const emailEnc = CryptoJS.AES.encrypt(email, process.env.AES_KEY);

  SuperAdminSchema.findOneAndUpdate(
    { _id: superId },
    { userName: userNameEnc, email: emailEnc }
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

router.post("/create/admin", SuperAdminAuth, (req, res) => {
  const superId = req.super.id;
  const { adminUserName, adminEmail, adminPassword, adminNumber } = req.body;

  const userNameEncryped = CryptoJS.AES.encrypt(
    adminUserName,
    process.env.AES_KEY
  );
  const emailEncryped = CryptoJS.AES.encrypt(adminEmail, process.env.AES_KEY);
  const passwordEncryped = CryptoJS.AES.encrypt(
    adminPassword,
    process.env.AES_KEY
  );
  const numberEncryped = CryptoJS.AES.encrypt(adminNumber, process.env.AES_KEY);

  AdminSchema.findOne({
    $or: [
      { userName: userNameFieldEncryped },
      { email: emailFieldEncryped },
      { phoneNumber: numberFieldEncryped },
    ],
  }).then((adminDoc) => {
    if (adminDoc.userName === userNameEncryped) {
      res.status(403).json({ isSame: "userName" });
      return false;
    } else if (adminDoc.email === emailEncryped) {
      res.status(403).json({ isSame: "email" });
      return false;
    } else if (adminDoc.phoneNumber === numberEncryped) {
      res.status(403).json({ isSame: "number" });
      return false;
    } else if (
      adminDoc.userName === userNameEncryped &&
      adminDoc.email === emailEncryped &&
      adminDoc.phoneNumber === numbeEncryped
    ) {
      res.status(403).json({ isSame: "admin" });
      return false;
    }
  });

  const admin = new AdminSchema({
    userName: userNameEncryped,
    email: emailEncryped,
    phoneNumber: numberEncryped,
    password: bcrypt.hashSync(passwordEncryped, 12),
  });

  admin
    .save()
    .then((savedDoc) => {
      SuperAdminSchema.findOneAndUpdate(
        { _id: superId },
        { $push: { adminIdsCreatedBy: savedDoc._id } }
      )
        .then(() => res.status(200).json({ adminCreated: true }))
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
