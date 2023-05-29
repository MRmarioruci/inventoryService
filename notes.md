
Notes - Open ended discussion
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