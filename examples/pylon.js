// #Example - Performing analysis with Pylon
// *How to perform Pylon API functions, such as creating recordings and performing analysis.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Require the async framework to help us with control flow
var async = require('async');

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_IDENTITY_APIKEY');

// The CSDL definitions we'll use for the recording:
var csdl_v1 = 'fb.content contains_any "Ford, Honda, BMW"';
var csdl_v2 = 'fb.content contains_any "Ford, Honda, BMW, Mercedes"';

// Variable to store our recording ID
var recordingId = null;

// Declare functions in one object for use later.
var process = {

	// Gets all the recordings for the identity we're using
	getRecordings: function(callback){
	    ds.pylon.get(function(err, response) {
			if(err)
				console.log(err);
			else
			{
				console.log("Recordings: \n" + JSON.stringify(response));
				callback();
			}
		});
    },

    // Gets details of one recording
    getRecording: function(id, callback) {
    	ds.pylon.get({ "id": id }, function(err, response) {
			if(err)
				console.log(err);
			else
			{
				console.log("Recording: \n" + JSON.stringify(response));
				callback();
			}
		});
    },

    // Validate CSDL for an interaction filter
    validate: function(csdl, callback){
    	ds.pylon.validate({ "csdl": csdl },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("CSDL is valid");
					callback();
				}
			});
    },

    // Compiles CSDL for an interaction filter
    compile: function(csdl, callback){
    	ds.pylon.compile({ "csdl": csdl },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("Filter hash: " + response.hash);
					callback(null, response.hash);
				}
			});
    },

    // Starts a PYLON recording
    start: function(hash, name, callback){
    	ds.pylon.start({ "hash": hash, "name": name },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("Recording ID: " + response.id);
					callback(response.id);
				}
			});
    },

    // Stops a recording
    stop: function(id, callback){
    	ds.pylon.stop({ "id": id },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("Recording stopped successfully");
					callback();
				}
			});
    },

    // Updates a recording to a new CSDL definition and name
    update: function(id, hash, name, callback){
    	ds.pylon.update({ "id": id, "hash": hash, "name": name },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("Recording updated.");
					callback();
				}
			});
    },

    // Submits an analysis request
    analyze: function(id, parameters, filter, callback){
		ds.pylon.analyze({ "id": id, "parameters": parameters, "filter": filter},  
			function(err, response) {
				if(err)
					console.log(err);
				else
				{
					console.log("Analysis result: \n" + JSON.stringify(response));
					callback();
				}
			});
    },

    // Retrieves super public sample data
    superPublicSample: function(id,count,callback){
    	ds.pylon.sample({ "id": id, "count": count },
			function(err, response) {
				if (err) 
					console.log(err);
				else
				{
					console.log("Retrieved super public posts: \n" + JSON.stringify(response));
					callback();
				}
			});
    }
}

// Run the example as a series of requests one after the other
async.waterfall([

	// Get a list of all recordings for this identity
	function(callback) { process.getRecordings(callback); },

	// Validate CSDL for an interaction filter
	function(callback) { process.validate(csdl_v1, callback); },
	
	// Compile CSDL for an interaction filter
	function(callback) { process.compile(csdl_v1, callback); },
	
	// Start a recording
	function(hash, callback) { 
		process.start(hash, "Example recording", 
			function(id) { 
				recordingId = id; 
				callback(); 
			}); 
	},

	// Introduce a short delay, so not to hit analysis too early
	function(callback) { setTimeout(function(){ callback() }, 5000); },
	
	// Get the recording's details
	function(callback) { process.getRecording(recordingId, callback); },
	
	// Do a freqDist analysis
	function(callback) {
		process.analyze(recordingId, {
		   "analysis_type": "freqDist",
		   "parameters": {
		     "threshold": 5,
		     "target": "fb.author.age"
		   }
		 }, 
		 null, 
		 callback);
	},

	// Do a freqDist analysis with a query filter
	function(callback) {
		process.analyze(recordingId, {
		   "analysis_type": "freqDist",
		   "parameters": {
		     "threshold": 5,
		     "target": "fb.author.age"
		   }
		 }, 
		 "fb.author.gender == \"male\"", 
		 callback);
	},

	// Do a nested analysis query
	function(callback) {
		process.analyze(recordingId, {
                "analysis_type": "freqDist",
                "parameters": {
                    "threshold": 3,
                    "target": "fb.author.gender"
                },
                "child": {
                    "analysis_type": "freqDist",
                    "parameters": {
                        "threshold": 3,
                        "target": "fb.author.age"
                    }
                }
         }, 
		 null, 
		 callback);
	},

	// Compile the new CSDL
	function(callback) { process.compile(csdl_v2, callback); },

	// Update the recording to the new CSDL
	function(hash, callback) { process.update(recordingId, hash, "Updated recording", callback); },

	// Introduce a short delay, to give time for recording to switch to new CSDL
	function(callback) { setTimeout(function(){ callback() }, 5000); },
	
	// Get the recording's details again
	function(callback) { process.getRecording(recordingId, callback); },

	// Stop the recording
	function(callback) { process.stop(recordingId, callback); },
	
	// Get a sample of super public data
	function(callback) { process.superPublicSample(recordingId, 10, callback); }
	
	
],
function(err, results) {
    console.log('Process completed.');
});