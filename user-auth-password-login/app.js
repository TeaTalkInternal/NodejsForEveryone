const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const mysql = require('mysql2');
require('dotenv/config');

const app = express();

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());


//Default Route if nothing else matches
app.use('/', (req, res, next) => {
    res.status(401).json({ 'message': 'Access Denied' });
});

//Listen
app.listen(process.env.PORT || 8080, () => {
    console.log('Server started');
});