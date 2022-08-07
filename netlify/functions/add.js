exports.handler = async function (event) {
    require('dotenv').config()
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection(process.env.DATABASE_URL)
    const msg = event.queryStringParameters.message
    if (!msg) {
        return {
            statusCode: 422,
            body: '"message" parameter missing.'
        }
    }
    const formatter = Intl.DateTimeFormat('de-DE', { month: '2-digit', day: '2-digit', year: '2-digit' })
    const date = formatter.format(new Date())
    try {
        const [rows, fields] = await connection.execute('SELECT * FROM `messages`')
        if (rows.length >= 100) {
            await connection.execute('DELETE FROM messages LIMIT 1')
        }
        await connection.execute('INSERT INTO messages (text, date) VALUES (?, ?)', [ msg, date ])
        connection.end()
        return {
            statusCode: 201,
        }
    } catch (e) {
        connection.end()
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}
