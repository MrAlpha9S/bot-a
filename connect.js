const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  database: 'sa',
  user: 'root',
  password: '12345',
  port: 3307,
});

// conn.query('SELECT * FROM Cards', function (err, results, fields) {
//   console.log(results); // results contains rows returned by server
//   console.log(fields); // fields contains extra meta data about results, if available
// });

module.exports = { conn }