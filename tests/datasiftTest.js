/**
 * Copyright (c) 2012 LocalResponse Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Created by: spurcell
 * 5/9/12
 */

"use strict";

var DataSiftClient = require('../datasift');
var MonkeyPatcher = require('capsela-util').MonkeyPatcher;
var nock = require('nock');
var Q = require('q');
var https = require('https');
var EventEmitter = require('events').EventEmitter;

exports["constructor"] = {

    "throws with missing username": function(test) {

        test.throws(function() {
            new DataSiftClient();
        }, Error);

        test.done();
    },

    "throws with missing api key": function(test) {

        test.throws(function() {
            new DataSiftClient('testuser');
        }, Error);

        test.done();
    },

    "inits from config": function(test) {

        var dsc = new DataSiftClient('ds-username', 'ds-api-key');

        test.deepEqual(dsc.headers, {
            'User-Agent'    : 'DataSiftNodeSDK/0.3.0',
            'Connection'    : 'Keep-Alive',
            'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8',
            'Auth'          : 'ds-username:ds-api-key'
        });

        test.done();
    }
};

exports["api post"] = {

    setUp: function(cb) {

        MonkeyPatcher.setUp();
        cb();
    },

    tearDown: function(cb) {

        MonkeyPatcher.tearDown();
        cb();
    },

    "handles connection error": function(test) {

        var dsc = new DataSiftClient('ds-username', 'ds-api-key');

        var mockRequest = new EventEmitter();

        mockRequest.write = function() {};
        mockRequest.end = function() {};

        MonkeyPatcher.patch(https, 'request', function() {
            return mockRequest;
        });

        dsc.doApiPost('validate', {}).then(
            function() {
                test.fail();
            },
            function(reason) {

                test.equal(reason.message, "API request error: something awful happened");
                test.done();
            }
        );

        mockRequest.emit('error', new Error("something awful happened"));
    },

    "sends request correctly": function(test) {

        var dsc = new DataSiftClient('ds-username', 'ds-api-key');

        var params = {
            csdl: 'interaction.content contains "apple"'
        };

        var response = {
            "created_at":"2011-05-12 11:18:07",
            "dpu":"0.1"
        };

        nock('https://api.datasift.com')
            .matchHeader('Content-Length', 49)
            .post('/validate', "csdl=interaction.content%20contains%20%22apple%22")
            .reply(200, response);

        dsc.doApiPost('validate', params).then(
            function(result) {
                test.deepEqual(result, response);
                test.done();
            }
        ).done();
    },

    "handles request error": function(test) {

        var dsc = new DataSiftClient('ds-username', 'ds-api-key');

        var params = {
            csdl: 'interaction.content contains "apple"'
        };

        nock('https://api.datasift.com')
            .matchHeader('Content-Length', 49)
            .post('/validate', 'csdl=interaction.content%20contains%20%22apple%22')
            .reply(500);

        dsc.doApiPost('validate', params).then(
            function() {
                test.fail("promise should be rejected");
            },
            function(err) {
                test.equal(err.message, 'API request returned 500');
                test.done();
            }
        );
    },

    "handles non-JSON response": function(test) {

        var dsc = new DataSiftClient('ds-username', 'ds-api-key');

        var params = {
            csdl: 'interaction.content contains "apple"'
        };

        nock('https://api.datasift.com')
            .post('/validate', 'csdl=interaction.content%20contains%20%22apple%22')
            .reply(200, 'wocka wocka!');

        dsc.doApiPost('validate', params).then(
            function() {
                test.fail("promise should be rejected");
            },
            function(err) {
                test.equal(err.message, 'API request returned non-JSON response: wocka wocka!');
                test.done();
            }
        );
    }
};