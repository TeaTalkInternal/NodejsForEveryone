/*
* Make secure request to fetch your products
*/
const express = require('express');
const userAuth = require('../utils/user-auth');
require("dotenv").config();

const Router = express.Router();

/*
* Make secure request the token sent in Header is valid
*/
Router.post('/', userAuth.checkForAcessTokenValidity, (req, res, next) => {
  res.status(201).json({'message' : 'All products fetched securely.'});
});

module.exports = Router;