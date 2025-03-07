const sql = require('mssql');

const config = {
  server: 'BUTNE-LAPTOP',
  database: 'BlueLock',
  user: 'sa',
  password: '12345',
  port: 1433,
  driver: "msnodesqlv8",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

(async () => {
  try {
    const conn = sql.connect(config);
    console.log('Connected to SQL Server');
    module.exports = { conn, sql };
  } catch (err) {
    console.log(err);
  }
})();
