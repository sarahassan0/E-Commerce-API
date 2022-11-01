var jwt = require('jsonwebtoken')
// const dotenv = require('dotenv');
// dotenv.config();

require('dotenv').config();


function sellerAuth(req, res, next) {
    const token = req.headers.authorization
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (decoded) {
            req.sellerID = decoded.data.sellerID
            next()
        }
        if (err) {
            res.status(401).json('Unauthorized Seller')
        }
    });

}

module.exports = sellerAuth

