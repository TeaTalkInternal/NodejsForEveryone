const mysql = require('mysql2');
require("dotenv/config");
/*
* Connection to MySql Database
*/
const pool = mysql.createPool({
    connectionLimit: 10, 
    host:process.env.HOST_NAME,
    database:process.env.DATABASE_NAME,
    user:process.env.DATABASE_USER_NAME,
    password:process.env.DATABASE_USER_PASSWORD
 });
 

 
 module.exports = pool.promise();