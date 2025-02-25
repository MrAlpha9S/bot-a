const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  database: 'sa',
  user: 'root',
  password: '12345',
  port: 3307,
});

module.exports = { conn }