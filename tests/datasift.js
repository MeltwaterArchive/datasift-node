/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

var DataSift = require('../lib/datasift'),
	definition = require('../lib/version/1.json');

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

	// test to make sure we have the correct object
	Object.keys(definition).forEach(function (key) {
		test.ok(ds[key]);
	});

	// test all the param checking
	Object.keys(definition).forEach(function (key) {

		var params = definition[key].params,
			requireExists = false;

		// if there is at least one require
		params.forEach(function (p) {
			if (p.required) {
				requireExists = true;
			}
		});

		if (requireExists) {
			test.throws(function () { ds[key](); });
		}
	});

	test.done();

};