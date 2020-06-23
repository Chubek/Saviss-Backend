const WaitingPool = require("../Models/WaitingPool");
const router = require("express").Router();
const ListenerAuth = require("../Middleware/ListenerAuth")

router.get("/get", ListenerAuth, async (req, res) => {
    const pool = await WaitingPool.find({listenerId: '', ended: false});

    if (pool.length < 1) {
        res.sendStatus(404);
        return false;
    }

    res.status(200).json({pool});
})

router.get("/single/:sessionId", ListenerAuth, async (req, res) => {
    const poolSingle = await WaitingPool.find({sessionId: req.params.sessionId});

    if (!poolSingle) {
        res.sendStatus(404);
        return false;
    }

    res.status(200).json({poolSingle});
})

module.exports = router;