const express = require('express');
require('body-parser');
const Router = express.Router();
const bcrypt = require('bcrypt');

const dbpool = require('../utils/database');


function showErrorResponse(res, message) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ "message": message });
}

Router.post('/sign-in', async (req, res, next) => {
    //return res.json({ 'name': 'cerals' });
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
        console.log('fetchedPassword'+rows[0].email);
        console.log('fetchedPassword'+rows[0].password);
        const isMatched = await bcrypt.compare(password,fetchedPassword);

        // if(await bcrypt.compare(password, fetchedPassword)) {
        //     console.log("MATECHDD");
        //     return;
        // }
        // else {
        //     console.log("NOT MATECHDD");
        //     return;
        //}
        if (!isMatched) {
            showErrorResponse(res, "Password is wrong. Please check and signin again");
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ 'message': 'Successfully Signed in' });
    } catch (err) {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ "message": err.message });
    }
});
/*
Router.post('/sign-up', (req, res, next) => {
    //return res.json({ 'name': 'cerals' });
    const email = req.body['email'];
    const password = req.body['password'];
    if (!email || !password) {
        showErrorResponse(res, "Please check the credentials entered.");
        return;
    }
    const sql = "SELECT * FROM `customers` where email = '" + email + "' LIMIT 1;";
    db.execute(sql).then(([rows, fieldData]) => {
        if (rows.length > 0) {
            showErrorResponse(res, "This email already exists. Please login.");
            return;
        }
        console.log('Response is here');
        const largesstIdsql = "SELECT MAX(customer_id) AS large_index FROM `customers`;";
        db.execute(largesstIdsql).then(([maxValueRow, maxValuefieldData]) => {
            console.log(maxValueRow[0].large_index);
            const custId = maxValueRow[0].large_index + 1;

            //console.log(maxValuefieldData);
            //res.setHeader('Content-Type', 'application/json');
            //return res.status(200).json(rows[0]);
            const insertIntoSql = "INSERT INTO `customers` (`customer_id`,`email`,`password`) VALUES ('" + custId + "','" + email + "','" + password + "');";
            db.execute(insertIntoSql).then(([insertValueRow, insertValuefieldData]) => {


                console.log(insertValueRow);
                //res.setHeader('Content-Type', 'application/json');
                //return res.status(200).json(rows[0]);
            }).catch(insertValueErr => {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ "message": insertValueErr.message });
            });

        }).catch(maxValueErr => {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ "message": maxValueErr.message });
        });
    }).catch(err => {
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ "message": err.message });
    });
});*/

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

        console.log('hashed' + hashedPassword);

        const insertIntoSql = "INSERT INTO `customers` (`customer_id`,`email`,`password`) VALUES ('" + custId + "','" + email + "','" + hashedPassword + "');";
        const [insertValueRows, insertValuefieldData] = await dbpool.query(insertIntoSql);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ 'message': "Successfully Signed ip." });
    } catch (error) {
        showErrorResponse(res, error.message);
        return;
    }
});

module.exports = Router;