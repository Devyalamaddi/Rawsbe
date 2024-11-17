const oracledb = require("oracledb");
require('dotenv').config();

oracledb.initOracleClient({ libDir: process.env.LIBDIR });

async function getConnection() {
    return await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        connectionString: process.env.DB_CONNECTIONSTRING,
    });
}

module.exports = getConnection;
