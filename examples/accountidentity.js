// #Example - Managing identities using the Account API
// *How to perform identity, token and limit management functions.*

// Require the DataSift library - **choose one of these**:
var DataSift = require('datasift-node'); // When running from NPM package
var DataSift = require('../lib/datasift'); // When running within datasift-node repository

// Create a DataSift client object - **insert your API credentials**:
var ds = new DataSift('YOUR_USERNAME', 'YOUR_APIKEY');

// Variable to store the ID for the identity:
var identityId = '';

// ## Declare Utility Methods

// Deletes the token for a service:
function deleteToken() {
	'use strict';
	ds.token.delete({
		'identity_id': identityId,
		'service': 'facebook'
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Deleted token.');
		}
	});
}

// Deletes the service limit for an identity:
function deleteLimit() {
	'use strict';
	ds.limit.delete({
		'identity_id': identityId,
		'service': 'facebook'
	}, function(err) {
		if (err)
			console.log(err);
		else {
			console.log('Deleted limit.');
			deleteToken();
		}
	});
}

// Updates the limit for an identity:
function updateLimit() {
	'use strict';
	ds.limit.update({
		'identity_id': identityId,
		'service': 'facebook',
		'total_allowance': 20000,
		'analyze_queries': 600
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Updated limit: \n' + JSON.stringify(response));
			deleteLimit();
		}
	});
}

// Gets the limit for the identity, for a service:
function getIdentityServiceLimit() {
	'use strict';
	ds.limit.get({
		'identity_id': identityId,
		'service': 'facebook'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Identity service limit: \n' + JSON.stringify(response));
			updateLimit();
		}
	});
}

// Gets all limits for a service:
function getAllServiceLimits() {
	'use strict';
	ds.limit.list({
		'service': 'facebook'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Service limits: \n' + JSON.stringify(response));
			getIdentityServiceLimit();
		}
	});
}

// Creates an identity limit:
function createLimit() {
	'use strict';
	ds.limit.create({
		'identity_id': identityId,
		'service': 'facebook',
		'total_allowance': 10000,
		'analyze_queries': 500
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Created limit: \n' + JSON.stringify(response));
			getAllServiceLimits();
		}
	});
}

// Update the identity with a new token:
function updateToken() {
	'use strict';
	ds.token.update({
		'identity_id': identityId,
		'service': 'facebook',
		'token': '780558d94ee9fdbc191cd446a17171fe'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Updated token: \n' + JSON.stringify(response));
			createLimit();
		}
	});
}

// Get identity token by service:
function getServiceToken() {
	'use strict';
	ds.token.get({
		'identity_id': identityId,
		'service': 'facebook'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Got service token: \n' + JSON.stringify(response));
			updateToken();
		}
	});
}

// Get all tokens for the identity:
function getAllTokens() {
	'use strict';
	ds.token.list({
		'identity_id': identityId
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('All tokens for identity: \n' + JSON.stringify(response));
			getServiceToken();
		}
	});
}

// Creates a token for the identity:
function createToken() {
	'use strict';
	ds.token.create({
		'identity_id': identityId,
		'service': 'facebook',
		'token': '680558d94ee9fdbc191cd446a17171fe'
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Created token: \n' + JSON.stringify(response));
			getAllTokens();
		}
	});
}

// Gets the new identity:
function getIdentity() {
	'use strict';
	ds.identity.get({
		'id': identityId
	}, function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Got identity: \n' + JSON.stringify(response));
			createToken();
		}
	});
}

// Updates the new identity:
function updateIdentity() {
	'use strict';
	ds.identity.update({
			'id': identityId,
			'label': 'Test Node Identity - Renamed'
		},
		function(err, response) {
			if (err)
				console.log(err);
			else {
				console.log('Identity updated: \n' + JSON.stringify(response));
				getIdentity();
			}
		});
}

// Creates a new identity:
function createIdentity() {
	'use strict';
	ds.identity.create({
		'label': 'Test Node Identity'
	}, function(err, response) {
		if (err) {
			console.log(err);
		} else {
			identityId = response.id;
			console.log('Identity created: \n' + JSON.stringify(response));
			updateIdentity();
		}
	});
}

// Gets a list of current identities in your account:
function getIdentities() {
	'use strict';
	ds.identity.list(function(err, response) {
		if (err)
			console.log(err);
		else {
			console.log('Current identities: \n' + JSON.stringify(response));
			createIdentity();
		}
	});
}

// ## Initiate Process
// Finally we start the process creating a list. This will lead to:
// * Get a list of current identities
// * Create a new identity
// * Update the new identity
// * Get the updated identity
// * Create a token for the identity
// * Get all current tokens for the identity
// * Get current tokens for a service
// * Update the new token
// * Create an identity limit
// * Get all limits for a service
// * Get the limit for the identity, for a service
// * Update the limit
// * Delete the limit
// * Delete the token
getIdentities();