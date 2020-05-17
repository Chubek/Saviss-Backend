require("dotenv").config();
const router = require("express").Router();
const ListenerSchema = require("../Models/Listener");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../Services/Mailer");
const _ = require("lodash");
const ListenerAuth = require("../Middleware/ListenerAuth");
const AdminSchema = require("../Models/Admin");
const fs = require("fs");
const randomstring = require("randomstring");
const sha256File = require("sha256-file");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const SendOTP = require("../Services/SendOTP");
const asyncHandler = require("express-async-handler");
const cryptoRandomString = require("crypto-random-string");
const helpers = require("../Services/Helpers");
const DecryptMW = require("../Middleware/DecryptMW");

//GETs
router.get("/get/all", (req, res) => {
  ListenerSchema.find({})
    .then((listenerDocs) => {
      res.status(200).json({ listenerDocs });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.get("/get/single/:listenerid", (req, res) => {
  const listenerId = req.params.listenerid;
  ListenerSchema.findOne({ _id: listenerId })
    .then((listenerDoc) => {
      if (!listenerDoc) {
        res.status(200).json({ noListenerDoc: true });
        return false;
      }
      res.status(200).json({
        listenerDoc,
      });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.get("/get/username", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;

  ListenerSchema.findOne({ _id: listenerId })
    .then((listenerDoc) => {
      if (!listenerDoc) {
        res.status(200).json({ noListenerDoc: true });
        return false;
      }
      res.status(200).json({ userName: listenerDoc.userName });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

//POSTs

router.post("/register", (req, res) => {
  const { userName, email, categories } = req.body;
  let { number } = req.body;
  const isTest = req.body.test === "true" ? true : false;
  let password = _.random(100, 999) + _.random(1000, 9999);
  if (isTest) {
    password = "0000";
  }
  const emailVerificationCode = _.random(100, 999) + _.random(1000, 9999);
  number = helpers.popNumber(number);

  if (!userName) {
    res.status(401).json({ notSent: "userName" });
    return false;
  }
  if (!email) {
    res.status(401).json({ notSent: "email" });
    return false;
  }

  if (!number) {
    res.status(401).json({ notSent: "number" });
  }

  const indianRe = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;

  if (!indianRe.test(number)) {
    res.status(401).json({ numberNotIndian: true });
    return false;
  }

  ListenerSchema.findOne({ cell: number })
    .then((listenerDoc) => {
      if (listenerDoc) {
        if (listenerDoc.email === email) {
          res.status(401).json({ isSame: "email" });
          return false;
        } else if (listenerDoc.userName === userName) {
          res.status(401).json({ isSame: "userName" });
          return false;
        } else if (
          listenerDoc.userName === userName &&
          listenerDoc.email === email &&
          listenerDoc.cell === number
        ) {
          res.status(401).json({ isSame: "listener" });
          return false;
        } else if (listenerDoc.cell === number) {
          res.status(401).json({ isSame: "number" });
          return false;
        }
      } else {
        const Listener = new ListenerSchema({
          userName: userName,
          email: email,
          "otp.password": password,
          "otp.creationHour": new Date()
            .toISOString()
            .substr(11, 5)
            .replace(":", ""),
          cell: number,
          $addToSet: { categories: { $each: categories } },
          emailVerificationCode: emailVerificationCode,
        });

        Listener.save()
          .then((savedDoc) => {
            sendMail(
              email,
              "Your Registeration at 247Buddy Requires activation",
              `Your activation code is: ${emailVerificationCode}. \n Please enter the above code into the specified field in the app.`
            )
              .then(() => {
                SendOTP(password, number)
                  .then(() => {
                    res.status(200).json({
                      listenerDoc: savedDoc,
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
          })
          .catch((e) => {
            console.error(e);
            res.sendStatus(500);
          });
      }
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.post("/auth", (req, res) => {
  const { password } = req.body;
  let { number } = req.body;
  number = helpers.popNumber(number);
  if (!number) {
    res.status(401).json({ notSent: "loginString" });
  }
  if (!password) {
    res.status(401).json({ notSent: "password" });
  }

  ListenerSchema.findOne({ cell: number })
    .then((listenerDoc) => {
      if (!listenerDoc) {
        res.status(404).json({ isUser: false });
        return false;
      }
      const now = parseInt(
        new Date().toISOString().substr(11, 5).replace(":", "")
      );
      const passwordTime = parseInt(listenerDoc.otp.creationHour);
      const difference = now - passwordTime;

      if (listenerDoc.otp.password === password && difference < 159) {
        jwt.sign(
          { id: listenerDoc._id },
          process.env.JWT_SECRET,
          (err, token) => {
            if (err) throw err;
            if (listenerDoc.cellActivated == false) {
              listenerDoc
                .findOneAndUpdate(
                  { _id: listenerDoc._id },
                  { cellActivated: true }
                )
                .then(() => {
                  res.status(200).json({ token: token, listenerDoc });
                })
                .catch((e) => {
                  console.error(e);
                  res.sendStatus(500);
                });
            } else {
              res.status(200).json({ token: token, listenerDoc });
            }
          }
        );
      }
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

//PUTs

router.put("/request/otp", (req, res) => {
  let { number } = req.body;
  number = helpers.popNumber(number);
  const isTest = req.body.test === "true" ? true : false;

  let otp = _.random(100, 999) + _.random(1000, 9999);
  if (isTest) {
    otp = "0000";
  }
  ListenerSchema.findOneAndUpdate(
    { cell: number },
    {
      "otp.password": otp,
      "otp.creationHour": new Date()
        .toISOString()
        .substr(11, 5)
        .replace(":", ""),
    }
  )
    .then(() => {
      SendOTP(otp, number)
        .then(() => {
          res.status(200).json({ otpUpdated: true, otpSent: true });
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

router.put("/verify/email", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const activationCode = req.body.activationCode;

  ListenerSchema.findOne({ _id: listenerId }).then((listenerDoc) => {
    if (listenerDoc.emailVerificationCode === activationCode) {
      ListenerSchema.findOneAndUpdate(
        { _id: listenerId },
        {
          emailVerified: true,
        }
      )
        .then(() => res.status(200).json({ emailIsVerified: true }))
        .catch((e) => {
          console.error(e);
          res.sendStatus(500);
        });
      return true;
    } else {
      res.status(403).json({ emailIsVerified: false });
      return false;
    }
  });
});

router.put("/set/status", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const status = req.body.status;

  ListenerSchema.findOneAndUpdate(
    { _id: listenerId },
    { "status.online": status }
  )
    .then(() => res.status(200).json({ isOnline: status }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/set/session", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const session = req.body.session;

  ListenerSchema.findOneAndUpdate(
    { _id: listenerId },
    { "status.currentEngagedSessionId": session }
  )
    .then(() => {
      res.status(200).json({ session: session });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/set/avatar", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ filesUploaded: false });
  }

  const avatar = req.files.avatar;
  const extension = avatar.name.split(".").pop();

  const path = appRoot + "/public/img/avatars/" + listenerId;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  const avatarFileName = "Avatar_" + randomstring(4) + "." + extension;
  const filePath = path + "/" + avatarFileName;

  avatar.mv(filePath, (err) => {
    if (err) throw err;

    async () => {
      await imagemin(filePath, {
        destination: path,
        plugins: [
          imageminJpegtran(),
          imageminPngquant({ quality: [0.5, 0.6] }),
        ],
      });
    };

    sha256File(filePath, (err, checksum) => {
      if (err) throw err;

      ListenerSchema.findOne({ _id: listenerId }).then((listenerDoc) => {
        if (listenerDoc.avatar.src) {
          fs.unlinkSync(listenerDoc.avatar.src);
        }

        ListenerSchema.findOneAndUpdate(
          { _id: listenerId },
          {
            $set: { "avatar.src": filePath, "avatar.sha256": checksum },
          }
        )
          .then(() =>
            res.status(200).json({
              avatarPath: filePath,
              avatarName: avatarFileName,
            })
          )
          .catch((e) => {
            console.error(e);
            res.sendStatus(500);
          });
      });
    });
  });
});

router.put("/change/email", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const email = req.body.email;
  const verificationCode = _.random(100, 999) + _.random(1000, 9999);

  ListenerAuth.findOneAndUpdate(
    { _id: listenerId },
    { emailVerificationCode: verificationCode, emailVerified: false }
  ).then(() => {
    sendMail(
      email,
      "Your Email Change at 247Buddy Requires Verification",
      `Your verification code is: ${verificationCode}. \n Please enter the above code into the specified field in the app.`
    )
      .then(() => {
        res.status(200).json({ verificationEmailSent: true });
      })
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  });
});

router.put("/set/categories", ListenerAuth, (req, res) => {
  const listenerId = req.listener.id;
  const categories = req.body.categories;

  ListenerSchema.findOneAndUpdate(
    { _id: listenerId },
    { $addToSet: { categories: { $each: categories } } }
  )
    .then(() => {
      res.status(200).json({ categoriesSet: true });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

router.put("/set/pk", [ListenerAuth, DecryptMW], (req, res) => {
  const userId = req.user.id;
  const pk = req.pk;

  ListenerSchema.findOneAndUpdate({ _id: userId }, { publicKey: pk })
    .then(() => {
      res.status(200).json({ pkSet: true });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

module.exports = router;
