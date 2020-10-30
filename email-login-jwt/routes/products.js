/*
* Make secure request to fetch your products
*/
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const Router = express.Router();


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

/*
* Make secure request the token sent in Header is valid
*/
Router.post('/', checkForAcessTokenValidity, (req, res, next) => {
  res.status(201).json({'message' : 'All products fetched securely.'});
});

module.exports = Router;


