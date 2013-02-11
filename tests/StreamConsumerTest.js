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
 * User: wadeforman
 * Date: 11/29/12
 * Time: 10:47 AM
 */

"use strict"

var Q = require ('q');
var StreamConsumer = require('../StreamConsumer');
var HttpStream = require('tenacious-http');
var MonkeyPatcher = require('monkey-patcher').MonkeyPatcher;
var EventEmitter = require('events').EventEmitter;
var https = require('https');

exports['create'] = {

    setUp: function(cb) {

        MonkeyPatcher.setUp();
        cb();
    },

    tearDown: function(cb) {

        MonkeyPatcher.tearDown();
        cb();
    },

    'success' : function(test) {

        var callback;
        var client = {};

        MonkeyPatcher.patch(HttpStream, 'create', function (cb) {
            callback = cb;
            return client;
        });

        var headers = {};
        var ds = StreamConsumer.create('username', 'api-key', headers);

        test.equal(ds.client, client);

        test.done();
    }
};

exports['subscribe'] = {
    'success' : function(test) {
        var ds = StreamConsumer.create();

        ds._validateHash = function(hash) {
            return true;
        };

        ds._start = function() {
            return Q.resolve();
        };

        ds._subscribeToStream = function(hash) {
            return Q.resolve(hash);
        };

        ds.subscribe('hash123').then(
            function(hash) {
                test.equal(hash, 'hash123');
                test.done();
            }
        ).done();
    },

    'will handle bad hash format' : function(test) {

        var ds = StreamConsumer.create();

        ds._validateHash = function(hash) {
            test.ok(true);
            return false;
        };

        ds._start = function() {
            test.ok(true);
            return Q.resolve();
        };

        test.expect(3);

        ds.subscribe('hash123').then(
            function(hash) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    },

    'will reject on a failure to start a connection' : function(test) {
        var ds = StreamConsumer.create();

        ds._start = function() {
            test.ok(true);
            return Q.reject();
        };

        test.expect(2);

        ds.subscribe('hash123').then(
            function(hash) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    },

    'will reject on a failure to subscribe to a stream' : function(test) {
        var ds = StreamConsumer.create();

        ds._validateHash = function(hash) {
            return true;
        };

        ds._start = function() {
            return Q.resolve();
        };

        ds._subscribeToStream = function(hash) {
            return Q.reject();
        };

        ds.subscribe('hash123').then(
            function(hash) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    }
};

exports['subscribeToStream'] = {

    setUp: function (cb) {
        StreamConsumer.SUBSCRIBE_WAIT = 50;
        cb();
    },

    tearDown : function (cb) {
        StreamConsumer.SUBSCRIBE_WAIT = 50;
        cb();
    },

    'will subscribe to a stream' : function (test) {
        var client = {
            write : function (body, encoding){
                test.equal(body,'{"action":"subscribe","hash":"abc123"}' );
            }
        };

        var ds = StreamConsumer.create(client);

        ds._subscribeToStream('abc123').then(
            function(p){
                test.equal(p.state, 'subscribed');
                test.equal(p.hash, 'abc123');
                test.ok(ds.streams['abc123'].state, 'subscribed');
                test.done();
            }, function(err) {
                test.ok(false);
                test.done();
            }
        ).done();

    },

//    'will reject on non-existent stream' : function(test) {
//        var client = {
//            write : function (body, encoding){
//                test.equal(body,'{"action":"subscribe","hash":"abc123"}' );
//            }
//        };
//
//        var ds = StreamConsumer.create(client);
//
//        ds._subscribeToStream('abc123').then(
//            function(){
//                test.ok(false);
//                test.done();
//            }, function(err){
//                test.ok(!ds.streams.hasOwnProperty('abc123'));
//                test.equal(err,"The hash abc123 doesn't exist");
//                test.done();
//            }
//        )
//        ds.emit('warning', "The hash abc123 doesn't exist");
//    },

    'will return existing promise if attempting to subscribe already pending' : function(test) {
        var ds = StreamConsumer.create();
        var mockedPromise = {}
        var mockedDeferred = {promise:mockedPromise};
        ds.streams['abc123'] = {deferred : mockedDeferred, state: 'pending'};
        test.equal(mockedPromise, ds._subscribeToStream('abc123'));
        test.done();
    },

//    'will not subscribe to warning twice' : function(test) {
//        var client = {
//            write : function (body, encoding){
//            }
//        };
//
//        var ds = StreamConsumer.create(client);
//        var count = 0
//        ds.on('newListener', function(){
//            if(count > 0){
//                test.ok(false);
//                test.done();
//            }
//            count++;
//        });
//
//
//        ds._subscribeToStream('abc123').then(
//            function(p){
//                ds._subscribeToStream('123').then(
//                    function() {
//                        test.equal(count,1);
//                        test.done();
//                    }
//                )
//            }, function(err) {
//                test.ok(false);
//                test.done();
//            }
//        ).done();
//    }
};

exports['start'] = {

    setUp: function(cb) {

        MonkeyPatcher.setUp();
        cb();
    },

    tearDown: function(cb) {

        MonkeyPatcher.tearDown();
        cb();
    },

    'success' : function(test) {

        test.expect(2);

        var headers = {};
        var ds = StreamConsumer.create('username', 'api-key', headers);

        var req = new EventEmitter();
        var res = new EventEmitter();

        res.statusCode = 200;

        res.setEncoding = function (enc) {
            test.equal(enc, 'utf8');
        };

        req.write = function (data) {
            test.equal(data, '\n');
        };

        MonkeyPatcher.patch(https, 'request', function (options) {
            return req;
        });

        ds._start().then(
            function() {
                test.done();
            }
        ).done();

        req.emit('response', res);
    },

    'will call onData when a data event is emitted by the client' : function(test) {

        test.expect(6);

        var client = {
            on : function(event, cb) {
                if(event === 'data'){
                    test.ok(true);
                    this.cb = cb;
                }
            },

            start : function() {
                test.ok(true);
                return Q.resolve();
            },

            emit : function(value, data) {
                test.equal(value, 'data');
                test.equal(data, 'my data');
                this.cb(data, 200);
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds._onData = function(data, statusCode) {
            test.equal(data, 'my data');
            test.equal(statusCode, 200);
        };

        ds._start().then(
            function() {
                ds.client.emit('data', 'my data', 200);
                test.done();
            }
        ).done();
    },

    'will call onEnd when an end event is emitted by the client' : function(test) {

        test.expect(6);

        var client = {
            on : function(event, cb) {
                if(event === 'end'){
                    test.ok(true);
                    this.cb = cb;
                }
            },

            start : function() {
                test.ok(true);
                return Q.resolve();
            },

            emit : function(value, data) {
                test.equal(value, 'end');
                test.equal(data, 401);
                this.cb(data);
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds.on('warning', function(){
            test.ok(true);
        });

        ds._onEnd = function( statusCode) {
            test.equal(statusCode, 401);
        };

        ds._start().then(
            function() {
                ds.client.emit('end', 401);
                test.done();
            }
        ).done();
    },

    'will call resubscribe when a recovered event is emitted by the client' : function(test) {

        test.expect(5);

        var client = {
            on : function(event, cb) {
                if(event === 'recovered'){
                    test.ok(true);
                    this.cb = cb;
                }
            },

            start : function() {
                test.ok(true);
                return Q.resolve();
            },

            emit : function(value, data) {
                test.equal(value, 'recovered');
                test.equal(data, 'server end');
                this.cb(data);
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds._resubscribe = function() {
            test.ok(true);
        };

        ds._start().then(
            function() {
                ds.client.emit('recovered', 'server end');
                test.done();
            }
        ).done();
    }
};

exports['resubscribe'] = {
    'basics' : function(test) {
        var ds = StreamConsumer.create();

        ds.streams['123'] = '123';
        ds.streams['456'] = '456';
        ds.streams['abc'] = 'abc';

        ds.setSubscriptions = function(streams) {
            test.deepEqual(streams, ['123', '456', 'abc']);
            test.deepEqual(this.streams, {});
            return [Q.resolve({hash : '123'}), Q.reject('an error'), Q.resolve({hash : 'abc'})];
        };

        var count = 0;

        ds.on('debug', function(state) {
            test.ok(true);
            count++;
            if(count === 3) {
                test.done();
            }
        });

        test.expect(5);
        ds._resubscribe();
    }
};

exports['handleEvent'] = {

    setUp : function(cb){
        this.ds = StreamConsumer.create();
        StreamConsumer.INTERACTION_TIMEOUT = 30;
        MonkeyPatcher.setUp();
        cb();
    },

    tearDown : function(cb){
        clearTimeout(this.ds.interactionTimeout);
        StreamConsumer.INTERACTION_TIMEOUT = 300000;
        MonkeyPatcher.tearDown();
        cb();
    },

    'success' : function (test) {
        var interactionData = {'test' : 'abc', 'name' : 'jon', 'number' : 1};
        var eventData = { 'hash': '123' , 'data' : {'interaction': interactionData}};
        test.expect(1);
        this.ds.on('interaction', function (eventReceived) {
            test.deepEqual(eventReceived, eventData);
            test.done();
        });

        this.ds._handleEvent(eventData);
    },

    'will emit error if the status is error' : function (test) {

        test.expect(3);

        var client = {
            recover : function(){
                test.ok(true);
                return Q.resolve();
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();
        var eventData = {};

        ds._resubscribe = function() {
            test.ok(true);
            test.done();
        };

        eventData.status = 'failure';

        ds.on('error', function (err) {
            test.ok(true);

        });
        ds._handleEvent(eventData);

    },

    'will emit warning if data json status is a warning' : function (test) {
        var ds = StreamConsumer.create();
        var eventData = {};
        eventData.status = 'warning';
        test.expect(1);
        ds.on('warning', function (err) {
            test.ok(true);
            test.done();
        });
        ds._handleEvent(eventData);

    },

    'will emit delete if data is defined but delete flag is set' : function (test) {
        var ds = StreamConsumer.create();
        var eventData = {};
        var data = {};
        data.data = 'data'
        data.deleted = true;
        eventData.data = data;

        test.expect(1);
        ds.on('delete', function (err) {
            test.ok(true);
            test.done();
        });
        ds._handleEvent(eventData);
    },

    'will emit tick if json has a tick property' : function (test) {
        var ds = StreamConsumer.create();
        var eventData = {};
        eventData.tick = true;

        test.expect(1);
        ds.on('tick', function () {
            test.ok(true);
            test.done();
        });
        ds._handleEvent(eventData);
    },

    'will emit unknownEvent on unrecognized events' : function (test) {
        var ds = StreamConsumer.create();
        var eventData = {unknown : 123};
        test.expect(1);
        ds.on('unknownEvent', function (jsonReceived) {
            test.deepEqual(jsonReceived, eventData);
            test.done();
        });

        ds._handleEvent(eventData);
    },

    'will call recycle if no interactions are processed over a long period of time' : function (test) {

        test.expect(2);

        var interactionData = {'test' : 'abc', 'name' : 'jon', 'number' : 1};
        var eventData = { 'hash': '123' , 'data' : {'interaction': interactionData}};

        this.ds.on('interaction', function (data) {
            test.ok(true);
        });

        this.ds._recycle = function () {
            test.ok(true);
            test.done();
        };

        this.ds._handleEvent(eventData);
    }
};

exports['shutdown'] = {

    setUp: function(cb) {

        MonkeyPatcher.setUp();
        cb();
    },

    tearDown: function(cb) {

        MonkeyPatcher.tearDown();
        cb();
    },

    'success' : function(test) {

        test.expect(3);

        var client = {
            write : function(contents) {
                test.equal(contents, JSON.stringify({action: 'stop'}));
            },
            stop : function() {
                test.ok(true);
                return Q.resolve();
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds.shutdown().then(
            function(){
                test.ok(true);
                test.done();
            },function(err){
                test.ok(false);
                test.done();
            }
        ).done();
    }
};

exports['unsubscribe'] = {
    'success' : function(test) {
        var client = {
            write : function(contents) {
                test.equal(contents, JSON.stringify({'action' : 'unsubscribe', 'hash' : 'abc123'}));
            },
            stop : function() {
                test.ok(true);
                return Q.resolve();
            }
        };

        var ds = StreamConsumer.create(client);

        ds.streams['abc123'] = {hash: 'abc123', state : 'subscribed'};
        ds.unsubscribe('abc123').then(
            function(unsub) {
                test.equal(unsub.hash, 'abc123');
                test.equal(unsub.state, 'unsubscribed');
                //test.equal(Object.keys(ds.streams).length, 0);
                test.done();
            }, function(err) {
                test.ok(false);
                test.done();
            }
        ).done();
    }
};

exports['onData'] = {
    'success' : function (test) {
        var ds = StreamConsumer.create();
        var testData = [];
        ds._handleEvent = function (data) {
            testData.push(data);
        };
        var expectedData = [{a:1}, {b:2},{c:3}];
        var chunk = '{"a" : 1}\n{"b" : 2}\n{"c":3}\n{"c":\n{"d":';
        ds._onData(chunk);
        test.deepEqual(testData,expectedData);
        test.equal(ds.responseData, '{"d":');
        test.done();
    },

    'will handle incorrectly formatted JSON objects' : function(test) {

        var ds = StreamConsumer.create();
        var testData = [];

        ds._handleEvent = function (data) {
            testData.push(data);
        };

        var chunk = '{"a" : 1}\n{"b"\n{"c":3}\n{"c":\n{"d":';
        var expectedData = [{a:1}, {c:3}];
        ds._onData(chunk);
        test.deepEqual(testData,expectedData);
        test.equal(ds.responseData, '{"d":');
        test.done();

    },

    'will put partial data chunks together' : function(test) {
        var ds = StreamConsumer.create();
        var testData = [];

        ds._handleEvent = function (data) {
            testData.push(data);
        };

        ds.on('warning', function(message) {
            test.ok(false);
        });
        var expectedData = [{a:1}];
        var chunk = '{"a" : ';
        ds._onData(chunk);
        chunk = '1}';
        ds._onData(chunk);
        chunk = '\n{ d';
        ds._onData(chunk);
        test.deepEqual(testData, expectedData);
        test.equal(ds.responseData, '{ d');
        test.done();

    }
};

exports['onEnd'] = {
    'success' : function(test) {
        var ds = StreamConsumer.create();
        ds.responseData = 'i have stuff';

        ds._onEnd();
        test.equal(ds.responseData, '');
        test.done();
    }
};

exports['recycle'] = {

    setUp: function(cb) {

        MonkeyPatcher.setUp();
        cb();
    },

    tearDown: function(cb) {

        MonkeyPatcher.tearDown();
        cb();
    },

    'success' : function(test) {

        var client = {
            stop : function () {
                test.ok(true);
                return Q.resolve();
            },

            recover : function() {
                test.ok(true);
                return Q.resolve();
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds._resubscribe = function() {
            test.ok(true);
            return Q.resolve();
        };

        test.expect(4);
        ds._recycle().then(
            function() {
                test.ok(true);
                test.done();
            }, function(err) {
                console.log(err);
                test.ok(false);
                test.done();
            }
        ).done();
    },

    'will emit error on failed connection recycle' : function(test) {

        var client = {
            stop : function() {
                test.ok(true);
                return Q.reject();
            }
        };

        MonkeyPatcher.patch(HttpStream, 'create', function () {
            return client;
        });

        var ds = StreamConsumer.create();

        ds.on('error', function(error){
            test.ok(true);
        });

        test.expect(3);
        ds._recycle().then(
            function() {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    }
};

exports['validateHash'] = {
    'success' : function(test) {
        var ds = StreamConsumer.create();

        test.ok(ds._validateHash('69ec6f20f05f513e3b144b90fecc2e3f'));

        test.done();
    },

    'failure' : function(test) {
        var ds = StreamConsumer.create();

        test.ok(!ds._validateHash('invalidHash'));
        test.ok(!ds._validateHash(''));
        test.ok(!ds._validateHash());
        test.ok(!ds._validateHash('69ec6f20f05f513e3b144b90fecc2e3fa'));
        test.ok(!ds._validateHash('69ec6f20f05f513e3b144b90fecc2e3'));
        test.ok(!ds._validateHash('69ec6f20f05f513e3b144b90fecc2e3 '));

        test.done();

    }
};

exports["hashArrayDifference"] = {

    "success" : function(test) {
        var tc = new StreamConsumer();

        var hashes1 = ['x','y','z'];
        var hashes2 = ['a','x','y'];

        test.deepEqual(tc._arrayDifference(hashes1,hashes2), ['z']);
        test.deepEqual(tc._arrayDifference(hashes2, hashes1), ['a']);
        test.done();
    },

    "will handle undefined object params" : function(test) {

        var tc = new StreamConsumer();

        var hashes1 = ['x','y','z'];

        test.deepEqual(tc._arrayDifference(undefined, hashes1), []);
        test.deepEqual(tc._arrayDifference(hashes1, undefined), ['x','y','z']);
        test.done();
    }
};

exports['setSubscriptions'] = {
    setUp : function(cb) {
        StreamConsumer.SUBSCRIPTION_DELAY = 10;
        cb();
    },

    tearDown : function(cb) {
        StreamConsumer.SUBSCRIPTION_DELAY = 1000;
        cb();
    },

    'success' : function(test) {
        var ds = StreamConsumer.create();

        test.expect(4);
        ds._start = function() {
            test.ok(true);
            return Q.resolve();
        };

        ds._subscribeToStream = function(hash){
            test.equal(hash, 'abc123');
            return Q.resolve(hash);
        };

        ds._validateHash = function(hash) {
            test.ok(true);
            return true;
        };

        ds.setSubscriptions(['abc123'])[0].then(
            function(h) {
                test.equal(h,'abc123');
                test.done();
            }, function(err) {
                test.ok(false);
                test.done();
            }
        ).done();
    },

    'will reject if client fails to connect' : function(test){
        var ds = StreamConsumer.create();
        test.expect(2);
        ds._start = function() {
            test.ok(true);
            return Q.reject();
        };

        ds.setSubscriptions(['abc123'])[0].then(
            function(p) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    },


    'will reject if subscribe fails' : function(test) {
        var ds = StreamConsumer.create();
        test.expect(4);
        ds._start = function() {
            test.ok(true);
            return Q.resolve();
        };

        ds._validateHash = function(hash) {
            test.ok(true);
            return true;
        };

        ds._subscribeToStream = function(hash) {
            test.ok(true);
            return Q.reject('failed to sub');
        };

        ds.setSubscriptions(['123'])[0].then(
            function(p) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    },

    'will reject an invalid formatted hash' : function(test) {
        var ds = StreamConsumer.create();
        test.expect(2);

        ds._start = function() {
            return Q.resolve();
        };

        ds._validateHash = function(hash) {
            test.ok(true);
            return false;
        };

        ds.setSubscriptions(['1'])[0].then(
            function(p) {
                test.ok(false);
                test.done();
            }, function(err) {
                test.ok(true);
                test.done();
            }
        ).done();
    },

    'will unsubscribe if the subscribe object is has removed it' : function(test) {
        var ds = StreamConsumer.create();
        ds.streams['abc123'] = {};

        ds.unsubscribe = function(hash) {
            test.equal(hash, 'abc123');
            return Q.resolve({state : 'unsubscribed'});
        };

        test.expect(2);

        ds.setSubscriptions([]).forEach(
            function(promise) {
                promise.then(
                    function(state) {
                        test.equal(state.state, 'unsubscribed');
                        test.done();
                    }
                );
            }
        );
    },

    'will handle an dictionary of hashes' : function(test) {
        var ds = StreamConsumer.create();

        test.expect(6);
        var set = {
            'key1' : undefined,
            'key2' : undefined
        }
        var hashes = ['key1', 'key2'];

        ds._start = function() {
            test.ok(true);
            return Q.resolve();
        };

        ds._subscribeToStream = function(hash){
            test.ok(true);
            return Q.resolve(hash);
        };

        ds._validateHash = function(hash) {
            test.ok(true);
            return true;
        };

        ds.setSubscriptions(hashes).forEach(
            function(promise) {
                promise.then(
                    function(value) {
                        delete set[value];
                        if(Object.keys(set).length === 0) {

                            test.done();
                        }
                    }
                ).done();
            }
        );
    },

    'will handle a dictionary of hashes with both valid and invalid hashes' : function(test) {
        var ds = StreamConsumer.create();

        test.expect(13);
        var setOfValidHashes = {
            'key3' : undefined,
            'key4' : undefined
        };

        var hashes = ['key1', 'key2', 'key3', 'key4'];

        ds._start = function() {
            test.ok(true);
            return Q.resolve();
        };

        ds._subscribeToStream = function(hash){
            test.ok(true);
            if(hash === 'key1'){
                return Q.reject('hash does not exist');
            } else {
                return Q.resolve(hash);
            }

        };

        ds._validateHash = function(hash) {
            test.ok(true);
            return hash !== 'key2';
        };

        ds.setSubscriptions(hashes).forEach(
            function(promise) {
                promise.then(
                    function(value) {
                        delete setOfValidHashes[value];
                        if(Object.keys(setOfValidHashes).length === 0) {
                            test.done();
                        }
                    }, function(invalidHash) {
                        test.ok(true);
                    }
                ).done();
            }
        );
    }
};
