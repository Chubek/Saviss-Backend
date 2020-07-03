const WaitingPool = require("../Models/WaitingPool");
const router = require("express").Router();
const UserAuth = require("../Middleware/UserAuth");

router.get("/get", UserAuth, async (req, res) => {
    const pool = await WaitingPool.find({listenerId: '', ended: false});

    if (pool.length < 1) {
        res.sendStatus(404);
        return false;
    }

    res.status(200).json({pool});
})

router.get("/single/:sessionId", UserAuth, async (req, res) => {
    const poolSingle = await WaitingPool.find({sessionId: req.params.sessionId});

    if (!poolSingle) {
        res.sendStatus(404);
        return false;
    }

    res.status(200).json({poolSingle});
})

module.exports = router;