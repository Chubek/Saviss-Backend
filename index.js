require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const colors = require("colors");

const app = express();

global.appRoot = path.resolve(__dirname);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const db = mongoose
  .connect(
    "mongodb://" +
      process.env.DB_HOST +
      ":" +
      process.env.DB_PORT +
      "/" +
      process.env.DB_NAME,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => console.error("MongoDB Connected".green.inverse))
  .catch((e) => console.error(`${e}`.underline.red));
mongoose.set("useFindAndModify", false);

app.use("/avatars", express.static(path.join(__dirname, "public/img/avatars")));

app.use("/listener", require("./Routes/listener"));
app.use("/admin", require("./Routes/admin"));
app.use("/blocked", require("./Routes/blockedNumbers"));
app.use("/superAdmin", require("./Routes/superAdmin"));
app.use("/session", require("./Routes/pairings"));

/*app.get("/", function(req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "dist") });
});*/

const port = process.env.PORT || 5000;

app.listen(port, () =>
  console.error(`Server started on port ${port}`.blue.inverse)
);
