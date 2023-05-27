const { v4: uuidv4 } = require('uuid');
const utils = require('./utils');
const util = require('util');
const db = require('./database');
const connection = db.getConnection();
const connectionQuery = util.promisify(connection.query).bind(connection);
const moment = require('moment');

const getUserByUsername = (username) => {
	return new Promise((resolve, reject) => {
		if (!username) reject('No username provided');
		
		const q = "SELECT \
		`Users`.`id`, \
		`Users`.`type` \
		FROM `Users` WHERE `Users`.`username`= ?"
		connection.query(q, [username], (err, res) => {
			if (err) {
				return reject(err);
			}
			resolve(res.length > 0 ? res[0] : null);
		})
		
	})
}

const addProduct = (product) => {
	return new Promise((resolve, reject) => {
		if(!product) reject('No product provided');
		
		const q = "INSERT INTO `Product`(`name`, `price`) VALUES(?, ?)"
		connection.query(q, [product.name, product.price], (err, res) => {
			if(err){
				return reject(err);
			}
			utils.log('INFO', `Product: ${res.insertId} added`);
			resolve(res.insertId);
		})
	}) 
}
const addCategoriesToProduct = (productId, categories) => {
	return new Promise( async(resolve, reject) => {
		if (!productId || !categories.length) reject('Invalid arguments on category addition');
		
		const q = "INSERT INTO `Product_Has_Categories`(`product_id`, `category_id`) VALUES(?, ?)"
		let totalAdded = 0;
		try {
			for (const categoryId of categories) {
				await connectionQuery(q, [productId, categoryId]);
				totalAdded++;
				utils.log('INFO', `Category ${categoryId} added to product: ${productId}`);
			}
			
			if (totalAdded === categories.length) {
				resolve();
			}else {
				utils.log('ERROR', `Not all categories could be attached`);
				reject(`Not all categories could be attached`);
			}
		} catch (err) {
			reject(err);
		}
	})
}
const addSubProducts = (productId, subproducts) => {
	return new Promise( async (resolve, reject) => {
		if (!subproducts.length || !productId) reject('Invalid arguments on subproduct addition');
		
		const q = "INSERT INTO `SubProduct`(`title`) VALUES(?)"
		const subproductIds = [];
		try {
			for (const subproduct of subproducts) {
				const res = await connectionQuery(q, [subproduct.title]);
				const subproductId = res.insertId;
				await generateBarcodes(subproductId).catch((err) => utils.log('ERROR', `Barcodes addition error: ${err}`));
				await attachSubProductToProduct(productId, subproductId).catch((err) => utils.log('ERROR', `Subproduct attachment error: ${err}`));
				subproductIds.push(subproductId);
				console.log(`Subproduct ${subproduct.title} added`);
			}
			
			if (subproductIds.length === subproducts.length) {
				resolve(subproductIds);
			} else {
				utils.log('ERROR', `Not all subproducts could be added`);
				reject(`Not all subproducts could be added`);
			}
		} catch (err) {
			reject(err);
		}
	})
}
const attachSubProductToProduct = (productId, subproductId) => {
	return new Promise((resolve, reject) => {
		if(!productId || !subproductId) return reject('Invalid arguments on subproduct attachement');
		
		const q = "INSERT INTO `Product_Has_SubProduct`(`product_id`, `subproduct_id`) VALUES(?, ?)"
		connection.query(q, [productId, subproductId], (err, res) => {
			if(err){
				utils.log('ERROR', `Could not attach Subproduct: ${subproductId} to Product: ${productId}: ${err}`);
				return reject(`Could not attach Subproduct: ${subproductId} to Product: ${productId}`)
			}
			resolve();
		})
	})
}
const generateBarcodes = (subproductId) => {
	return new Promise(async (resolve, reject) => {
		if(!subproductId) return reject('Invalid arguments on barcode generation');
		
		const q = "INSERT INTO `SubProductBarcodes`(`id`, `subproduct_id`) VALUES(?, ?)"
		const barcodes = new Array(5);
		let added = 0;
		try {
			for (const idx of barcodes) {
				const barcode = uuidv4();
				await connectionQuery(q, [barcode, subproductId]);
				added++;
			}
			
			if (added === barcodes.length) {
				utils.log('INFO', `Barcodes added`);
				resolve();
			} else {
				utils.log('ERROR', `Not all barcodes could be added`);
				reject(`Not all barcodes could be added`);
			}
		} catch (err) {
			reject(err);
		}
	})
}
const addCountPlan = (owner_id, data) => {
	return new Promise(async (resolve, reject) => {
		if (!owner_id || !data) reject('Invalid arguments on count plan addition');
		
		const q = "INSERT INTO `CountPlan`(`owner_id`, `name`, `repetition_type`, `repetition_interval`, `day_of_week`, `start_time`, `start_date`)\
		VALUES(?, ?, ?, ?, ?, ?, ?)"
		try {
			const {name, repetition_type, repetition_interval, day_of_week, start_time, start_date} = data;
			const res = await connectionQuery(q, [owner_id, name, repetition_type, repetition_interval, day_of_week, start_time, start_date]);
			utils.log('INFO', `Countplan ${data.name} added `);
			/* TBI Add subscribers to the plan */
			resolve(res.insertId);
		} catch (err) {
			reject(err);
		}
	})
}
const getCountPlan = (owner_id = null, count_plan_id) => {
	return new Promise(async  (resolve, reject) => {
		try {
			let q = "SELECT \
			`CountPlan`.`owner_id`, \
			`CountPlan`.`name`, \
			`CountPlan`.`repetition_type`, \
			`CountPlan`.`repetition_interval` , \
			`CountPlan`.`day_of_week`, \
			`CountPlan`.`start_time`, \
			`CountPlan`.`start_date` \
			FROM `CountPlan` \
			JOIN `Users` ON `Users`.`id` = `CountPlan`.`owner_id` \
			WHERE `CountPlan`.`id` = ? \
			::__OWNER_ID__::	";
			/* Validate the user requesting the plan check */
			let params = [count_plan_id];
			if (owner_id) {
				q = q.replace('::__OWNER_ID__::', " AND `Users`.`id` = ?")
				params.push(owner_id);
			}
			q = q.replace('::__OWNER_ID__::', " ")
			const res = await connectionQuery(q, params);
			resolve(res.length > 0 ? res[0] : null);
		} catch (err) {
			reject(err);
		}
	})
}
const isAfterStartTime = (currentDate, startTime) => {
	const format = 'hh:mm A';
	const currentTimeMoment = moment(currentDate, format);
	const startTimeMoment = moment(startTime, format);

	return currentTimeMoment.isSameOrAfter(startTimeMoment);
}
const checkCountPlan = (owner_id = null, count_plan_id) => {
	return new Promise(async (resolve, reject) => {
		if (!count_plan_id) reject('Invalid arguments on count plan check');
		try {
			const plan = await getCountPlan(owner_id, count_plan_id);
			if (!plan) return reject('No plan with the given info');
			
			const { repetition_type, repetition_interval, day_of_week, start_time, start_date } = plan;
			const currentDate = new Date();
			
			if (repetition_type === 'weekly') {
				// Check if the current day of the week matches the day_of_week specified in the CountPlan
				if (currentDate.getDay() !== parseInt(day_of_week)) return resolve(false);
				// Check if the current time is past the time speficied in the CounPlan
				if (!isAfterStartTime(currentDate, start_time)) return resolve(false);
				const started = await startCountExecution(count_plan_id).catch((err) => utils.log("ERROR", 'Could not start count execution'))
				resolve(started || false);
			} else if (repetition_type === 'monthly') {
				// Calculate the current week of the month
				const currentWeekOfMonth = Math.ceil(currentDate.getDate() / 7);
				// Check if the current day of the week matches the day_of_week specified in the CountPlan
				if (currentDate.getDay() !== parseInt(day_of_week) || (currentWeekOfMonth !== repetition_interval)) return resolve(false);
				if (!isAfterStartTime(currentDate, start_time)) return resolve(false);
				const started = await startCountExecution(count_plan_id).catch((err) => utils.log("ERROR", 'Could not start count execution'))
				resolve(started || false);
			} else if (repetition_type === 'interval') {
				// You could have an extra type. For example run every 10 days.
				// Fetch the latest completed CountExecution for the CountPlan
				const latestExecution = await getLatestCompletedCountExecution(count_plan_id);
				
				// Check if the latestExecution exists and its end date is not null
				if (latestExecution && latestExecution.end_date) {
					const endDate = new Date(latestExecution.end_date);
					const diffInTime = currentDate.getTime() - endDate.getTime();
					const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
					
					if (diffInDays >= repetition_interval) {
						// Start the CountExecution
						resolve('Start CountExecution');
					} else {
						// No need to start the CountExecution
						resolve('No need to start CountExecution');
					}
				} else {
					// No previous completed CountExecution found, start the CountExecution
					resolve('Start CountExecution');
				}
			} else {
				// Handle other repetition types if needed
				reject('Unsupported repetition_type');
			}
		} catch (err) {
			reject(err);
		}
	});
};
const startCountExecution = (count_plan_id) => {
	return new Promise((resolve, reject) => {
		if (!count_plan_id) return reject('Invalid start count execution parameters');

		/* TBI: If we only allow one CountExecution a time then we have to check if one is running */
		const q = "INSERT INTO `CountExecution`(`count_plan_id`, `status`, `dateStarted`) \
		VALUES(?, 'ongoing', NOW())";
		connection.query(q, [count_plan_id], (err, res) => {
			if (err) {
				return reject(err);
			}
			utils.log('INFO', `Startedd CountExecution: ${res.insertId} for CountPlan: ${count_plan_id}`);
			resolve(res.insertId);
		})
	})
}
const endCountExecution = (countExecutionId) => {
	return new Promise((resolve, reject) => {
		if(!countExecutionId) return reject('Invalid end count execution parameters');
		
		const q = "UPDATE `CountExecution` \
		SET `CountExecution`.`status` = 'ended', `CountExecution`.`dateEnded` = NOW() \
		WHERE `CountExecution`.`id` = ? ";
		connection.query(q, [countExecutionId], (err, res) => {
			if (err) {
				return reject(err);
			}
			utils.log('INFO', `Ended CountExecution: ${countExecutionId}`);
			resolve(res.affectedRows);
		})
	})
}
const getCountExecution = (count_plan_id=null, count_execution_id=null, status=null) => {
	return new Promise((resolve, reject) => {
		let q = "SELECT `CountExecution`.`status` \
		FROM `CountExecution`\
		JOIN `CountPlan` ON `CountPlan`.`id` = `CountExecution`.`count_plan_id`\
		WHERE 1 \
		::__COUNT_PLAN_ID__:: \
		::__COUNT_EXECUTION_ID__:: \
		::__STATUS__:: \
		";
		let params = [];
		if (count_plan_id) {
			q = q.replace('::__COUNT_PLAN_ID__::', " AND `CountPlan`.`id` = ?")
			params.push(count_plan_id);
		}
		if (count_execution_id) {
			q = q.replace('::__COUNT_EXECUTION_ID__::', " AND `CountExecution`.`id` = ?")
			params.push(count_execution_id);
		}
		if (status) {
			q = q.replace('::__STATUS__::', " AND `CountExecution`.`status` = ?")
			params.push(status);
		}
		q = q.replace('::__COUNT_PLAN_ID__::', " ")
		q = q.replace('::__COUNT_EXECUTION_ID__::', " ")
		q = q.replace('::__STATUS__::', " ")
		connection.query(q, params, (err, res) => {
			if(err){
				utils.log('ERROR', 'Could not get CountExecution')
				return reject('Could not get CountExecution');
			}
			resolve(res);
		})
	})
}
const getSubProduct = (barcode) => {
	return new Promise((resolve, reject) => {
		if (!barcode) return reject('Invalid subproduct');

		let q = "SELECT `SubProduct`.`id`, \
		`SubProduct`.`title` \
		FROM `SubProductBarcodes`\
		JOIN `SubProduct` ON `SubProductBarcodes`.`subproduct_id` = `SubProduct`.`id` \
		WHERE `SubProductBarcodes`.`id` = ?	";
		connection.query(q, [barcode], (err, res) => {
			if (err) {
				utils.log('ERROR', 'Could not get SubProduct')
				return reject('Could not get SubProduct');
			}
			resolve(res);
		})
	})
}
const addCountToCountExecution = (user_id, count_execution_id, barcode, quantity) => {
	return new Promise(async (resolve, reject) => {
		try {
			const countExecution = await getCountExecution(null, count_execution_id)
			.catch((err) => {})
			if(!countExecution) return reject('Invalid CountExecution');
			if(countExecution[0].status !== 'ongoing') return reject('The given CountExecution has been terminated');

			const subproduct = await getSubProduct(barcode)
			.catch((err) => {})
			if (!subproduct) return reject('Invalid SubProduct');
			
			const q = "INSERT INTO `UserProductCounts`(`count_execution_id`,`subproduct_id`, `quantity`, `user_id`) VALUES(?, ?, ?, ?)";
			const res = await connectionQuery(q, [count_execution_id, subproduct[0]['id'], quantity, user_id])
			.catch((err) => {
				utils.log("ERROR", `Could not add count to CountExecution: ${err}`);
				return reject('Could not add count to CountExecution');
			})
			resolve(res.insertId);
		} catch (err) {
			reject(err);
		}
	})
}

module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	endCountExecution: endCountExecution,
	addCategoriesToProduct: addCategoriesToProduct,
	addSubProducts: addSubProducts,
	getUserByUsername: getUserByUsername,
	endCountExecution: endCountExecution,
	checkCountPlan: checkCountPlan,
	addCountToCountExecution: addCountToCountExecution, 
}