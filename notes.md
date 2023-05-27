Create a GitHub repository with code to run an API, preferably including a Docker configuration.
Use any backend stack or DB combination (e.g., Node.js with TypeScript and MySQL, but Rust is planned for the future).
Design a well-structured SQL schema that can scale and is easy to maintain for adding new features or extracting analytics.
Consider query reading performance using indexes.
The API should have the following endpoints:
Endpoint to build a CountPlan with a weekly schedule.
Endpoint to build a CountPlan with a schedule of every 2nd Monday monthly (optional).
Endpoint to add Products.
Endpoint to check the current CountPlan and start CountExecution if necessary based on the schedule.
Endpoint to add UserProductCounts to CountExecution (allowed for admin and counter roles).
Endpoint to end a CountExecution by changing its status to "end" (no more UserProductCounts can be added).
Define the necessary data entities:
User: Can be an admin or a counter.
Categories
	id
	title
Product: Consists of Subproducts, has a price, name, and category.
	id
	name
	price
	category_id

Subproduct: Has multiple Barcodes for identification.
	id
	title

Barcode scanner: A numeric string value that correlates to a Subproduct.
Barcodes
	id
	subproduct_id
	value
	
UserRoles
	id
	type
	
Users
	id
	username
	user_role_id

CountPlan: Created by users, has an owner, and generates CountExecutions periodically based on a repetition schedule
CountPlan
	id
	user_id
	schedule

CountExecution: Started by CountPlan, has a status, and holds multiple UserProductCounts.
CountExecution
	id
	count_plan_id
	status

UserProductCounts: Represents the counted Subproducts by a user, with quantities attached.
	id
	user_id
	count_execution_id
	subproduct_id
	quantity
	
Implement additional functionalities:
Calculate the pricing per Product based on the counted quantity in a CountExecution.
Calculate the total pricing of all Products based on the counted quantity in a CountExecution.
Calculate the pricing of Products by category in a CountExecution.