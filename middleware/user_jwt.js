const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    const authHeader = req.headers['authorization']; // Format: "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    // console.log(authHeader);      

    if (!token) {
        return res.status(401).json({ success: false, msg: 'Access token missing' });
    }

    jwt.verify(token, process.env.jwtUserSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, msg: 'Invalid or expired token' });
        }

        req.user = decoded.user; // Now req.user has { userId, type, ... }
        next();
    });
}