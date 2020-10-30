const express = require('express');
require('body-parser');
const Router = express.Router();
const bcrypt = require('bcrypt');

const dbpool = require('../utils/database');

/* 
 * Helper Methods for returning JSON reponse 
*/
function showErrorResponse(res, message) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ "message": message });
}

function showSuccessResponse(res, message) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ "message": message });
}

/*
  * SIGIN-IN Route
  * Method : POST
  * Params : email and Password
*/

Router.post('/sign-in', async (req, res, next) => {
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
        showSuccessResponse(res,'Successfully Signed in');
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
    const email = req.body['email'];
    const password = req.body['password'];
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

        const insertIntoSql = "INSERT INTO `customers` (`customer_id`,`email`,`password`) VALUES ('" + custId + "','" + email + "','" + hashedPassword + "');";
        const [insertValueRows, insertValuefieldData] = await dbpool.query(insertIntoSql);

        showSuccessResponse(res,'Successfully Signed up');
        return;
    } catch (error) {
        showErrorResponse(res, error.message);
        return;
    }
});

module.exports = Router;