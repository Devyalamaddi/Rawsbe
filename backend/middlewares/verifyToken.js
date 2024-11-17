const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    // console.log("verifyToken req: ",req.headers);
    const bearerToken = req.headers.authorization; // Fixed to lowercase 'authorization'
    // console.log("Authorization header: ", bearerToken); // Debug

    if (!bearerToken) {
        return res.status(401).send({ message: "Unauthorized access. Please log in to continue." });
    }

    const token = bearerToken.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SK_USER);
        req.body.userId=decoded.userId;
        req.role=decoded.role;
        // console.log(req)
        // console.log("Verified user:", verified); // Debug
        next();
    } catch (err) {
        // console.error("Token verification failed:", err); // Debug
        res.status(403).send({ message: "Invalid token. Access denied." });
    }
}

module.exports = verifyToken;
