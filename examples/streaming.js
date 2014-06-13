// #Example - Streaming Live Data
// *How to connect to the DataSift platform, compile a filter and stream live data to your machine.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// The CSDL filter definition for the stream:
var filter = 'interaction.content contains "music"';

// ## Declare Methods
// Compiles a stream from a CSDL definition:
function compileFilter(csdl) {

	ds.compile({ 'csdl': csdl }, function (err, response) {
		if (err) 
			console.log(err);
		else
		{
			console.log("Filter hash: " + response.hash);
			connect(response.hash);
		}
	});
}

// Connects to DataSift and starts streaming data:
function connect(hash) {

	// Set up a 'connect' event handler, which will fire when a connection is established. When connected we compile our CSDL filter and subscribe to streaming data.
	ds.on('connect', function () {
		console.log('Connected to DataSift');
		ds.subscribe(hash);
	});

	// Set up 'error' handler to alert us of any errors. For more details on possible errors see [http://dev.datasift.com/docs/resources/errors](http://dev.datasift.com/docs/resources/errors).
	ds.on('error', function (error) {
		console.log('ERROR: ' + error);
	});

	// Set up 'delete' handler. Depending on the data sources you are using, you may need to delete this data to stay compliant.
	ds.on('delete', function (data) {
		console.log('Data deleted: ', data); // TODO: Do something useful with the data!
	});

	// Set up 'interaction' handler - this receives our data! This is triggered each time we receive a new interaction - a piece of data on the live stream.
	ds.on('interaction', function (data) {
		console.log('Recieved data: ', data);
	});

	// Now all handlers are set up, connect to DataSift!
	ds.connect();

}

// ## Initiate Process
// Finally we start the process, comprising of:
// * Compiling the CSDL filter
// * Connecting to DataSift
compileFilter(filter);

