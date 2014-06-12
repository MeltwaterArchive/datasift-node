// #Example - Streaming Live Data
// *How to connect to the DataSift platform, compile a filter and stream live data to your machine.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// Set up a 'connect' event handler, which will fire when a connection is established. When connected we compile our CSDL filter and subscribe to streaming data.
ds.on('connect', function () {

	console.log('Connected to DataSift');
	
	console.log('Compiling CSDL filter');
	ds.compile({ 
		'csdl': 'interaction.content contains "music"'
	}, function (err, response) {
	
		if (err) 
			console.log(err);
		else
		{
			if (response && response.hash) {
				console.log('Compiled CSDL, stream hash: ' + response.hash);
			
				console.log('Subscribing to live data stream');
				ds.subscribe(response.hash);
			}
		}

	});
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

// Now all hanlders are set up, connect to DataSift!
ds.connect();