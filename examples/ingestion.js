// #Example - ODP Tasks
// *How to perform basic ODP tasks, such as creating a source and ingesting data.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_IDENTITY_APIKEY');


// ## Declare Utility Methods

// Deletes the new source
function deleteSource(id) {

	'use strict';

	ds.source.delete({
		'id': id
	}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Source deleted.');
		}
	});
}

// Ingests one item of data
function ingest(sourceId) {
	'use strict';
	var data = [{
		'id': '23456234347',
		'body': 'This is the body '
	}];

	ds.ingest(
		sourceId,
		data,
		function(err, response) {
			if (err)
				console.log(err);
			else {
				console.log('Ingested: ' + JSON.stringify(response));
				deleteSource(sourceId);
			}
		}
	);
}

// Starts the new source
function startSource(id) {

	'use strict';

	ds.source.start({
		'id': id
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Source started.');
			ingest(id);
		}
	});
}

// Creates a new managed source for ingestion:
function createSource() {

	'use strict';

	var resources = [{
		'parameters': {
			'mapping': 'gnip_1'
		}
	}];

	ds.source.create({
		'source_type': 'twitter_gnip',
		'name': 'Example ODP Source',
		'resources': JSON.stringify(resources)
	}, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			console.log('Created new source: \n' + response.id);
			startSource(response.id);
		}
	});
}

// ## Initiate Process
// Finally we start the process creating a list. This will lead to:
// * Creating a new managed source for ingesting data
// * Starting the source
// * Submitting data to the platform
// * Deleting the source
createSource();