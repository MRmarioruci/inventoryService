# Inventory Service
An inventory service use case with some basic endpoints and logic. 

## Deliverables
	1. /server
	Inside this folder you fill find the project main code and logic.

	2. /db
	Inside this directory you will find the init.sql file which is the database schema of the project
	
## Setup

 Clone the repo

	git clone https://github.com/MRmarioruci/inventoryService.git


Navigate inside the project directory
	
	cd inventoryService

Build

	docker-compose up

The server will restart a few times until the database has completed all operations and it connects succesfully

## Endpoints

- For testing ease i have added 3 users
admin - counter 1 - counter 2.

- For testing ease i have added 2 categories, Food (id = 1) and Furniture(id = 2)


- [x] Endpoint to add Products.
	- Url: http://localhost:5000/addProduct
	- Payload:
		``` json
		// Replace values accordingly
		{
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
		```
	
		``` json
		{
			"username": "admin",
			"name": "CC",
			"price": 2,
			"categories": [
				2
			],
			"subproducts": [
				{
					"title": "C",
					"quantity": 1
				}
			]
		}
		```
		``` json
		{
			"username": "admin",
			"name": "DD",
			"price": 3,
			"categories": [
				1
			],
			"subproducts": [
				{
					"title": "D",
					"quantity": 1
				}
			]
		}
		```

- [x] Endpoint to build a CountPlan with a weekly schedule.
	- Url: http://localhost:5000/addCountPlan
	- Payload:
		``` json
		// Replace values accordingly
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
		```

- [x] Endpoint to build a CountPlan with a schedule of every 2nd Monday monthly (optional).
	- Url: http://localhost:5000/addCountPlan
	- Payload:
		``` json
		// Replace values accordingly
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
		```

- [x] EXTRA Endpoint to build a CountPlan with a interval schedule. E.g every 10 days.
	- Url: http://localhost:5000/addCountPlan
	- Payload:
		``` json
		// Replace values accordingly
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
		```

- [x] Endpoint to check the current CountPlan and start CountExecution if necessary based on the schedule.
	- Url: http://localhost:5000/checkCountPlan
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin", 
			"count_plan_id": 1
		}
		```

- [x] Endpoint to add UserProductCounts to CountExecution (allowed for admin and counter roles).
	- Url: http://localhost:5000/addCountToCountExecution
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin",
			"count_execution_id": 1,
			"barcode": "",
			"quantity": 3
		}
		```

- [x] Endpoint to end a CountExecution by changing its status to "end" (no more UserProductCounts can be added).
	- Url: http://localhost:5000/endCountExecution
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin",
			"count_execution_id": 1
		}
		```

- [x] Calculate the pricing per Product based on the counted quantity in a CountExecution.
	- Url: http://localhost:5000/getPricingPerProduct
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin",
			"count_execution_id": 2
		}
		```
- [x] Calculate the total pricing of all Products based on the counted quantity in a CountExecution.
	- Url: http://localhost:5000/getTotalPricing
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin",
			"count_execution_id": 2
		}
		```
- [x] Calculate the pricing of Products by category in a CountExecution.
	- Url: http://localhost:5000/getPricingByCategory
	- Payload:
		``` json
		// Replace values accordingly
		{
			"username": "admin",
			"count_execution_id": 2
		}
		```