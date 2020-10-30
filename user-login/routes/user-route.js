const express = require('express');
require('body-parser');
const Router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbpool = require('../utils/database');
const utility = require('../utils/utility');

/*
* Store Refresh Token
*/
var refreshTokens = [];
/* 
 * Helper Methods for returning JSON reponse 
*/
function showErrorResponse(res, message) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ "message": message });
}

function showSuccessResponse(res, responseJson) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json(responseJson);
}

/*
  * SIGIN-IN Route
  * Method : POST
  * Params : email and Password
*/

Router.post('/sign-in', async (req, res, next) => {
    const user = req.body;
    const email = req.body['email'];
    const password = req.body['password'];
    if (!email || !password) {
        showErrorResponse(res, "Please check the credentials entered.");
        return;
    }
    try {


        const sql = "SELECT * FROM `customers` where email = '" + email + "';";
        const [rows, filedsData] = await dbpool.query(sql);

        if (rows.length <= 0) {
            showErrorResponse(res, "This email doesnt exists in our database. Please check your credentials or singup.");
            return;
        }
        const fetchedPassword = rows[0].password;
        const isMatched = await bcrypt.compare(password,fetchedPassword);
        if (!isMatched) {
            showErrorResponse(res, "Password is wrong. Please check and signin again");
            return;
        }
        const accessStr = process.env.ACCESS_TOKEN_SECRET;
        const refreshStr = process.env.REFRESH_TOKEN_SECRET;

        let accessToken = jwt.sign(user, accessStr, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        let refreshToken = jwt.sign(user, refreshStr, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        refreshTokens.push(refreshToken);
        showSuccessResponse(res,{'message': 'Successfully Signed in', "access_token" : accessToken, "refresh_token": refreshToken});
        return;
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ "message": err.message });
    }
});


/*
  * SIGIN-UP Route
  * Method : POST
  * Params : email and Password
*/

Router.post('/sign-up', async (req, res, next) => {
    const user = req.body;
    const email = req.body['email'];
    const password = req.body['password'];
    const name = req.body['name'];
    const phone = req.body['phone'];

    if (!email || !password) {
        showErrorResponse(res, "Please check the credentials entered.");
        return;
    }
    try {
        const sql = "SELECT * FROM `customers` where email = '" + email + "' LIMIT 1;";
        const [rows, filedsData] = await dbpool.query(sql);

        if (rows.length > 0) {
            showErrorResponse(res, "This email already exists. Please login.");
            return;
        }
        const largesstIdsql = "SELECT MAX(customer_id) AS large_index FROM `customers`;";
        const [largeRows, largeFiledsData] = await dbpool.query(largesstIdsql);
        const custId = largeRows[0].large_index + 1;

        //const salt = await bcrypt.genSalt();
        const numberOfRounds = 10
        const hashedPassword = await bcrypt.hash(password, numberOfRounds);

        const insertIntoSql = "INSERT INTO `customers` (`customer_id`,`email`,`password`,`name`,`phone`,`date_of_joining`) VALUES ('" + custId + "','" + email + "','" + hashedPassword + "','" + name + "','" + phone + "','" + utility.currentTimestamp + "');";
        const [insertValueRows, insertValuefieldData] = await dbpool.query(insertIntoSql);

        const accessStr = process.env.ACCESS_TOKEN_SECRET;
        const refreshStr = process.env.REFRESH_TOKEN_SECRET;

        let accessToken = jwt.sign(user, accessStr, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        let refreshToken = jwt.sign(user, refreshStr, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        refreshTokens.push(refreshToken);

        showSuccessResponse(res,{'message': 'Successfully Signed up', "access_token" : accessToken, "refresh_token": refreshToken});
        return;
    } catch (error) {
        showErrorResponse(res, error.message);
        return;
    }
});



/*
* Renew Accesstoken
* Method : POST
* Params : refreshToken
*/
Router.post('/renew-accesstoken', (req, res, next) => {
    const refresh_token = req.body.refreshToken;
    
    const accessStr = process.env.ACCESS_TOKEN_SECRET;
    const refreshStr = process.env.REFRESH_TOKEN_SECRET;

    if(!refresh_token || !refreshTokens.includes(refresh_token)) {
        return res.status(401).json({ 'message': "This is not a valid refresh token. Please check your token."});
    }  

    jwt.verify(refresh_token, refreshStr, (err, user) => {
        if (!err) {
            let accessToken = jwt.sign({name : user}, accessStr, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
            return res.status(201).json({ accessToken });
        }
        else {
            return res.status(401).json({ 'message': "Token couldnot be generated. Please try again." });
        }
    });
});

module.exports = Router;