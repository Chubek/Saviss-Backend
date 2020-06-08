require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const colors = require("colors");
const websocketServer = require("./Chat/server");

websocketServer();

const app = express();

global.appRoot = path.resolve(__dirname);
global.envPath = path.join(appRoot, ".env");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const db = mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.error("MongoDB Connected".green.inverse))
  .catch((e) => console.error(`${e}`.underline.red));
mongoose.set("useFindAndModify", false);

app.use("/avatars", express.static(path.join(__dirname, "public/img/avatars")));

app.use("/listener", require("./routes/listener"));
app.use("/admin", require("./routes/admin"));
app.use("/blocked", require("./routes/blockedNumbers"));
app.use("/superAdmin", require("./routes/superAdmin"));
app.use("/session", require("./routes/pairings"));

/*app.get("/", function(req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "dist") });
});*/

const port = process.env.PORT || 5000;

app.listen(port, () =>
  console.error(`Server started on port ${port}`.blue.inverse)
);

module.exports = app;
