const jwt = require("jsonwebtoken");

export default function UserAuth(req, res, next) {
    const token = req.header("x-auth-number-token");

    if (!token)
        return res.status(401).json({ message: "No token, access denied." });

    try {
        req.number = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(400).json({ message: "Token is not valid" });
    }
}