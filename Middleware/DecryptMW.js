require("dotenv").config();
const CryptoJS = require("crypto-js");

function DecryptMW(req, res, next) {
  const pkEnc = req.headers("x-public-key");

  req.pk = CryptoJS.AES.decrypt(pkEnc, process.env.PK_DEC_KEY);

  next();
}

module.exports = DecryptMW;
