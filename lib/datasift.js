/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

var request = require('request');

/**
 * DataSift Node Client Library
 *
 * A simple interface to DataSift through Node.
 *
 * @author  Daniel Saxil-Nielse (@dtsn)
 * 
 * @example
		new DataSift('username', 'apikey').validate({
			'csdl': 'interaction.content contains "hello"'
		}, function (err, response) {
			console.log(response);
		});
 *
 * @class  DataSift
 *
 * @chainable
 * 
 * @param {String} username Your DataSift username
 * @param {String} apikey   Your DataSift API key
 * @param {Int} [version=1]  Which version of the API to use
 */
var DataSift = function (username, apikey, version) {
	this.username = username;
	this.apikey = apikey;
	this.version = version || 1;
	this.definition = require('./version/' + this.version + '.json');
	this._setupRoutes();
	return this;
};

/**
 * Uses the JSON API definition and for each method extends the `DataSift` 
 * object with that method
 *
 * @private
 */
DataSift.prototype._setupRoutes = function () {
	Object.keys(this.definition).forEach(function (key) {
		this[key] = this._dispatch.bind(this, this.definition[key]);
	}.bind(this));
};

/**
 * Dispatch the API method
 *
 * This method uses the definition file in order to validate the endpoint, then
 * it will dispatch the API method using the `request` node library.
 *
 * Take special notice of the `TLSv1_method` secure protocol that the DataSift API
 * uses
 *
 * @throws Invalid Param
 * @async
 * 
 * @param  {Object}   route    Route information from the definition file
 * @param  {Object}   params   User defined params for the method
 * @param  {Function} callback Callback function
 */
DataSift.prototype._dispatch = function (route, params, callback) {

	// check the params
	route.params.forEach(function (param) {
		if (params[param.name] === undefined && param.required) {
			throw param.name + ' is required, but hasn\'t been specified';
		}
	});

	request({
		method: route.method.toUpperCase(),
		form: params,
		uri: route.uri,
		secureProtocol: 'TLSv1_method',
		auth: {
			'username': this.username,
			'password': this.apikey
		}
	}, function (err, response, body) {
		if (err) {
			return callback(err);
		}

		// if we hit an error, forward on the status code
		switch(response.statusCode) {
		case 401:
		case 404:
		case 500:
			return callback({
				code: response.statusCode,
				response: response
			});
		}

		// make sure we get a JSON response
		if (response.headers['content-type'] !== 'application/json') {
			return callback({
				message: 'Invalid return type',
				response: response
			});
		}

		if (!body) {
			return callback();
		}

		try {
			body = JSON.parse(body);
		} catch (e) {
			return callback({
				message: 'Invalid JSON',
				response: response
			});
		}

		return callback(null, body);
	}.bind(this));
};

module.exports = DataSift;