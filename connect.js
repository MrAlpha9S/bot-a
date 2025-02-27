const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  database: 'BlueLock',
  user: 'root',
  password: '123456',
  port: 3307,
});

// conn.query('SELECT * FROM Cards', function (err, results, fields) {
//   console.log(results);
//   console.log(fields); 
// });

module.exports = { conn }