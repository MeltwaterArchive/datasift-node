// #Example - Push Delivery
// *How to setup and reliably deliver to a push destination. In this case we use 
// a [Pull Destination](https://datasift.com/destination/pull) which provides a 
// data buffer which you can pull data from whenever suits you. *

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// A variable to store the subscription ID for use later:
var subscriptionId;

// ## Declare Utility Methods

// Stops the destination:
function stopPullDestination() {
	'use strict';
	ds.push.stop({
		'id': subscriptionId
	}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Pull destination stopped.');
		}
	});
}

// Pulls data from the destination buffer:
function pullData() {
	'use strict';
	ds.pull({
		'id': subscriptionId
	}, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			console.log('Pulled data: ' + JSON.stringify(response));
			stopPullDestination();
		}
	});
}

// Creates a Pull destination for the data:
function createPullDestination(hash) {
	'use strict';
	ds.push.create({
		'hash': hash,
		'name': 'Example pull subscription',
		'output_type': 'pull'
	}, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			subscriptionId = response.id;
			console.log('Created subscription ID: ' + subscriptionId);

			console.log('Waiting 5 seconds before data pull...');
			setTimeout(pullData, 5000);
		}
	});
}

// This method compiles CSDL to obtain a filter hash, then creates the pull destination:
function compileFilter() {
	'use strict';
	ds.compile({
		'csdl': 'interaction.content contains "music"'
	}, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			console.log('Compiled filter hash: ' + response.hash);
			createPullDestination(response.hash);
		}
	});
}

// ## Initiate Process
// Finally we start the process by compiling the filter. This will lead to:
// * A pull destination being created
// * A brief wait for live data to arrive at the destination
// * Data being pulled from the destination
// * The destination being stopped
compileFilter();