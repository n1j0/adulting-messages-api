exports.handler = async function (event, context) {
    require('dotenv').config()
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection(process.env.DATABASE_URL)
    const [rows, fields] = await connection.execute('SELECT * FROM `messages`')
    connection.end()
    return {
        statusCode: 200,
        body: JSON.stringify(rows),
    }
};
