/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

var http = require('http'),
	Events = require('events'),
	libVersion = require('./library-version');

/** 
 * Creates DataSift instance
 *
 * @class
 * 
 * @param string   username
 * @param string   API key
 */
function Stream(username, apiKey) {
	// call the parent
	Events.EventEmitter.call(this);

	this.username = username;
	this.apiKey = apiKey;
	this.connectTimeout = null;
	this.dataTimeout = null;
	this.convertNextError = false;
	this.userAgent = 'DataSift/v1 Node/v' + libVersion.version;
	this.host = 'stream.datasift.com';
	this.port = 80;
	
	// the request object
	this.request = null;
	// the response object
	this.response = null;
	// last connect
	this.lastConnect = null;
	// data
	this.data = '';

	// add a listener for processing closing
	process.on('exit', function () {
		this.disconnect();
	}.bind(this));
	
	// error callback
	this.errorCallback = function(err, emitDisconnect) {
		if (emitDisconnect === undefined) {
			emitDisconnect = false;
		}
		this.emit('error', err);
		this.disconnect(emitDisconnect);
	}.bind(this);
	
	// disconnection callback
	this.disconnectCallback = function() {
		// handle disconnection
		this.disconnect(true);
	}.bind(this);
	
	//Data callback
	this.dataCallback = function(chunk) {

		// we have data to send, so let's reset the timer
		this._resetDataReceivedTimer();
		// convert to utf8 from buffer
		chunk = chunk.toString('utf8');
		// add chunk to data
		this.data += chunk;
		
		// if the string contains a line break we will have JSON to process
		if (chunk.indexOf("\n") > 0) {
			// split by line space and look for json start
			var data = this.data.split("\n");
			if (data[0] !== undefined) {
				var json = null;
				try {
					json = JSON.parse(data[0]);
				} catch (e) {}
				if (json !== null) {
					this._receivedData(json);
				}
			}
			// add the second half of the chunk to a new piece of data
			this.data = data[1];
		}
	}.bind(this);
	
	// response callback
	this.responseCallback = function(response) {		
		this.response = response;
		// set the last successful connect
		this.lastConnect = new Date().getTime();
		// clear the request timeout
		if (this.connectTimeout !== null) {
			clearTimeout(this.connectTimeout);
		}

		// emit a connected event
		this.emit('connect');
		// set our data receiving timer going
		this._resetDataReceivedTimer();
		// disconnection
		response.connection.on('end', this.disconnectCallback);
		// when we receive data do something with it
		response.on('data', this.dataCallback);
	}.bind(this);
}

Stream.prototype = new Events.EventEmitter();
Stream.prototype.constructor = Stream;

/**
 * Reset the data received timer
 *
 * @private
 */
Stream.prototype._resetDataReceivedTimer = function() {

	var disconnectTimeout = 65000;

	if (this.dataTimeout !== null) {
		clearTimeout(this.dataTimeout);
	}

	this.dataTimeout = setTimeout(function(){
		this.disconnect(true);
	}.bind(this), disconnectTimeout);
};

/**
 * Process received data
 *
 * @private
 * 
 * @param Object the json object
 */
Stream.prototype._receivedData = function(json) {
	// check for errors
	if (json.status === "failure") {
		if (this.convertNextError) {
			this.emit('success', json.message);
			this.convertNextError = false;
		} else {
			this.errorCallback(new Error(json.message));
			this.disconnect(true);
		}
	
	// check for warnings
	} else if (json.status === "warning") {
		this.emit('warning', json.message, json);
	// check for successes
	} else if (json.status === "success") {
		this.emit('success', json.message, json);
	// check for deletes
	} else if (json.data !== undefined && json.data.deleted === true) {
		this.emit('delete', json);
	// check for ticks
	} else if (json.tick !== undefined) {
		this.emit('tick', json);
	// normal interaction
	} else {
		this.emit('interaction', json);
	}
};

/**
 * Subscribe to a hash
 *
 * @private
 * 
 * @param string hash the stream hash
 */
Stream.prototype._checkHash = function(hash) {
	try {hash = /([a-f0-9]{32})/i.exec(hash)[1];} catch(e) {}
	if (hash === null) {
		return false;
	} else {
		return true;
	}
};

/**
 * Open a connection to DataSift
 */
Stream.prototype.connect = function() {
	// connect if we are allowed
	if (this.lastConnect === null || this.lastConnect < new Date().getTime() - 1500) {
		// create the headers
		var headers = {
			'User-Agent'        : this.userAgent,
			'Host'              : this.host,
			'Connection'        : 'Keep-Alive',
			'Transfer-Encoding' : 'chunked',
			'Authorization'     : this.username + ':' + this.apiKey
		};
		
		// create an http client
		this.request = http.request({
			port: this.port,
			host: this.host,
			headers: headers,
			method: 'GET',
			path: '/'
		});
		
		// check for an error on connection
		this.request.on('error', function(){
			this.errorCallback(new Error('Error connecting to DataSift: Could not reach DataSift. Check your internet connection.'));
		}.bind(this));
		
		// add a connection timeout
		this.connectTimeout = setTimeout(function() {
			if (this.request !== null) {
				this.request.abort();
				this.errorCallback(new Error('Error connecting to DataSift: Timed out waiting for a response'));
				this.disconnect(true);
			}
			clearTimeout(this.connectTimeout);
			this.connectTimeout = null;
		}.bind(this), 5000);

		// check for an error
		this.request.on('error', this.errorCallback);
		// add a listener for the response
		this.request.on('response', this.responseCallback);
		this.request.write("\n", 'utf8');
	} else {
		//Not allowed to reconnect so emit error
		this.errorCallback(new Error('You cannot reconnect too soon after a disconnection'), true);
	}
};

/**
 * Disconnected from DataSift
 *
 * @param boolean forced if the disconnection was forced or not
 */
Stream.prototype.disconnect = function(forced) {
	if (forced && this.request !== null) {
		// reset request and response
		this.emit('disconnect');
		// remove listeners
		this.request.removeListener('error', this.errorCallback);
		this.request.removeListener('response', this.responseCallback);
		if (this.response !== null) {
			this.response.connection.removeListener('end', this.disconnectCallback);
			this.response.removeListener('data', this.dataCallback);
		}

		// try and actually close the connection
		try {
			this.response.destroy();
		} catch (e){}

		// clear the request and response objects
		this.request = null;
		this.response = null;
		
	} else if (this.request !== null) {
		// send the stop message and convert the error response
		this.convertNextError = true;
		this.send(JSON.stringify({"action":"stop"}));
	}
};


/**
 * Subscribe to a hash
 *
 * @param string hash the stream hash
 * 
 * @return void
 */
Stream.prototype.subscribe = function(hash) {
	// check the hash
	if (!this._checkHash(hash)) {
		// send error
		this.emit('error', new Error('Invalid hash given: ' + hash));
	} else {
		// send json message to DataSift to subscribe
		this.send(JSON.stringify({"action":"subscribe", "hash":hash}));
	}
};

/**
 * Unsubscribe from a hash
 *
 * @param string hash the stream hash
 * 
 * @return void
 */
Stream.prototype.unsubscribe = function(hash) {
	// check the hash
	if (!this._checkHash(hash)) {
		// send error
		this.emit('error', new Error('Invalid hash given: ' + hash));
	} else {
		// send json message to DataSift to unsubscribe
		this.send(JSON.stringify({"action":"unsubscribe", "hash":hash}));
	}
};

/**
 * Send data to DataSift
 *
 * @param string message the message
 * 
 * @return void
 */
Stream.prototype.send = function(message) {
	if (this.request !== null) {
		this.request.write(message, 'utf8');
	} else {
		this.emit('error', new Error('You cannot send actions without being connected to DataSift'));
	}
};

module.exports = Stream;
