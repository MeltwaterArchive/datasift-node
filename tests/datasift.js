/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

var DataSift = require('../lib/datasift'),
	manifest = require('../lib/version/1.json'),
	request = require('request'),
	async = require('async'),
	apikey = '12345',
	username = 'test',
	testServer = '127.0.0.1:7000',
	queue = [];


var loopManifest = function (callback) {
	Object.keys(manifest).forEach(function (key) {
		_loopManifest(manifest, key, [key], callback);
	});
};

var _loopManifest = function (definition, key, chain, callback) {
	if (definition[key].uri !== undefined) {
		callback(definition[key], key, chain);
	} else {
		Object.keys(definition[key]).forEach(function (subkey) {
			var nChain = chain.slice(0);
			nChain.push(subkey);
			_loopManifest(definition[key], subkey, nChain, callback);
		}.bind(this));
	}
};

var stringGenerator = function () {
	var text = '',
		possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


loopManifest(function (endpoint, key, chain) {

	// create a new test for the endpoint
	exports['test' + key.toUpperCase()] = function (test) {

		var queue = [];

		// setup the mock server
		var mockServer = function (next) {

			var body = {
				'endpoint': '/v1' + endpoint.uri,
				'verbs': [endpoint.method.toUpperCase()],
				'code': '200',
				'body': '',
				'headers': {'content-type': 'application/json'}
			};

			request({
				method: 'POST',
				uri: 'http://' + testServer + '/register-endpoint',
				body: body,
				json: true
			}, function () {
				console.log('Created server for "' + key + '"');
				next();
			});
		};

		var testEndpoint = function (next) {
			var ds = new DataSift(username, apikey, testServer, false),
			params = {};

			// let everyone know what we are testing
			console.log('Testing endpoint "' + key + '"');

			// generate dummy params information
			endpoint.params.forEach(function (param) {
				params[param.name] = param.type === 'string' ? stringGenerator() : Math.floor(Math.random() * 100);
			});

			// crawl down the DS prototype
			var method = ds;
			chain.forEach(function (key) {
				method = method[key];
			});

			// send the request
			method(params, function (err, response, code) {
				//console.log(response, code);
				test.equal(code, 200);
				next();
			});
		};

		queue.push(mockServer);
		queue.push(testEndpoint);
		async.series(queue, function () {
			test.done();
		});
	};
});




/*


Object.keys(manifest).forEach(function (endpoint) {


	if (manifest[endpoint].uri !== undefined) {
		// recurse
		
	}



	
});

// now send off all the request
Object.keys(manifest).forEach(function (endpoint) {

	// create a new test for the endpoint
	exports['test' + endpoint.toUpperCase()] = function (test) {

		var ds = new DataSift(username, apikey, testServer),
			params = {};

		// let everyone know what we are testing
		console.log('Testing endpoint ' + endpoint);

		var stringGenerator = function () {
			var text = '',
				possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		    for (var i=0; i < 5; i++ ) {
		        text += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    return text;
		};

		// generate dummy params information
		manifest[endpoint].params.forEach(function (param) {
			params[param.name] = param.type === 'string' ? stringGenerator() : Math.floor(Math.random() * 100);
		});

		// send the request
		ds[endpoint](params, function (err, response) {
			test.equal(response.statusCode, 200);
			test.done();
		});
	};
});

console.log(exports);



	// send every endpoint

/*exports.constructor = function (test) {

	// test empty params
	test.throws(function () { new DataSift(); });
	test.throws(function () { new DataSift(username); });

	var ds = new DataSift(username, apikey);

	// test the apikey and username get set correctly
	test.equals(username, ds.username);
	test.equals(apikey, ds.apikey);

	test.done();
};

exports.topLevelFunctions = function (test) {

	var ds = new DataSift(username, apikey);

	// make sure we throw an error if we are missing a param
	test.throws(function () { ds.validate(); });
	// or if a param is the wrong type (int when should be string)
	test.throws(function () { ds.validate({ 'csdl': 1 }); });
	// test the int now
	test.throws(function () { ds.stream({ 'hash': '1234', 'count': '1'}); });

	test.done();
};

exports.secondLevelEndpoints = function (test) {

	var ds = new DataSift(username, apikey);

	// check mandatory args are sill enforced
	test.throws(function () { ds.push.pause(); });

	// check validation of argument types still occurs
	test.throws(function () { ds.push.pause({ 'id': true }); });

	test.done();
};

exports.thirdLevelEndpoints = function (test) {

	var ds = new DataSift(username, apikey);

	// check mandatory args are sill enforced
	test.throws(function () { ds.list.replace.start(); });

	// check validation of argument types still occurs
	test.throws(function () { ds.list.replace.start({ 'list_id': 1 }); });

	test.done();
};*/

/*
exports.endToEnd = function (test) {

	// create the client
	var queue = [],
		hash = false,
		ds = new DataSift(config.username, config.apikey);

	// test the require param fails
	test.throws(function () {
		ds.compile('test');
	});

	// testing complilation of CSDL
	var compile = function (next) {

		console.log('Compiling .....');

		ds.compile({
			'csdl': 'interaction.content contains "test"'
		}, function (err, resp) {

			console.log('Compiling completed');

			test.ok(resp, 'reponse is null');
			test.equal(typeof resp, 'object', 'response is not valid JSON');
			hash = resp.hash;
			next();
		});
	};

	// testing the streaming componants
	var stream = function (next) {

		console.log('Streaming ' + hash);

		ds.connect();
		ds.on('connect', function () {
			console.log('Connected to datasift');
			ds.subscribe(hash);
		});

		ds.on('error', function (error) {
			console.log('Connection errored with: ' + error);
		});

		ds.on('interaction', function (data) {
			console.log('Recieved data');
			test.ok(data, 'We recived no data');
			ds.disconnect();
			next();
		});
	};

	queue.push(compile);
	queue.push(stream);
	async.series(queue, function () {
		test.done();
	});

};*/