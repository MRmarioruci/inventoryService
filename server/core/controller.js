const utils = require('./utils');
const actions = require('./actions');

const getUser = (username) => {
	return new Promise( async (resolve, reject) => {
		const user = await actions.getUserByUsername(username).catch((err) => {
			utils.log('ERROR', err);
			return reject(err);
		});
		if (!user) {
			utils.log('ERROR', 'Invalid username');
			return reject('Invalid username');
		}
		resolve(user);
	})
}
const addProduct = async (req, res) => {
	const data = req.body;
	if(!data){
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const user = await getUser(data.username).catch((e) => { });
		if (user.type !== 'admin') throw new Error('Access Denied');
		const productId = await actions.addProduct(data);
		if (!productId) throw new Error('Product could not be added');

		const p = [actions.addCategoriesToProduct(productId, data.categories), actions.addSubProducts(productId, data.subproducts)]
		Promise.all(p)
		.then(([categoriesResponse, subproductIds]) => {
			utils.log('SUCCESS', 'Product added');
			res.json(utils.standardResponse('SUCCESS', 'Product added'))
		})
	} catch (err) {
		utils.log('ERROR', err);
		res.json(utils.standardResponse('ERROR', err?.message || err))
	}
}
const addCountPlan = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const user = await getUser(data.username).catch((e) => { });
		if (user.type !== 'admin') throw new Error('Access Denied');
		await actions.addCountPlan(user.id, data);
		
		res.json(utils.standardResponse('SUCCESS', 'Count plan added'))
	} catch (err) {
		utils.log('ERROR', err);
		res.json(utils.standardResponse('ERROR', err?.message || err))
	}
}
const checkCountPlan = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const user = await getUser(data.username).catch((e) => { });
		if (user.type !== 'admin') throw new Error('Accedd Denied');
		const status = await actions.checkCountPlan(user.id, data.count_plan_id);

		res.json(utils.standardResponse('SUCCESS', `Should start: ${status}`))
	} catch (err) {
		utils.log('ERROR', err);
		res.json(utils.standardResponse('ERROR', err?.message || err))
	}
}
const endCountExecution = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const user = await getUser(data.username);
		if (user.type !== 'admin') throw new Error('Access Denied');
		await actions.endCountExecution(data.count_execution_id)

		res.json(utils.standardResponse('SUCCESS', 'Count execution ended'))	
	} catch (err) {
		utils.log('ERROR', err);
		res.json(utils.standardResponse('ERROR', err?.message || err))
	}
}
const addCountToCountExecution = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const user = await getUser(data.username);
		await actions.addCountToCountExecution(user.id, data.count_execution_id, data.barcode, data.quantity)

		res.json(utils.standardResponse('SUCCESS', 'Count increased'))	
	} catch (err) {
		utils.log('ERROR', err);
		res.json(utils.standardResponse('ERROR', err?.message || err))
	}
}
const getPricingPerProduct = async (req, res) => {
	const data = req.body;
	if(!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const calculated = await actions.getPricingPerProduct(data.count_execution_id);
		res.json(utils.standardResponse('SUCCESS', calculated));
	} catch (err) {
		utils.log('ERROR', err?.message || err);
		res.json(utils.standardResponse('ERROR', err?.message || err));
	}
}
const getTotalPricing = async(req, res) => {
	const data = req.body;
	if(!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const pricingPerProduct = await actions.getPricingPerProduct(data.count_execution_id);
		if(!pricingPerProduct) throw new Error('No pricing per product generated');

		const calculated = await actions.getTotalPricing(pricingPerProduct);
		res.json(utils.standardResponse('SUCCESS', calculated));
	} catch (err) {
		utils.log('ERROR', err?.message || err);
		res.json(utils.standardResponse('ERROR', err?.message || err));
	}
}
const getPricingByCategory = async(req, res) => {
	const data = req.body;
	if(!data) {
		utils.log('ERROR', 'Invalid input');
		return res.json(utils.standardResponse('ERROR', 'Invalid input'))
	}
	try {
		const pricingPerProduct = await actions.getPricingPerProduct(data.count_execution_id);
		if (!pricingPerProduct) throw new Error('No pricing per product generated');

		const calculated = await actions.getPricingByCategory(pricingPerProduct);
		res.json(utils.standardResponse('SUCCESS', calculated));
	} catch (err) {
		utils.log('ERROR', err?.message || err);
		res.json(utils.standardResponse('ERROR', err?.message || err));
	}
}

module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	endCountExecution: endCountExecution,
	checkCountPlan: checkCountPlan,
	addCountToCountExecution: addCountToCountExecution,
	getPricingPerProduct: getPricingPerProduct,
	getTotalPricing: getTotalPricing,
	getPricingByCategory: getPricingByCategory,
}