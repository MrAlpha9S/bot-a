const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  database: 'BlueLock',
  user: 'root',
  password: '123456',
  port: 3307,
});

module.exports = { conn }