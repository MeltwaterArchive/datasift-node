// This simple example demonstrates consuming a stream from just a stream
// hash. Account details are stored in the config file (config.json)
// within the examples folder - remember to complete the missing property values
// with your API access details!

// Include libraries
//var DataSift = require('datasift-node'); // When package is installed using NPM
var DataSift = require('../lib/datasift.js'); // When run within datasift-node repo
var config = require('./config');

// Check arguments
if(process.argv.length < 3)
{
	console.log("Usage: node consume-stream.js [stream hash]");
	process.exit(1);
}

var hash = process.argv[2];


// Authenticate
console.log("Creating DataSift object.");

var ds = new DataSift(config.datasift.account.username, config.datasift.account.apikey);

// Setup event handlers
console.log("Creating stream for hash: " + hash);

ds.on('connect', function () {
	console.log('Connected to Datasift.');
	ds.subscribe(hash);
});

ds.on('error', function (error) {
	console.log('ERROR: ' + error);
});

ds.on('warning', function (error) {
	console.log('WARNING: ' + error);
});

ds.on('stopped', function (reason) {
	console.log('STOPPED: ' + reason);
});

ds.on('interaction', function (data) {
	console.log('Recieved interaction (' + data.data.interaction.type + '): ' + data.data.interaction.content);
});

// Connect and begin streaming
ds.connect();