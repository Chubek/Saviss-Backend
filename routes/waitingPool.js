const WaitingPool = require("../Models/WaitingPool");
const router = require("express").Router();
const ListenerAuth = require("../Middleware/ListenerAuth")

router.post("/get", async (req, res) => {
    const pool = await WaitingPool.find({listenerId: '', ended: false});

    if (pool.length < 1) {
        res.sendStatus(404);
        return false;
    }

    res.status(200).json({pool});
})

