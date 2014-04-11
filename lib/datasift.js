/* jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

// DataSift.js 0.5.0

// A NodeJS client for DataSift. This client supports both the REST and streaming API's. More
// information about the endpoints can be found at (dev.datasift.com)[http://dev.datasift.com].

var request = require('request'),
	Stream = require('./stream.js');

// Initial Setup
// --------------

// Creates a new DataSift object, passing in your DataSift username and apikey
// 
//     var ds = new DataSift('username', 'apikey');
//     

// * `username` - Your DataSift username
// * `apikey` - DataSift APIKey
// * `version` - ** optional ** An API version different than 1
// 
var DataSift = function (username, apikey, version) {

	if (!username || !apikey) {
		throw 'Username & API key are required';
	}

	Stream.call(this, username, apikey);

	this.username = username;
	this.apikey = apikey;
	this.version = version || 1;
	this.definition = require('./version/' + this.version + '.json');
	this._setupRoutes();
	return this;
};

DataSift.prototype = new Stream();
DataSift.prototype.constructor = DataSift;

// Defining Routes
// ---------------

// Take each of the routes which have been defined in version JSON file and extend the `DataSift` object
// so each will become of method.
//
// For example the version file defines the following route for the /validate endpoint:
// 
//     "validate": {
//         "uri": "https://api.datasift.com/v1/validate",
//          "method": "post",
//          "params": [{
//              "name": "csdl",
//              "type": "string",
//              "required": true
//          }]
//      }
//      
// This is taken and is attached the the DataSift object as (using the examples above) ds.validate.
// 
// When the function is called it is passed to the `_dispatch` function, passing through all the route information.
// 
DataSift.prototype._setupRoutes = function () {
	Object.keys(this.definition).forEach(function (key) {
		if (this.definition[key].uri !== undefined) {
			this[key] = this._dispatch.bind(this, this.definition[key]);
		} else {
			this[key] = {};
			Object.keys(this.definition[key]).forEach(function (subkey) {
				this[key][subkey] = this._dispatch.bind(this, this.definition[key][subkey]);
			}.bind(this));
		}
	}.bind(this));
};


// Dispatch the method
// --------------------
// This method uses the definition file in order to validate the endpoint, then it will dispatch the API method using the `request` node library.
// 
// Take special notice of the `TLSv1_method` secure protocol that the DataSift API
// 
// * `route` - The route from the version file
// * `params` -  An object which defines the params for this method
// * `callback` - The callback function, which takes two parameters `err`, and `reponse`
//
DataSift.prototype._dispatch = function (route, params, callback) {

	route.params.forEach(function (param) {
		if (params[param.name] === undefined && param.required) {
			throw param.name + ' is required, but hasn\'t been specified';
		}
	});

	var options = {
		method: route.method.toUpperCase(),
		uri: route.uri,
		secureProtocol: 'TLSv1_method',
		auth: {
			'username': this.username,
			'password': this.apikey
		},
        headers: {
            'User-Agent': 'DataSift/v1 Node/v0.5.0'
        }
	};

	if (options.method === 'POST') {
		options.form = params;
	} else {
		options.qs = params;
	}

	request(options, function (err, response, body) {

		if (err) {
			// Temp fix: awaiting resolution of DM-3137
			if(err.code === "HPE_INVALID_CONSTANT") {
				return callback();
			} else {
				return callback(err, null, response.headers);
			}
		}

		switch(response.statusCode) {
		case 401:
		case 404:
		case 500:
			return callback({
				code: response.statusCode,
				response: response
			});
		}

		if (!body) {
			return callback(null,null,response.headers);
		}

		try {
			if (response.headers['x-datasift-format'] === 'json_new_line') {
				var lines = body.split("\n");
				body = [];

				lines.forEach(function(line) {
					body.push(JSON.parse(line));
				});

			} else {
				body = JSON.parse(body);
			}
		} catch (e) {
			return callback({
				message: 'Invalid JSON',
				response: response
			});
		}

		return callback(null, body, response.headers);
	}.bind(this));
};

module.exports = DataSift;
