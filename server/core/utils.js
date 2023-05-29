const { red, green, blue, yellow } = require('colorette');
/* const statuses = {
	'ERROR': 'red',
	'SUCCESS': 'green',
	'WARNING': 'yellow',
	'INFO': 'blue'
}; */
module.exports = {
	standardResponse: (status, data) => {
		return {
			data: data,
			status: status
		}	
	},
	log: (type, data) => {
		switch (type) {
			case 'ERROR':
				console.log(`${red(type)}: ${data}`)
				break;
			case 'SUCCESS':
				console.log(`${green(type)}: ${data}`)
				break;
			case 'WARNING':
				console.log(`${yellow(type)}: ${data}`)
				break;
			case 'INFO':
				console.log(`${blue(type)}: ${data}`)
				break;
			default:
				break;
		}
	}
}