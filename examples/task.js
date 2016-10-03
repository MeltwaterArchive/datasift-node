// #Example - Performing async-analysis tasks with Pylon
// *How to perform Task API functions, such as creating asyncronous analysis tasks.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Require the async framework to help us with control flow
var async = require('async');

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_IDENTITY_APIKEY');

// The PYLON service to use - **insert the service here**:
var service = 'SERVICE';

// The PYLON recording to use - **insert the recording id here**:
var subscriptionId = 'YOUR_RECORDING_ID';

// Variable to store the ID for the task created:
var taskId = '';

// Declare functions in one object for use later.
var process = {

	// Gets all the tasks for the identity we're using
	getTasks: function(callback) {
		'use strict';
		ds.task.list({
			'service': service
		}, function(err, response) {
			if (err) {
				console.log(err);
			} else {
				console.log('Tasks: \n' + JSON.stringify(response));
				callback();
			}
		});
	},

	// Creates a new task
	createTask: function(callback) {
		'use strict';
		ds.task.create({
			'service': service,
			'subscription_id': subscriptionId,
			'name': 'Time series analysis',
			'type': 'analysis',
			'parameters': {
				'parameters': {
					'analysis_type': 'timeSeries',
					'parameters': {
						'interval': 'hour',
						'span': 1
					}
				}
			}
		}, function(err, response) {
			if (err) {
				console.log(err);
			} else {
				console.log('Created task: \n' + JSON.stringify(response));
				taskId = response.id;
				callback();
			}
		});
	},

	// Gets an individual task with its results
	getTask: function(callback) {
		'use strict';
		ds.task.get({
			'service': service,
			'id': taskId
		}, function(err, response) {
			if (err) {
				console.log(err);
			} else {

				if (response.status.toLowerCase() === 'completed') {
					console.log('Task results: \n' + JSON.stringify(response.result));
					callback();
				} else {
					console.log('WAITING: Task status: ' + response.status);
					setTimeout(this.getTask(callback), 5000);
				}
			}
		}.bind(this));
	}
};

// Run the example as a series of requests one after the other
async.waterfall([

	// Get a list of all tasks for this identity
	function(callback) {
		'use strict';
		process.getTasks(callback);
	},

	// Create a new task for the identity
	function(callback) {
		'use strict';
		process.createTask(callback);
	},

	// Get the result of the task
	function(callback) {
		'use strict';
		process.getTask(callback);
	}

], function() {
	'use strict';
	console.log('Process completed.');
});