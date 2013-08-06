# DataSift SDK for NodeJS

Provides easy access to DataSift's real-time streaming and REST APIs.

Note: this module uses promises (via the Q library) and events, not callbacks.

## Prerequisites
- You have a DataSift account (username and API key) available from http://datasift.com

## Install
- Using npm `npm install datasift-sdk`

## General usage

To create an instance of the client:

    var DataSift = require('datasift');
    var ds = new DataSift('YOUR_ACCOUNT', 'YOUR_API_KEY');

## Streaming API

To stream data:

  1. Get a StreamConsumer from the client via the createStreamConsumer() factory method. A StreamConsumer is an EventEmitter that connects to the streaming API and emits events when data is received, automatically reconnecting as necessary. A single StreamConsumer can subscribe to multiple DataSift streams.
  1. Add event listeners
  1. Subscribe to streams using subscribe() or setSubscriptions()


    // create a StreamConsumer via the factory method
    var stream = ds.createStreamConsumer();

    // add event listeners

    stream.on('interaction', function(obj) {
        // handle interaction
    });

    stream.on('error', function(message) {
        // handle error event
    });

    // start listening to the stream:

    ds.subscribe(STREAM_HASH).then(
        function (state) {
            //successfully subscribed
        });

###subscribe(streamHash)
Starts listening to the stream with the given hash.  (Multiple streams can be subscribed to.)

    ds.subscribe('YOUR_STREAM_HASH').then(
        function(state) {
            //successfully subscribed
        });

###unsubscribe(streamHash)
Unsubscribes from the given stream.

    ds.unsubscribe('YOUR_STREAM_HASH').then(
        function() {
            //successfully unsubscribed
        }, function() {
            //failed to unsubscribe
        });

###shutdown()
Stop and disconnects to the DataSift stream.

    ds.shutdown();

###setSubscriptions(streamHashes)
Subscribes to all streams in the given array and unsubscribes from any currently-subscribed streams not in the array. Returns an array of promises, one per stream.

    var streamHashes = (['YOUR_STREAM_HASH_1', 'YOUR_STREAM_HASH_2', 'YOUR_STREAM_HASH_N']);

    ds.setSubscriptions(streamHashes).forEach(
        function(promise) {
            promise.then(
                function(stream) {
                    //stream.state === 'subscribed' or 'unsubscribed' depending on which action was taken
                }
	    });

## events emitted
###interaction(data)
    The interaction data collected from the DataSift stream.
###tick
    A tick event from DataSift, used to let the DataSift client know that the connection is still live.
###success
    A success event from DataSift.
###warning(message)
    Warnings about the state of the driver, bad status codes from the server, or incorrectly formatted JSON.
###delete(data)
    A tweet was deleted on twitter and needs to be deleted by the client, if you are persisting the tweet interaction.
###error(error)
    Error coming from the DataSift stream.
###unknownEvent(data)
    An event coming from DataSift which its status cannot be determined.
###debug(message)
    Information relating the transition in state of the driver.  Used for debugging purposes.


##REST API client

The doApiPost method allows for arbitrary REST API calls.

    var DataSift = require('datasift');
    var ds = new DataSift('YOUR_ACCOUNT', 'YOUR_API_KEY');

    var endpoint = 'https://api.datasift.com/API_END_POINT'
    var params = 'API_PARAMS';

    ds.doApiPost(endpoint, params).then(
        function(returnedValue) {
            //handled returnedValue
        });

##License

Copyright (c) 2012 LocalResponse Inc.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
