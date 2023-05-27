require('dotenv').config({path: './core/.env'});
const mysql = require('mysql');
const utils = require('./utils');
let connection;
const getConnection = () => {
	if(!connection){
		connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: 'mario',
			password: 'smilemalaka',
			database: 'inventoryService'
		});
		connection.connect((err) => {
			if (err) {
				utils.log('ERROR', err.stack)
				return;
			}
			utils.log('SUCCESS', 'Connected to database')
		});
	}
	return connection;
}
module.exports = {
	getConnection: getConnection
};