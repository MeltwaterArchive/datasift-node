// require DataSift
var DataSift = require('datasift'),
// define your username and apikey which can be found at http://datasift.com/dashboard
	username = 'abcd',
	apikey = '1234';

// Intilise the object, if we are using an API version other than 1.0 you can specify this in the 
// 3rd parameter
var ds = new DataSift(username, apikey);

// Connect to DataSift, this will attempt to open the connection to DataSift. Once connected you
// will get a callback function. We cant subscribe to a hash until we are connected, but first lets
// grab a stream hash by compiling a piece of CSDL.
ds.connect(function () {
	// compile the CSDL so we get a hash back
	ds.compile({
		'csdl': 'interaction.content contains "test"'
	}, function (err, response) {
		// check for errors
		if (err) {
			console.log(err);
		}

		if (response && response.hash) {
			// great we have our hash now we can subscribe to our stream
			ds.subscribe(response.hash);
		}
	});
});

// Our error checker
ds.on('error', function (error) {
	console.log('Connection errored with: ' + error);
});

// This is where we get the data from our stream
ds.on('interaction', function (data) {
	console.log('Recieved data', data);
});