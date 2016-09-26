// #Example - Monitoring account usage
// *How to get usage details from the API.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// ## Declare Utility Methods

// Gets last month's usage details from the API
function lastMonth() {
	'use strict';
	// First day of last month
	var d = new Date();
	d.setMonth(d.getMonth() - 1);
	d = new Date(d.getFullYear(), d.getMonth(), 1);
	console.log(d);

	ds.account.usage({
		'period': 'monthly',
		'start': (d.getTime() / 1000)
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Last month: \n' + JSON.stringify(response));
		}
	});
}

// Gets latest usage details from the API
function latestUsage() {
	'use strict';
	ds.account.usage(function(err, response) {
		if (err) {
			console.log(err);
		} else {
			console.log('Latest usage: \n' + JSON.stringify(response));
			lastMonth();
		}
	});
}

// ## Initiate Process
// Finally we start the process - this will lead to:
// * Get the latest usage details from the API
// * Get last month's usage details from the API
latestUsage();