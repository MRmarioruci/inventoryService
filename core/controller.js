const { v4: uuidv4 } = require('uuid');
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
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const user = await getUser(data.username).catch((e) => {});
	if (user.type !== 'admin') return res.status(500).json('Access denied');

	/* TBI: More validations on the data input needed */
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
const addCountPlan = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const user = await getUser(data.username).catch((e) => { });
	if (user.type !== 'admin') return res.status(500).json('Access denied');

	/* TBI: More validations on the data input needed */
	actions.addCountPlan(user.id, data)
	.then((data) => {
		console.log(data);
		utils.log('SUCCESS', 'Plan added');
		res.json('Plan added');
	})
	.catch((err) => {
		utils.log('ERROR', err);
		res.status(500).json('Plan could not be added')
	})
}
const checkCountPlan = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const user = await getUser(data.username).catch((e) => { });
	if (user.type !== 'admin') return res.status(500).json('Access denied');
	
	actions.checkCountPlan(user.id, data.count_plan_id)
	.then((data) => {
		utils.log('SUCCESS', 'Plan checked');
		res.json(data);
	})
	.catch((err) => {
		utils.log('ERROR', err);
		res.status(500).json('Plan could not be checked')
	})

}
const endCountExecution = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}

	const user = await getUser(data.username).catch((e) => { });
	if (user.type !== 'admin') return res.status(500).json('Access denied');

	const edited = await actions.endCountExecution(data.count_execution_id).catch((err) => {
		utils.log('ERROR', err);
	})
	if (!edited) return res.json(utils.standardResponse('ERROR', 'Could not edit count execution'))
	res.json('success');
}
const addCountToCountExecution = async (req, res) => {
	const data = req.body;
	if (!data) {
		utils.log('ERROR', 'INVALID INPUT');
		return res.json(utils.standardResponse('ERROR', 'INVALID INPUT'))
	}
	const user = await getUser(data.username).catch((e) => { });
	const counted = await actions.addCountToCountExecution(user.id, data.count_execution_id, data.barcode, data.quantity)
	.catch((err) => {
		utils.log('ERROR', err);
		return res.json(utils.standardResponse('ERROR', err))
	})
	res.json('Success');
}

module.exports = {
	addProduct: addProduct,
	addCountPlan: addCountPlan,
	endCountExecution: endCountExecution,
	checkCountPlan: checkCountPlan,
	addCountToCountExecution: addCountToCountExecution,
}