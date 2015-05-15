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