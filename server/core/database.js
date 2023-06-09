require('dotenv');
const mysql = require('mysql');
const utils = require('./utils');
let connection;
const getConnection = () => {
	if(!connection){
		connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE
		});
		connection.connect((err) => {
			if (err) {
				utils.log('ERROR', err.stack)
				process.exit();
			}
			utils.log('SUCCESS', 'Connected to database')
		});
	}
	return connection;
}
module.exports = {
	getConnection: getConnection
};