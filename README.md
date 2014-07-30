[![Build Status](https://travis-ci.org/datasift/datasift-node.svg?branch=master)](https://travis-ci.org/datasift/datasift-node)

# DataSift Node Client Library

This NodeJS client library for DataSift supports the full REST API and streaming API's. 

## Quickstart & Examples

Please read our [Node.JS Quickstart Guide](http://dev.datasift.com/quickstart/nodejs) to get started with the DataSift platform.

For further examples take a look at the **/examples** folder in the repo.

Full API reference documentation can be found on the DataSift [developer site](http://dev.datasift.com).


## Usage & Examples

	var ds = new DataSift('username', 'apikey');

This will create a new DataSift object. The DataSift object supports the REST and streaming APIs.

### REST API

All of the DataSift REST endpoints are available as functions on the DataSift object. Use this pattern to call an endpoint:

	new DataSift('username', 'apikey').<api_method>(<method_params), 
	  function (err, response) {
		console.log(response);
	});


For example to validate a CSDL filter you can use the **validate** endpoint:

	ds.validate({
		'csdl': 'interaction.content contains "hello"'
	}, function(err, response) {
		if (err) 
			console.log(err);
		else
			console.log("CSDL is valid");
	});

Each object takes an object list of parameters, in our instance we can [see the only parameter](http://dev.datasift.com/docs/api/1/validate) is `csdl`.

### Streaming API

The [Node.JS Quickstart Guide](http://dev.datasift.com/quickstart/nodejs) explains how to use the streaming API. Or, take look at the **/examples** folder in the repo.


## Supported Operating Enviroment

Tested on Node v0.10.26.

## Contributing

Please feel free to contribute to this library.

### Running Tests

The client library uses Grunt to run it's tests and will also lint the files. To run Grunt make sure you have Grunt installed and run the `grunt` command in the directory.

## Changelog

- 0.5.4: Added managed source resource & auth add and remove endpoints
- 0.5.2: Each parameter type is now enforced. There are only two types (`int`|`string`).