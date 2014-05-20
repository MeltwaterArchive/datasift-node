[![Build Status](https://travis-ci.org/datasift/datasift-node.svg?branch=master)](https://travis-ci.org/datasift/datasift-node)

# DataSift Node Client Library

This NodeJS client library for DataSift supports the full REST API and streaming API's. For more information about the API's please see the [dev documentation](http://dev.datasift.com).

## Usage

	var ds = new DataSift('username', 'apikey');

This will create a new DataSift object. The DataSift object supports the REST and streaming API and streaming API's.

### REST Endpoint

		new DataSift('username', 'apikey').<api_method>(<method_params), function (err, response) {
			console.log(response);
		});

All of the REST endpoints are available as functions on the DataSift object. 

For example if we would like to validate our CSDL using the validate endpoint we can access it through:

	ds.validate({
		'csdl': 'interaction.content contains "hello"'
	}, callback);

Each object takes an object list of parameters, in our instance we can [see the only parameter](http://dev.datasift.com/docs/api/1/validate) is `csdl`.

The second argument to the function takes a `callback` function.

    var callback = function (err, response) {
    	if (err) {
    		// we have errored
    	} else {
    		// do something with the response
    	}
    };

This takes an error object and the response the library got back from the server.

## Supported Operating Enviroment

Tested on Node v0.10.26.

## Contributing

Please feel free to contribute to this library.

### Running Tests

The client library uses Grunt to run it's tests and will also lint the files. To run Grunt make sure you have Grunt installed and run the `grunt` command in the directory.

## Changelog

- 0.5.2: Each parameter type is now enforced. There are only two types (`int`|`string`).