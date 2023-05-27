const express = require('express');
/* const cors = require('cors'); */
const {addProduct, addCountPlan, executeCountPlan, addCount, endCountExecution} = require('./core/controller.js');

const app = express();
app.use(express.json());
/* app.use(cors()); */
/* app.use('/public', express.static(path.join(__dirname, '/public'))); */

/* Simple endpoint setup */
/*
{
	"name": 'AABB',
	"price": 1,
	"categories" : [2],
	"subproducts": [{"title": 'A'}. {"title": 'B'}]
}
*/
app.post('/addProduct', addProduct)
/*
{
	name: 'Count Plan A',
	owner_id: user_id,
	repetition_type: 'monthly', // weekly // daily // every
	repetition_interval: 2,
	date_of_week: 'Monday',
	start_time: timestamp
}
*/
app.post('/addCountPlan', addCountPlan)
/* countplan_id, user_id  */
app.post('/executeCountPlan', executeCountPlan)
/* Count execution id, user_id, subproduct_id, quantity */
app.post('/addCount', addCount)
app.post('/endCountExecution', endCountExecution)
app.get('/', (req, res) => {
	res.status(200).send('Oh my.. you found me...');
});

const port = process.env.SERVER_PORT || 5000;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
	console.log(`Server running on port ${port}`);
});