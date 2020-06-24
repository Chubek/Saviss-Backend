require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const colors = require("colors");
const app = express();
const bodyParser = require("body-parser")

global.appRoot = path.resolve(__dirname);
global.envPath = path.join(appRoot, ".env");
global.users = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    fileUpload({
        createParentPath: true,
    })
);
app.use(bodyParser.json());

app.use("/listener", require("./routes/listener"));
app.use("/admin", require("./routes/admin"));
app.use("/blocked", require("./routes/blockedNumbers"));
app.use("/superAdmin", require("./routes/superAdmin"));
app.use("/session", require("./routes/pairings"));
app.use("/pool", require("./routes/waitingPool"));
app.use("/chat", require("./Chat/route"));
app.use("/poolop", require("./Chat/acceptanceSub"));

const db = mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.error("MongoDB Connected".green.inverse))
    .catch((e) => console.error(`${e}`.underline.red));
mongoose.set("useFindAndModify", false);

const port = process.env.PORT;

app.listen(port, () =>
    console.log(`Server started on port ${port}`.blue.inverse)
);

module.exports = app;
