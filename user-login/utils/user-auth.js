const jwt = require('jsonwebtoken');
require("dotenv").config();

/*
* Make secure request the token sent in Header is valid
*/
function checkForAcessTokenValidity(req, res, next) {
    const bearerToken = req.headers['authorization'];
    if(!bearerToken) {
        return res.status(403).json({ 'message': "Access Token invalid"});
    }
    const accessToken = bearerToken.split(" ")[1];
    if(!accessToken) {
        return res.status(403).json({ 'message': "Access Token invalid" });
    }
    const accessStr = process.env.ACCESS_TOKEN_SECRET;
    jwt.verify(accessToken, accessStr, (err, body) => {
        if (!err) {
            req.body = body;
            next();
        }
        else {
            return res.status(403).json({ 'message': "User is not Authenticated." });
        }
    });
}

module.exports = {
    checkForAcessTokenValidity : checkForAcessTokenValidity
 }