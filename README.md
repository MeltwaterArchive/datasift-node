[![Build Status](https://travis-ci.org/datasift/datasift-node.svg?branch=master)](https://travis-ci.org/datasift/datasift-node)

# DataSift Node Client Library

This NodeJS client library for DataSift supports the full REST API and streaming API's.

Getting Started
---------------

**Read our [Node.JS Getting Started Guide](http://dev.datasift.com/quickstart/nodejs) to get started with the DataSift platform.** This guide will take you through creating a [DataSift](http://datasift.com) account, and activating data sources which you will need to do before using the DataSift API.

Many of the examples and API endpoints used in this library require you have enabled certain data sources before you can receive any data (you should do this at [datasift.com/source](https://datasift.com/source)). Certain API features, such as [Historics](http://datasift.com/platform/historics/) and [Managed Sources](http://datasift.com/platform/datasources/) will require you have signed up to a monthly subscription before you can access them.

If you are interested in using these features, or would like more information about DataSift, please [get in touch](http://datasift.com/contact-us/)!

## Usage & Examples

For example code take a look at the **/examples** folder in the repo.

Full API reference documentation can be found on the DataSift [developer site](http://dev.datasift.com).

## Creating A Client
Use the following code to create a DataSift client.

	var ds = new DataSift('username', 'apikey');

The DataSift client supports both the REST and streaming APIs.

### REST API Requests

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

- 1.1.0: Added PYLON endpoints & examples
- 1.0.0: Promoted out of BETA
- 0.5.7: Fixed incorrectly required parameter. Added parameter to allow disabling of auto-reconnect.
- 0.5.6: Corrected incorrect timeout for auto-reconnect.
- 0.5.5: Removed the api.datasift.com/stream API endpoint; it is not fit for production usage! Consider using [Push Delivery](http://dev.datasift.com/docs/push) or the [Streaming API](http://dev.datasift.com/quickstart/nodejs).
- 0.5.4: Added managed source resource & auth add and remove endpoints
- 0.5.2: Each parameter type is now enforced. There are only two types (`int`|`string`).