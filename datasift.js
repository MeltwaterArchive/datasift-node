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

var https = require('https');
var qs = require('querystring');
var HttpStream = require('tenacious-http');
var StreamConsumer = require('./StreamConsumer');
var Q = require('q');

////////////////////////////////////////////////////////////////////////////
/**
 *
 * @constructor
 */
var __ = function (username, apiKey) {

    if (username == null) {
        throw new Error("DataSift client requires username");
    }

    if (apiKey == null) {
        throw new Error("DataSift client requires API key");
    }
    this.username = username;
    this.apiKey = apiKey;
    this.headers = {
        'User-Agent'        : 'DataSiftNodeSDK/0.3.0',
        'Connection'        : 'Keep-Alive',
        'Content-Type'      : 'application/x-www-form-urlencoded; charset=UTF-8',
        'Auth'              : this.username + ':' + this.apiKey
    };
};

////////////////////////////////////////////////////////////////////////////
/**
 * Calls the specified API endpoint.
 *
 * @return {promise}    promise resolved to post result
 */
__.prototype.doApiPost = function(endpoint, params) {

    var d = Q.defer();
    var postBody = qs.stringify(params);

    var options = {
        host: 'api.datasift.com',
        path: '/' + endpoint,
        method: 'POST',
        headers: this.headers,
        auth: this.username + ':' + this.apiKey
    };

    options.headers["Content-Length"] = postBody.length;

    var req = https.request(options, function(res) {

        var body = "";

        res.on('data', function(chunk) {
            if (chunk) {
                body += chunk.toString();
            }
        });

        res.on('end', function() {

            if (res.statusCode == 200) {

                try {
                    d.resolve(JSON.parse(body));
                }
                catch(err) {
                    d.reject(new Error('API request returned non-JSON response: ' + body));
                }
            }
            else {
                d.reject(new Error('API request returned ' + res.statusCode));
            }
        });
    });

    req.on('error', function(e) {
        d.reject(new Error('API request error: ' + e.message));
    });

    // write the request body
    req.write(postBody);
    req.end();

    return d.promise;

    // todo
    //Add a connection timeout
//            this.connectTimeout = setTimeout(function() {
//                if (self.request != null) {
//                    self.request.abort();
//                    self.errorCallback(new Error('Error connecting to DataSift: Timed out waiting for a response'));
//                    self.disconnect(true);
//                }
//                clearTimeout(self.connectTimeout);
//                self.connectTimeout = null;
//            }, 5000);
}

/**
 * Creates an instance of a stream consumer
 *
 * @return {Object} stream consumer instance
 */
__.prototype.createStreamConsumer = function() {

    this.headers['Transfer-Encoding'] = 'chunked';

    var options = {
        host: 'stream.datasift.com',
        headers: this.headers,
        auth: this.username + ':' + this.apiKey,
        path: '/multi'
    };

    var client = HttpStream.create(options, function (client) {
        client.write('\n');
    });

    return StreamConsumer.create(client);
};

module.exports = __;