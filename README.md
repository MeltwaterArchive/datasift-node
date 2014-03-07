# DataSift Node Client Library

This NodeJS client library for DataSift supports the full REST API and streaming API's. For more information about the API's please see the [dev documentation](http://dev.datasift.com).

## Usage

		new DataSift('username', 'apikey').validate({
			'csdl': 'interaction.content contains "hello"'
		}, function (err, response) {
			console.log(response);
		});

## Contributing

Please feel free to contribute to this library.

### Running Tests

The client library uses Grunt to run it's tests and will also lint the files. To run Grunt make sure you have Grunt installed and run the `grunt` command in the directory.