// A simple example to show how to compile CSDL on DataSift and stream the response to you

// require DataSift
var DataSift = require('../lib/datasift'),
// define your username and apikey which can be found at http://datasift.com/dashboard
	username = 'abcd',
	apikey = '1234';

// Intilise the object, if we are using an API version other than 1.0 you can specify this in the
// 3rd parameter
var ds = new DataSift(username, apikey);

// Connect to DataSift, this will attempt to open the connection to DataSift. Once connected you
// will get a callback function. We cant subscribe to a hash until we are connected, but first lets
// grab a stream hash by compiling a piece of CSDL.
ds.connect();

ds.on('connect', function () {
		console.log("Connected to Datasift");

		// compile the CSDL so we get a hash back
		ds.compile({
			'csdl': 'interaction.content contains "test"'
		}, function(err, response) {
			// check for errors
			if (err) {
				console.log("Error compiling CSDL: " + err.message);
			}

			if (response && response.hash) {
				console.log("Compiled CSDL, new hash: " + response.hash);
				// great we have our hash now we can subscribe to our stream
				ds.subscribe(response.hash);

				// This is where we get the data from our stream
				ds.on('interaction', function(data) {
					// checks if the intercation hash matches the hash from the request
					// very useful while subscribing to multiple streams
					if ( data.hash === response.hash ) {
						console.log('Recieved data', data);
					}
				});
			}
		});

	})

	// Our error checker
	ds.on('error', function(error) {
		console.log("Connection error: " + error.message);
	});
}
