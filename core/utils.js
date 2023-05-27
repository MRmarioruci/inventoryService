const { red, green, blue, yellow } = require('colorette');
/* const statuses = {
	'ERROR': 'red',
	'SUCCESS': 'green',
	'WARNING': 'yellow',
	'INFO': 'blue'
}; */
module.exports = {
	standardResponse: (type, data) => {
		return {
			data: data,
			status: type
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