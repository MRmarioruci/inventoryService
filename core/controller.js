const { v4: uuidv4 } = require('uuid');
const utils = require('./utils');
const actions = require('./actions');

const adminHasAccess = (username) => {
	return new Promise( async (resolve, reject) => {
		const user = await actions.getUserByUsername(username).catch((err) => {
			utils.log('ERROR', err);
			return reject(err);
		});
		if (!user) {
			utils.log('ERROR', 'Invalid username');
			return reject('Invalid username');
		}
		resolve(user.type === 'admin');
	})
}
const addProduct = async (req, res) => {
	const data = req.body;
	if(!data){
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const hasAccess = await adminHasAccess(data.username).catch((e) => {});
	if (!hasAccess) return res.status(500).json('Access denied');

	/* TBI VALIDATE INPUT */
	const productId = await actions.addProduct(data).catch((err) => {
		utils.log('ERROR', err);
	})
	if (!productId) return res.json(utils.standardResponse('ERROR', 'Could not add product'))
	
	const p = [actions.addCategoriesToProduct(productId, data.categories), actions.addSubProducts(productId, data.subproducts)]
	Promise.all(p)
	.then(([categoriesResponse, subproductIds]) => {
		utils.log('SUCCESS', 'All good on product addition!');
		return res.json('All good on product addition!');
	})
	.catch((error) => {
		utils.log('ERROR', error);
		return res.status(500).json(error);
	})
}
const addCountPlan = (req, res) => {
	
}
const executeCountPlan = (req, res) => {
	
}
const addCount = (req, res) => {
	
}
const endCountExecution = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const hasAccess = await adminHasAccess(data.username).catch((e) => { });
	if (!hasAccess) return res.status(500).json('Access denied');

	/* TBI VALIDATE INPUT */
	const edited = await actions.endCountExecution(data.countExecutionId).catch((err) => {
		utils.log('ERROR', err);
	})
	if (!edited) return res.json(utils.standardResponse('ERROR', 'Could not edit count execution'))
	res.json('success');
}

module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	executeCountPlan: executeCountPlan,
	addCount: addCount,
	endCountExecution: endCountExecution,
}