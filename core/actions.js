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
				utils.log('ERROR', `Product error: ${err}`);
				return reject('Product addition error');
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
				await attachSubProductToProduct(productId, subproductId, subproduct.quantity).catch((err) => utils.log('ERROR', `Subproduct attachment error: ${err}`));
				subproductIds.push(subproductId);
				utils.log('SUCCESS', `Subproduct ${subproduct.title} added`);
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
const attachSubProductToProduct = (productId, subproductId, quantity) => {
	return new Promise((resolve, reject) => {
		if(!productId || !subproductId || !quantity) return reject('Invalid arguments on subproduct attachement');
		
		const q = "INSERT INTO `Product_Has_SubProduct`(`product_id`, `subproduct_id`, `quantity`) VALUES(?, ?, ?)"
		connection.query(q, [productId, subproductId, quantity], (err, res) => {
			if(err){
				utils.log('ERROR', `Could not attach Subproduct: ${subproductId} to Product: ${productId}: ${err}`);
				return reject(`Could not attach Subproduct: ${subproductId} to Product: ${productId}`)
			}
			resolve(true);
		})
	})
}
const generateBarcodes = (subproductId) => {
	return new Promise(async (resolve, reject) => {
		if(!subproductId) return reject('Invalid arguments on barcode generation');
		
		const q = "INSERT INTO `SubProductBarcodes`(`id`, `subproduct_id`) VALUES(?, ?)"
		const barcodes = new Array(2);
		let added = 0;
		try {
			for (const idx of barcodes) {
				const barcode = uuidv4();
				await connectionQuery(q, [barcode, subproductId]);
				added++;
			}
			
			if (added === barcodes.length) {
				utils.log('INFO', `Barcodes added`);
				resolve(true);
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
			utils.log('ERROR', `Countplan error: ${err} `);
			reject('Count Plan could not be added');
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
				startCountExecution(count_plan_id)
				.then((started) => {
					resolve(started || false);
				})
				.catch((err) => {
					reject(err)
				})
			} else if (repetition_type === 'monthly') {
				// Calculate the current week of the month
				const currentWeekOfMonth = Math.ceil(currentDate.getDate() / 7);
				// Check if the current day of the week matches the day_of_week specified in the CountPlan
				if (currentDate.getDay() !== parseInt(day_of_week) || (currentWeekOfMonth !== repetition_interval)) return resolve(false);
				if (!isAfterStartTime(currentDate, start_time)) return resolve(false);
				startCountExecution(count_plan_id)
				.then((started) => {
					resolve(started || false);
				})
				.catch((err) => {
					reject(err)
				})
			} else if (repetition_type === 'interval') {
				// TBI: Another extra helpful type would be interval. For example run every 10 days.
				// Fetch the latest completed CountExecution for the CountPlan
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
	return new Promise( async(resolve, reject) => {
		if (!count_plan_id) return reject('Invalid start count execution parameters');

		const countExecution = await getCountExecution(count_plan_id, null, 'ongoing');
		if (countExecution?.[0]) return reject(`A CountExecution is already running for CountPlan: ${count_plan_id}`);

		const q = "INSERT INTO `CountExecution`(`count_plan_id`, `status`, `dateStarted`) \
		VALUES(?, 'ongoing', NOW())";
		connection.query(q, [count_plan_id], (err, res) => {
			if (err) {
				utils.log("ERROR", err)
				return reject("Could not start count execution");
			}
			utils.log('INFO', `Started CountExecution: ${res.insertId} for CountPlan: ${count_plan_id}`);
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
		::__STATUS__::";
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
			.catch((err) => { return reject(err)})
			if(!countExecution) return reject('Invalid CountExecution');
			if(countExecution[0].status !== 'ongoing') return reject('The given CountExecution has been terminated');

			const subproduct = await getSubProduct(barcode)
			.catch((err) => { return reject(err)})
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
const getProducts = () => {
	return new Promise((resolve, reject) => {
		let q = "SELECT \
			`Product`.`id`, \
			`Product`.`name`, \
			`Product`.`price`, \
			`ProductCategories`.`id` AS `category_id`, \
			`ProductCategories`.`title` AS `category_title`, \
			`Product_Has_SubProduct`.`quantity`, \
			`SubProduct`.`id` AS `subproduct_id`, \
			`SubProduct`.`title` AS `subproduct_name` \
		FROM `Product`\
		LEFT JOIN `Product_Has_Categories` ON `Product_Has_Categories`.`product_id` = `Product`.`id` \
		LEFT JOIN `ProductCategories` ON `ProductCategories`.`id` = `Product_Has_Categories`.`category_id` \
		LEFT JOIN `Product_Has_SubProduct` ON `Product_Has_SubProduct`.`product_id` = `Product`.`id` \
		LEFT JOIN `SubProduct` ON `SubProduct`.`id` = `Product_Has_SubProduct`.`subproduct_id` \
		WHERE 1 \
		ORDER BY `Product`.`id` \
		";
		connection.query(q, [], (err, res) => {
			if (err) {
				utils.log('ERROR', `Could not get products ${err}`)
				return reject('Could not get products');
			}
			if(!res) return reject('No products');

			let last_id = null;
			let out = [];
			let i = -1;
			res.forEach(row => {
				if (last_id !== row.id) {
					last_id = row.id;
					i++;
					out.push({
						id: row.id,
						name: row.name,
						price: row.price,
						categories: {},
						subproducts: {},
					})
				}
				if (row.subproduct_id) {
					out[i]['subproducts'][row.subproduct_id] = {
						id: row.subproduct_id,
						title: row.subproduct_name,
						quantity: row.quantity
					};
				}
				if (row.category_id) {
					out[i]['categories'][row.category_id] = {
						id: row.category_id,
						title: row.category_title
					};
				}
			});
			out = out.map((row, idx) => {
				return {...row, ...{
					categories: Object.values(row.categories),
					subproducts: Object.values(row.subproducts),
				}}
			})
			resolve(out);
		})
	})
}
const getCountedSubproducts = (count_execution_id) => {
	return new Promise((resolve, reject) => {
		let q = "SELECT \
			`UserProductCounts`.`subproduct_id`, \
			SUM(`UserProductCounts`.`quantity`) AS `count`, \
			`SubProduct`.`id`, \
			`SubProduct`.`title` \
			FROM `UserProductCounts` \
			JOIN `CountExecution` ON `CountExecution`.`id` = `UserProductCounts`.`count_execution_id` \
			JOIN `SubProduct` ON `SubProduct`.`id` = `UserProductCounts`.`subproduct_id` \
			WHERE `UserProductCounts`.`count_execution_id` = ? \
			GROUP BY `UserProductCounts`.`count_execution_id`, `UserProductCounts`.`subproduct_id` \
		";
		connection.query(q, [count_execution_id], (err, res) => {
			if (err) {
				utils.log('ERROR', `Could not get coutns ${err}`)
				return reject('Could not get counts');
			}
			if (!res) return reject('No counts');
			resolve(res);
		})
	})
}
const getPricingPerProduct = (count_execution_id) => {
	return new Promise(async (resolve, reject) => {
		try {
			const products = await getProducts();
			if(products.length === 0) throw new Error('No products');

			const countedSubProducts = await getCountedSubproducts(count_execution_id);
			if(!countedSubProducts) throw new Error('No counts');

			// Calculate the price of complete products per product
			const completeProducts = products.map(product => {
				let o = {
					id: product.id,
					name: product.name,
					categories: product.categories,
					totalPrice: 0
				};
				const totalSubproductCounts = product.subproducts.reduce((acc, subproduct) => {
					const countedSubproduct = countedSubProducts.find(cs => cs.subproduct_id === subproduct.id );
					if(countedSubproduct){
						acc = [...acc, ...[Math.floor(countedSubproduct.count / subproduct.quantity)]];
					}
					return acc;
				}, []);
				if (totalSubproductCounts.length === product.subproducts.length){
					const maxComplete = Math.min(...totalSubproductCounts);
					o.totalPrice = maxComplete * product.price;
				}
				return o;
			});
			resolve(completeProducts);
		} catch (err) {
			reject(err);
		}
	})
}
const getTotalPricing = (pricingPerProduct) => {
	return new Promise((resolve, reject) => {
		const totalPrice = pricingPerProduct.reduce((total, product) => {
			return total + product.totalPrice;
		}, 0)
		resolve(totalPrice);
	})
}
const getPricingByCategory = (pricingPerProduct) => {
	return new Promise((resolve, reject) => {
		const res = {};
		pricingPerProduct.forEach((product) => {
			product.categories.forEach((category) => {
				if(!res.hasOwnProperty(category.title)) res[category.title] = 0;
				res[category.title] += product.totalPrice;
			})
		})
		resolve(res);
	})
}
module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	endCountExecution: endCountExecution,
	addCategoriesToProduct: addCategoriesToProduct,
	addSubProducts: addSubProducts,
	getUserByUsername: getUserByUsername,
	checkCountPlan: checkCountPlan,
	addCountToCountExecution: addCountToCountExecution, 
	getPricingPerProduct: getPricingPerProduct,
	getTotalPricing: getTotalPricing,
	getPricingByCategory: getPricingByCategory,
}