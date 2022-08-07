exports.handler = async function (event, context) {
  require('dotenv').config();
  const mysql = require('mysql2');
  const connection = mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to PlanetScale!');
  connection.end();
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        text: 'Test',
        date: '',
      }
    ]),
  };
};