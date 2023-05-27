const { v4: uuidv4 } = require('uuid');
const utils = require('./utils');
const util = require('util');
const db = require('./database');
const connection = db.getConnection();
const connectionQuery = util.promisify(connection.query).bind(connection);

const getUserByUsername = (username) => {
	return new Promise((resolve, reject) => {
		if (!username) reject('No username provided');

		const q = "SELECT `Users`.`type` FROM `Users` WHERE `Users`.`username`= ?"
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
				console.log(`Barcode ${barcode} created`);
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
const addCountPlan = (req, res) => {
	
}
const executeCountPlan = (req, res) => {
	
}
const addCount = (req, res) => {
	
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

module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	executeCountPlan: executeCountPlan,
	addCount: addCount,
	endCountExecution: endCountExecution,
	addCategoriesToProduct: addCategoriesToProduct,
	addSubProducts: addSubProducts,
	getUserByUsername: getUserByUsername,
	endCountExecution: endCountExecution
}