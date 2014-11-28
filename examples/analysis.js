// #Example - Performing analysis with Pylon
// *How to perform Pylon API functions, such as creating recordings and performing analysis.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// Variable to store the hash for the recording:
var hash;

// The CSDL we'll use for the recording:
var csdl = 'fb.content contains_any "BMW, Mercedes, Cadillac"';

// ## Declare Utility Methods
// Gets a list of all the recordings currently in your account:
function getRecordings() {
	ds.analysis.get(function(err, response) {
		if(err)
			console.log(err);
		else
		{
			listId = response.id;
			console.log("Current recordings: \n" + JSON.stringify(response));
			validate();
		}
	});
}

// Validates the CSDL we'll use for the recording:
function validate() {
	ds.analysis.validate({ "csdl": csdl },
		function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("CSDL is valid");
				compile();
			}
		});
}

// Compiles the CSDL, to give a hash for the recording:
function compile() {
	ds.analysis.compile({ "csdl": csdl },
		function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				hash = response.hash;
				console.log("Filter hash: " + response.hash);
				start();
			}
		});
}

// Starts the recording:
function start() {
	ds.analysis.start({ "hash": hash, "name": "Example recording" },
		function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Recording started successfully");
				getRecording();
			}
		});
}

// Gets details for the recording, once it's created:
function getRecording() {
	ds.analysis.get({ "hash": hash }, function(err, response) {
		if(err)
			console.log(err);
		else
		{
			listId = response.id;
			console.log("Current recording: \n" + JSON.stringify(response));
			analyze();
		}
	});
}

// Performs a basic analysis on the recording data:
function analyze() {

	var parameters = {
		   "analysis_type": "freqDist",
		   "parameters": {
		     "threshold": 5,
		     "target": "fb.author.age"
		   }
		 };

	ds.analysis.analyze({ "hash": hash, 
			"parameters": parameters
	 }, function(err, response) {
		if(err)
			console.log(err);
		else
		{
			listId = response.id;
			console.log("Analysis result: \n" + JSON.stringify(response));
			analyzeWithFilter();
		}
	});
}

// Performs analysis, but with the addition of an analysis filter:
function analyzeWithFilter() {

	var parameters = {
		   "analysis_type": "freqDist",
		   "parameters": {
		     "threshold": 5,
		     "target": "fb.author.age"
		   }
		 };

	ds.analysis.analyze({ "hash": hash, 
			"filter": "fb.author.gender == \"male\"",
			"parameters": parameters
	 }, function(err, response) {
		if(err)
			console.log(err);
		else
		{
			listId = response.id;
			console.log("Analysis with filter result: \n" + JSON.stringify(response));
			stop();
		}
	});
}

// Stops the recording running:
function stop() {
	ds.analysis.stop({ "hash": hash },
		function(err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Recording stopped successfully");
			}
		});
}

// ## Initiate Process
// Finally we start the process creating a list. This will lead to:
// * Getting a list of recordings
// * Validating CSDL for a new recording
// * Compiling CSDL for a new recording
// * Starting a recording
// * Getting the new recording's details
// * **At this point in practice you'll need to let the recording run for a time to collect data for analysis!**
// * Performing a basic analysis
// * Performing an analysis with an analysis filter
// * Stopping the recording
getRecordings();