// #Example - Historic Data Access
// *How to run a historic query and deliver data to a push destination.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// Calculate start and end time (as UNIX timestamp) for our query (start 48 hours 
// ago, duration 2 hours)
var startTime = parseInt((new Date()).getTime() / 1000, 10) - (7200 * 48);
var endTime = parseInt(startTime + 3600, 10);


// ## Declare Methods

// Deletes the historic query:
function deleteHistoric(historicsId) {
	'use strict';
	ds.historics.delete({
		'id': historicsId
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Deleted historic query.');
		}
	});
}

// Stops the query running, then deletes it:
function stop(historicsId) {
	'use strict';
	ds.historics.stop({
		'id': historicsId
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Stopped historic query.');
			deleteHistoric(historicsId);
		}
	});
}

// Resumes the query, then stops it:
function resume(historicsId) {
	'use strict';
	ds.historics.resume({
		'id': historicsId
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Resumed historic query.');
			stop(historicsId);
		}
	});
}

// Pauses the query, then resumes it:
function pause(historicsId) {
	'use strict';
	ds.historics.pause({
		'id': historicsId,
		'reason': 'Pausing example query'
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Paused historic query.');
			resume(historicsId);
		}
	});
}

// Gets the historic query's details, then pauses the query -
// **In a real world solution you would allow the query to run and deliver all the data!**
function get(historicsId) {
	'use strict';
	ds.historics.get({
		'id': historicsId
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Historic query details: ' + JSON.stringify(response));
			pause(historicsId);
		}
	});
}

// Updates the query's name, then gets the query's details:
function update(historicsId) {
	'use strict';
	ds.historics.update({
		'id': historicsId,
		'name': 'Updated historic query'
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Updated historic query.');
			get(historicsId);
		}
	});
}

// Starts the query running, then updates the query name:
function start(historicsId) {
	'use strict';
	ds.historics.start({
		'id': historicsId
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Started historic query.');
			update(historicsId);
		}
	});
}

// Creates a Pull subscription for data delivery, then starts the query:
function createSubscription(historicsId) {
	'use strict';
	ds.push.create({
		'historics_id': historicsId,
		'name': 'Example historics subscription',
		'output_type': 'pull'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			var subscriptionId = response.id;
			console.log('Created subscription ID: ' + subscriptionId);
			start(historicsId);
		}
	});
}

// Prepares the historic query, then creates the subscription for data delivery:
function prepareQuery(hash) {
	'use strict';
	ds.historics.prepare({
		'hash': hash,
		'start': startTime,
		'end': endTime,
		'sources': 'twitter',
		'name': 'Example historic query'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Prepared query: ' + response.id);
			createSubscription(response.id);
		}
	});
}

// This method compiles CSDL into a hash for the query, then prepares the query:
function compileStream() {
	'use strict';
	ds.compile({
		'csdl': 'interaction.content contains "datasift"'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Compiled filter hash: ' + response.hash);
			prepareQuery(response.hash);
		}
	});
}


// This method checks the historic data coverage for the query period, then 
// compiles CSDL for the query:
function checkStatus() {
	'use strict';
	console.log('Checking data coverage for our query period');

	ds.historics.status({
		'start': startTime,
		'end': endTime
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Historic status for query period: ' + JSON.stringify(response));
			compileStream();
		}
	});
}

// This method gets a list of all historic queries for the user:
function getAll() {
	'use strict';
	ds.historics.get(function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Historic queries: ' + JSON.stringify(response));
			checkStatus();
		}
	});
}



// ## Initiate Process
// Finally we start the process, comprising of:
// * Get a list of all historics
// * Historic data coverage check
// * Compiling the CSDL for the query
// * Prepares the historic query
// * Creates a pull subscription for data delivery
// * Starts the query running
// * Updates the query's name
// * Gets the query's details
// * Pauses and resumes the query
// * Stops the query running
// * Deletes the query
getAll();