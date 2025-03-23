const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'gudvill',
    database: 'familia_login'
});

module.exports = dbConnection.promise();