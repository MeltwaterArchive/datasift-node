// #Example - Core API Functions
// *How to perform basic API features, such as compiling a stream, find our your usage and account balance.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// Validate and compile an example filter:
var csdl = 'interaction.content contains "music"';

ds.validate({ 'csdl': csdl }, function (err, response) {
	if (err) 
		console.log(err);
	else
	{
		console.log("CSDL is valid, DPU cost = " + response.dpu);

		ds.compile({ 'csdl': csdl }, function (err, response) {
			if (err) 
				console.log(err);
			else
			{
				console.log("Compiled filter hash: " + response.hash);
			}
		});
	}
});

// Query API for usage metrics:
ds.usage(function(err,response) {
	if (err) 
		console.log(err);
	else
	{
		console.log("Usage = " + JSON.stringify(response));
	}
});

// Query API for account balance:
ds.balance(function(err,response) {
	if (err) 
		console.log(err);
	else
	{
		console.log("Balance = " + JSON.stringify(response));
	}
});


