// #Example - Dynamic Lists
// These examples show how to:
// * Create and delete lists
// * Add and remove items from lists
// * Check for the existence of items in a list
// * Bulk replace the contents of a dynamic list

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// A variable to store the list ID for use later:
var listId;

// ## Declare Utility Methods
// This method creates a dynamic list, then shows all lists you have:
function create() {

	ds.list.create({
		"type": "integer",
		"name": "Example integer list"
	},function(err, response) {
		if(err)
			console.log(err);
		else
		{
			listId = response.id;
			console.log("Created list: " + response.id);
			get();
		}
	});
}

// This method shows all lists you have, then adds items to a list:
function get() {

	ds.list.get(function(err, response) {
		if(err)
			console.log(err);
		else {
			console.log("Current lists: " + JSON.stringify(response));
			add();
		}
	});
}

// This method adds items to the created list, then removes some items:
function add() {
	ds.list.add({
		"id": listId,
		"items": JSON.stringify([1,2,3,4,5])
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Items have been added to the list.");
			remove();
		}
	});
}

// This method removes items from the list, then checks for item existence:
function remove() {
	ds.list.remove({
		"id": listId,
		"items": JSON.stringify([1,2])
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Items have been removed from the list.");
			exists();
		}
	});
}

// This method checks for item existence in the list, then starts a bulk replace:
function exists() {
	ds.list.exists({
		"id": listId,
		"items": JSON.stringify([3,4])
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Exists result: " + JSON.stringify(response));
			replaceStart();
		}
	});
}

// This method starts a bulk replace, then performs the replace:
function replaceStart() {
	ds.list.replace.start({
		"list_id": listId
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Replace started");
			replaceAdd(response.id);
		}
	});
}

// This method adds items during the bulk replace, then commits:
function replaceAdd(replaceId) {
	ds.list.replace.add({
		"id": replaceId,
		"items": JSON.stringify([1,2,3,4,5,6,7,8,9])
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Replace completed");
			replaceCommit(replaceId);
		}
	});
}

// This method commits the bulk replace, then deletes the list for cleanup:
function replaceCommit(replaceId) {
	ds.list.replace.commit({
		"id": replaceId
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("Replace committed");
			deleteList();
		}
	});
}

// This method deletes the list
function deleteList() {
	ds.list.delete({
		"id": listId
	},function(err,response) {
		if(err)
			console.log(err);
		else {
			console.log("List deleted");
		}
	});
}

// ## Initiate Process
// Finally we start the process creating a list. This will lead to:
// * Showing all the lists in the account
// * Adding items to the list
// * Removing items from the list
// * Checking if items exist in the list
// * Performing a bulk replace of items in the list
// * Deleting the list
create();