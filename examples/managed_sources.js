// #Example - Managed Sources
// *How to create, run, update, stop and delete a managed source. In this case we use a [Facebook Page source](https://datasift.com/source/managed/facebook_page). *

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
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

var resourcesToAddLater = [
    {
        'parameters': {
            "title": "The Sun",
	        "url": "http://www.facebook.com/thesun",
	        "id": "161385360554578"
        }
    }
];

// Authentication parameters - **enter tokens here from [Facebook Page source](https://datasift.com/source/managed/new/facebook_page) **:
var auth = [
    {
        'parameters': {
            'value': 'YOUR_FACEBOOK_TOKEN'
        }
    }
];

var authToAddLater = [
    {
        'parameters': {
            'value': 'ANOTHER_FACEBOOK_TOKEN'
        }
    }
];

// ## Declare Utility Methods
// This method creates the managed source:
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

// This method starts the source:
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

// This method updates the source:
function updateSource() {

	console.log("Updating managed source.");

	ds.source.update({
		"id": sourceDetails.id,
		"source_type": "facebook_page",
		"name": "Updated Facebook source"
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

// This method gets the source's details:
function getSource() {

	ds.source.get({
			"id": sourceDetails.id
		}, function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Source details: " + JSON.stringify(response));
				addResource();
			}
		});
}

// This method adds a new resource to the source:
function addResource() {

	console.log("Adding resource to managed source.");

	ds.source.resource.add({
		"id": sourceDetails.id,
		"resources": JSON.stringify(resourcesToAddLater),
		"validate": true
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			sourceDetails = response;
			var newResourceId = sourceDetails.resources[1].resource_id;

			console.log("New resource ID: " + newResourceId);
			removeResource(newResourceId);
		}
	});

}

// This method removes a resource from the source:
function removeResource(resourceId) {

	console.log("Removing resource from managed source.");

	ds.source.resource.remove({
		"id": sourceDetails.id,
		"resource_ids": JSON.stringify([resourceId])
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			console.log("Removed resource ID: " + resourceId);
			addAuth();
		}
	});

}

// This method adds a new auth token to the source:
function addAuth() {

	console.log("Adding auth token to managed source.");

	ds.source.auth.add({
		"id": sourceDetails.id,
		"auth": JSON.stringify(authToAddLater),
		"validate": true
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			sourceDetails = response;
			var newAuthId = sourceDetails.auth[1].identity_id;

			console.log("New auth ID: " + newAuthId);
			removeAuth(newAuthId);
		}
	});

}

// This method removes an auth token from the source:
function removeAuth(authId) {

	console.log("Removing auth from managed source.");

	ds.source.auth.remove({
		"id": sourceDetails.id,
		"auth_ids": JSON.stringify([authId])
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
		{
			console.log("Removed auth ID: " + authId);
			getSourceLog();
		}
	});

}

// This method gets the source's log:
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

// This method gets stops the source:
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
// * The source's details being fetched
// * Adding and removing a resource from the source
// * Adding and removing an auth token from the source
// * The source's log being fetched
// * Ths source being stopped
// * Ths source being deleted
createSource();