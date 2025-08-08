const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    const token = req.header('Authorization');

    if(!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }
    try {
        // Nếu token có dạng "Bearer <token>", thì cần tách chuỗi:
        const pureToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token;

        // verify JWT: kiểm tra tính hợp lệ 
        // process.env.jwtUserSecret là chuỗi bí mật mã hoá
        jwt.verify(pureToken, process.env.jwtUserSecret, (err, decoded) => {
            if(err) {
                res.status(401).json({
                    msg: 'Token not valid'
                });
            } else {
                req.user = decoded.user;
                next();
            }
        })

        // return res.status(200).json({
        //     msg: 'Server error',
        //     user: req.user
        // });

    } catch(err) {
        console.log('Middleware error: ' + err);
        res.status(500).json({
            msg: 'Server error'
        });
    }
}