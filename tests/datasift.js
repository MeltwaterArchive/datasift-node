/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

var DataSift = require('../lib/datasift'),
	async = require('async');
	//config = require('./config.json');

var apikey = '12345',
	username = 'test';

exports.constructor = function (test) {

	// test empty params
	test.throws(function () { new DataSift(); });
	test.throws(function () { new DataSift(username); });

	var ds = new DataSift(username, apikey);

	// test the apikey and username get set correctly
	test.equals(username, ds.username);
	test.equals(apikey, ds.apikey);

	test.done();
};

exports.method = function (test) {

	var ds = new DataSift(username, apikey);

	// make sure we throw an error if we are missing a param
	test.throws(function () { ds.validate(); });
	// or if a param is the wrong type (int when should be string)
	test.throws(function () { ds.validate({ 'csdl': 1 }); });
	// test the int now
	test.throws(function () { ds.stream({ 'hash': '1234', 'count': '1'}); });

	test.done();
};

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