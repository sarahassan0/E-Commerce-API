var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();



function userAuth(req, res, next) {
    const token = req.headers.authorization
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (decoded) {
            req.userID = decoded.data.userID
            next()
        }
        if (err) {
            res.status(401).json('Unauthorized User')
        }
    });

}

module.exports = userAuth
