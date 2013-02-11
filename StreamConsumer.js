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
 * Time: 5:19 PM
 */

"use strict";

var HttpStream = require('tenacious-http');
var EventEmitter = require('events').EventEmitter;
var Q = require('q');
var https = require('https');

var __ = function() {
    EventEmitter.call(this);
};

__.SUBSCRIBE_WAIT = 750;
__.INTERACTION_TIMEOUT = 300000;
__.SUBSCRIPTION_DELAY = 500;

/**
 * creates an instance
 * @param client - tenacious-http client
 * @return {Object}
 */
__.create = function(username, apiKey, headers) {

    var instance = new __();

    instance.client = HttpStream.create(function () {

        var options = {
            host: 'stream.datasift.com',
            headers: headers,
            auth: username + ':' + apiKey,
            path: '/multi'
        };

        var req = https.request(options);

        req.write('\n');

        return req;
    });

    instance.subscribeListener = false;
    instance.attachedSubscribeWarningListener = false;
    instance.responseData = '';
    instance.attachedListeners = false;
    instance.streams = {};

    return instance;
};

__.prototype = Object.create(EventEmitter.prototype);

/**
 * subscribes to a single streams.
 * @param streamHash - stream hash provided by datasift.
 * @return {promise}
 */
__.prototype.subscribe = function(streamHash) {
    var self = this;

    return this._start().then(
        function() {
            if(!self._validateHash(streamHash)) {
                return Q.reject('invalid hash: ', streamHash);
            }
            return self._subscribeToStream(streamHash);
        }
    );
};

/**
 * sets the streams subscribed by means of unsubscribing and subscribing to streams to reflect the state of streamHashes
 * note that DataSift cannot handle a dozen or so asynchronous at once, so each subscribe message is
 * spaced out by 1s
 * @param streamHashes - array of stream hashes
 * @return {Array of promises}
 */
__.prototype.setSubscriptions = function(streamHashes) {
    var self = this;
    streamHashes = streamHashes || [];

    var streamsToSubscribe = this._arrayDifference(streamHashes, Object.keys(this.streams));
    var streamsToUnsubscribe = this._arrayDifference(Object.keys(this.streams), streamHashes);

    var unsubscribedPromises = streamsToUnsubscribe.map(
        function(streamHash) {
            return self.unsubscribe(streamHash);
        }
    );
    var count = -1;
    return streamsToSubscribe.map(
        function(streamHash) {
            count++;
            return Q.delay(count*__.SUBSCRIPTION_DELAY).then(
                function(){
                    return self.subscribe(streamHash);
                }
            );

        }).concat(unsubscribedPromises);
};

/**
 * unsubscribes to a already subscribed stream
 * @param hash
 * @return {promise}
 */
__.prototype.unsubscribe = function(hash) {

    var body = JSON.stringify({'action' : 'unsubscribe', 'hash' : hash});

    this.client.write(body, 'utf8');

    var unsubscribedState = this.streams[hash];
    unsubscribedState.state = 'unsubscribed';
    delete this.streams[hash];

    return Q.resolve(unsubscribedState);
};

/**
 * subscribe to a specific stream hash
 * @param hash
 * @return {promise} - return a stream state object
 * @private
 */
__.prototype._subscribeToStream = function(hash) {
    var d = Q.defer();
    var subscribeMessage = JSON.stringify({'action' : 'subscribe', 'hash' : hash});
    var self = this;

    //only add listener if it has not been connected
//    if(!this.attachedSubscribeWarningListener) {
//        this.on('warning', function(message) {
//            if(!message.indexOf("The hash",-1)) {
//                var streamHash = message.split(' ')[2];
//                if(self.streams.hasOwnProperty(streamHash)) {
//                    self.streams[streamHash].deferred.reject(message);
//                    delete self.streams[streamHash];
//                }
//            }
//        });
//        this.attachedSubscribeWarningListener = true;
//    }

    if(this.streams.hasOwnProperty(hash)) { //already waiting or subscribed
        return this.streams[hash].deferred.promise;
    }

    this.streams[hash] = {};
    this.streams[hash].deferred = d;
    this.streams[hash].state = 'pending';
    this.streams[hash].hash = hash;

    this.client.write(subscribeMessage, 'utf8');

//    Q.delay(__.SUBSCRIBE_WAIT).then(
//        function() {
            self.streams[hash].state = 'subscribed';
            d.resolve(self.streams[hash]);
//        });

    return this.streams[hash].deferred.promise;
};

/**
 * starts the connect
 * @return {promise}
 * @private
 */
__.prototype._start = function() {

    var self = this;

    if(!this.attachedListeners) {

        this.client.on('data', function(chunk, statusCode) {
            self._onData(chunk, statusCode);
        });

        this.client.on('end', function(statusCode){
            self.emit('warning','end event received with status code ' + statusCode);
            self._onEnd(statusCode);
        });

        this.client.on('recovered', function(reason) {
            self.emit('debug', 'recovered from ' + reason);
            self._resubscribe();
        });

        this.attachedListeners = true;
    }

    return this.client.start();
};

/**
 * sends subscribe messages to datasift based on streams already subscribed to by this instance
 * @private
 */
__.prototype._resubscribe = function () {

    var self = this;
    var streams = Object.keys(this.streams);
    this.streams = {};
    this.setSubscriptions(streams).forEach(
        function(promise){
            promise.then(
                function(state) {
                    self.emit('debug', 'reconnected to stream hash ' + state.hash);
                }, function(err) {
                    self.emit('debug', 'failed to reconnect to stream hash ' + ' with error: ' + err);
                }
            );
        }
    );
};

/**
 * shuts down the http connection.  if subscribe is called again, then a new underlying http connection will be created.
 * @return {promise}
 */
__.prototype.shutdown = function () {

    this.attachedListeners = false;
    this.attachedSubscribeWarningListener = false;
    this.streams = {};
    clearTimeout(this.interactionTimeout);
    this.client.write(JSON.stringify({'action' : 'stop'}));
    return this.client.stop();
};

/**
 * onData callback which handles the data stream coming from the datasift streams.
 * @param chunk
 * @param statusCode
 * @private
 */
__.prototype._onData = function(chunk, statusCode) {
    this.responseData += chunk;
    if(chunk.indexOf('\n') >= 0) {
        var data = this.responseData.split('\n');

        this.responseData = data.pop();
        for (var i = 0; i < data.length; i++) {
            if (data[i] !== undefined) {
                var eventData;
                try {
                    eventData = JSON.parse(data[i]);
                } catch(e) {
                    this.emit('warning', 'could not parse into JSON: ' + data[i] + ' with error: ' + e.toString());  //more details
                    continue;
                }
                if (eventData) {
                    this._handleEvent(eventData);
                }
            }
        }
    }
};

/**
 * on end call back
 * @param statusCode
 * @private
 */
__.prototype._onEnd = function(statusCode) {
    //underlying connection is "recovering"
    this.responseData = '';
};

/**
 * processes the data events coming from DataSift
 * @param eventData
 * @private
 */
__.prototype._handleEvent = function (eventData) {

    var self = this;

    if (eventData.status === 'failure') {
        if(eventData.message !== 'A stop message was received. You will now be disconnected') {
            this.emit('error', new Error(eventData.message));
            this.client.recover().then(
                function() {
                    self._resubscribe();
                }
            );
        }
    } else if (eventData.status === 'success' || eventData.status === 'warning' ) {
        this.emit(eventData.status,eventData.message, eventData);
    } else if (eventData.data !== undefined && eventData.data.deleted === true){
        this.emit('delete', eventData);
    } else if (eventData.tick !== undefined) {
        this.emit('tick', eventData);
    } else if (eventData.data !== undefined && eventData.data.interaction !== undefined) {

        //if there are no interactions emitted for the INTERACTION_TIMEOUT duration,
        //then the connection is recycled, which means a new underlying http connection will be created.
        clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(function(){
            self._recycle();
        }, __.INTERACTION_TIMEOUT);
        this.emit('interaction', eventData);
    } else {
        this.emit('unknownEvent', eventData);
    }
};

/**
 * recycles the connection.  used when the driver is in an unrecoverable state.  a new underlying socket will be assigned.
 * @return {promise}
 * @private
 */
__.prototype._recycle = function() {

    var self = this;
    this.emit('debug', 'recycling connection');

    return this.client.stop().then(
        function() {
            self.client.pendingStop = false;
            return self.client.recover();
        }).then(
        function() {
            return self._resubscribe();
        }
    ).fail(
        function(err) {
            self.emit('error', 'failed to reconnect: ' + err);
            return Q.reject(err);
        }
    );
};

/**
 * validates the format of a stream hash
 * required to be a 32 character hex string
 * @param hash
 * @return {Boolean}
 * @private
 */
__.prototype._validateHash = function (hash) {
    return /^[a-f0-9]{32}$/i.test(hash);
};

/**
 * Takes the difference between two arrays [values1] - [values2] = [resulting array of values]
 *
 * @param array1
 * @param array2
 *
 * @return {Array}
 * @private
 */
__.prototype._arrayDifference = function(array1, array2) {

    if (array1 == undefined) {
        return [];
    }

    if (array2 == undefined) {
        return array1;
    }

    return array1.filter(function(i) {return !(array2.indexOf(i) > -1);});
};

module.exports = __;
