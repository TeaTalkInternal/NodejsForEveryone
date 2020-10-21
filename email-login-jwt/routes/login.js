const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require("dotenv").config();

//express().use(bodyParser.json());

const Router = express.Router();

var refreshTokens = [];
/*
* Generate Access Token/Refresh Token
*/
Router.post('/login', (req, res, next) => {
    //Find the user in body
    const user = req.body;
    if (user) {
        //check if user.name is found in our databaae 
        //Logic  not written here , please see how to find username in database
        const username = user["name"];
        if (!username) {
            return res.status(401).json({ 'message': "Access Denied" });
        }
        const accessStr = process.env.ACCESS_TOKEN_SECRET;
        const refreshStr = process.env.REFRESH_TOKEN_SECRET;

        let accessToken = jwt.sign(user, accessStr, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        let refreshToken = jwt.sign(user, refreshStr, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        refreshTokens.push(refreshToken);
        return res.status(201).json({ accessToken, refreshToken });
    }
    else {
        return res.status(401).json({ 'message': "Access Denied" });
    }
});


/*
* Renew Accesstoken
*/
Router.post('/renew-accesstoken', (req, res, next) => {
    const refresh_token = req.body.refreshToken;
    
    const accessStr = process.env.ACCESS_TOKEN_SECRET;
    const refreshStr = process.env.REFRESH_TOKEN_SECRET;

    if(!refresh_token || !refreshTokens.includes(refresh_token)) {
        return res.status(401).json({ 'message': "User is not Authenticated."});
    }  

    jwt.verify(refresh_token, refreshStr, (err, user) => {
        if (!err) {
            let accessToken = jwt.sign({name : user}, accessStr, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
            return res.status(201).json({ accessToken });
        }
        else {
            return res.status(401).json({ 'message': "User is not Authenticated 888." });
        }
    });
});

module.exports = Router;