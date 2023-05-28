const express = require('express');
/* const cors = require('cors'); */
const {
	addProduct,
	addCountPlan,
	checkCountPlan, 
	endCountExecution,
	addCountToCountExecution,
	getPricingPerProduct,
	getTotalPricing,
	getPricingByCategory,
} = require('./core/controller.js');

const app = express();
app.use(express.json());

/* Simple endpoint setup */
app.post('/addProduct', addProduct)
app.post('/addCountPlan', addCountPlan)
app.post('/checkCountPlan', checkCountPlan)
app.post('/endCountExecution', endCountExecution)
app.post('/addCountToCountExecution', addCountToCountExecution)
app.post('/getPricingPerProduct', getPricingPerProduct)
app.post('/getTotalPricing', getTotalPricing)
app.post('/getPricingByCategory', getPricingByCategory)
app.get('/', (req, res) => {
	res.status(200).send('Oh my.. you found me...');
});

const port = process.env.SERVER_PORT || 5000;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
	console.log(`Server running on port ${port}`);
});