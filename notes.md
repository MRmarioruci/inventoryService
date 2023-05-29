Tasks
----------------------
[x] Create a GitHub repository with code to run an API, preferably including a Docker configuration.
[x] Use any backend stack or DB combination (e.g., Node.js with TypeScript and MySQL, but Rust is planned for the future).
[x] Design a well-structured SQL schema that can scale and is easy to maintain for adding new features or extracting analytics.
[x] Consider query reading performance using indexes.

[x] Endpoint to build a CountPlan with a weekly schedule.
[x] Endpoint to build a CountPlan with a schedule of every 2nd Monday monthly (optional).
[x] Endpoint to add Products.
[x] Endpoint to check the current CountPlan and start CountExecution if necessary based on the schedule.
[x] Endpoint to add UserProductCounts to CountExecution (allowed for admin and counter roles).
[x] Endpoint to end a CountExecution by changing its status to "end" (no more UserProductCounts can be added).
[x] Calculate the pricing per Product based on the counted quantity in a CountExecution.
[x] Calculate the total pricing of all Products based on the counted quantity in a CountExecution.
[x] Calculate the pricing of Products by category in a CountExecution.


Notes - Questions to be discussed
-------
	1) UserProductCounts
		If CountExecution or User record get's deleted. I am not sure we should delete the UserProductCounts record or not. Depends on whether we want a record of counts or not.

	2) ProductCategories - Product_Has_Categories
		The reason i separated these and did not attach the category directly to the Product is that 1 Product can probably have multiple categories and categories should be a general concept not attached to a specific product.

	3) Barcodes
		For now i am generating 2 Barcodes for each subproduct automatically. This could be passed as a property when creating the subproduct but i am doing it for testing ease.

	5) CountPlan
		I have included a start_date field so that if an interval repetition_type is requested, e.g repeat every 10 days, then you need to have the first starting date.

	6) Can 2 CountExecutions run at the same time?
		For now i only allow only 1 ongoing CountExecutions

	4) Not optimal
		1. Logs might need a bit more work
		2. No typescript use
		3. Automated testing.

# Testing
<b>Add Product</b>
Endpoint: http://127.0.0.1:5000/addProduct
Payload: {
	"username": "admin",
	"name": "AABB",
	"price": 1,
	"categories": [
		2
	],
	"subproducts": [
		{
			"title": "A",
			"quantity": 2
		},
		{
			"title": "B",
			"quantity": 1
		}
	]
}
{
	"username": "admin",
	"name": "CC",
	"price": 3,
	"categories": [1],
	"subproducts": [{"title": "C", "quantity": 1}]
}
{
	"username": "admin",
	"name": "DD",
	"price": 2,
	"categories": [1],
	"subproducts": [{"title": "D", "quantity": 1}]
}

/* Add to count execution */
{
	"username": "admin",
	"count_execution_id": 2,
	"barcode": "01ad8641-8dff-446f-a0c0-a9c0f152cc5c",
	"quantity": 3
}
/* Add plan */

	/* Weekly Plan */
	{
		"username": "admin",
		"name": "Weekly Plan",
		"repetition_type": "weekly",
		"repetition_interval": null,
		"day_of_week": 2,
		"start_time": "16:00:00",
		"start_date": "2023-05-27"
	}
	/* Monthly Plan */
	{
		"username": "admin",
		"name": "Monthly Plan",
		"repetition_type": "monthly",
		"repetition_interval": 2,
		"day_of_week": 1,
		"start_time": "09:30:00",
		"start_date": "2023-05-27"
	}
	/* Interval Plan */
	{
		"username": "admin",
		"name": "Interval Plan",
		"repetition_type": "interval",
		"repetition_interval": 10,
		"day_of_week": null,
		"start_time": "14:15:00",
		"start_date": "2023-05-27"
	}


/* Check Plan */
{
	"username": "admin",
	"count_plan_id": 1
}

/* End count execution */
{
	"username": "admin",
	"count_execution_id": 1
}