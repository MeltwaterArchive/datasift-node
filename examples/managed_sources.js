// #Example - Managed Sources
// *How to create, run, update, stop and delete a managed source. In this case we use a [Facebook Page source](https://datasift.com/source/managed/facebook_page). *

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// A variable to store the source details for use later:
var sourceDetails;

// Parameters & resources for the managed source:
var parameters = {
    'likes': true,
    'page_likes': true,
    'posts_by_others': true,
    'comments': true
};

var resources = [
    {
        'parameters': {
            'url': 'http://www.facebook.com/theguardian',
            'title': 'Some news page',
            'id': 'theguardian'
        }
    }
];

// Authentication parameters - **enter your token here from [Facebook Page source](https://datasift.com/source/managed/new/facebook_page) **:
auth = [
    {
        'parameters': {
            'value': 'YOUR_FACEBOOK_TOKEN'
        }
    }
];

// ## Declare Utility Methods
// This method creates the managed source, then starts it:
function createSource() {

	console.log("Creating managed source.");

	ds.source.create({
		"source_type": "facebook_page",
		"name": "Example Facebook source",
		"resources": JSON.stringify(resources),
		"auth": JSON.stringify(auth),
		"parameters": JSON.stringify(parameters)
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			sourceDetails = response;
			console.log("Created source ID: " + sourceDetails.id);
			startSource();
		}
	});

}

// This method starts the source, then updates it:
function startSource() {
	ds.source.start({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source started.");
				updateSource();
			}
		});
}

// This method updates the source, then gets its details:
function updateSource() {

	console.log("Updating managed source.");

	ds.source.update({
		"id": sourceDetails.id,
		"source_type": "facebook_page",
		"name": "Updated Facebook source",
		"resources": JSON.stringify(sourceDetails.resources),
		"auth": JSON.stringify(sourceDetails.auth),
		"parameters": JSON.stringify(sourceDetails.parameters)
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			console.log("Updated source ID: " + response.id);
			getSource();
		}
	});

}

// This method gets the source's details, then gets the source's log:
function getSource() {

	ds.source.get({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source details: " + JSON.stringify(response));
				getSourceLog();
			}
		});
}

// This method gets the source's log, then stops it:
function getSourceLog() {
	ds.source.log({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source log: " + JSON.stringify(response));
				stopSource();
			}
		});
}

// This method gets stops the source, then deletes it:
function stopSource() {
	ds.source.stop({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source stopped.");
				deleteSource();
			}
		});
}

// This method deletes the source:
function deleteSource() {
	ds.source.delete({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source deleted.");
			}
		});
}

// ## Initiate Process
// Finally we start the process by creating the source. This will lead to:
// * The source being started
// * The source being updated
// * The source's details and log being fetched
// * Ths source being stopped
// * Ths source being deleted
createSource();