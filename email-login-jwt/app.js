const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require("dotenv").config();

const loginRoute = require("./routes/login");
const productsRoute = require("./routes/products");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', loginRoute);
app.use('/products', productsRoute);

app.use("/", (req, res, next) => {
    return res.status(401).json({ "message": "Access Denied" });
});

app.listen(process.env.PORT || 8080, () => {
    console.log('Server Started');
});