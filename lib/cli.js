// Ignores un-signed certificates for internal testing automation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var nopt = require("nopt");
var DataSift = require('../lib/datasift');
var libVersion = require('../lib/library-version');

function printHelp() {
	console.log("Usage: cli.js -a [-e] -c [-u] [-p*]");
	console.log("\t-a --auth : Authentication details in format 'username apikey'");
	console.log("\t-e --endpoint : The API endpoint, e.g. core");
	console.log("\t-c --command : The command you want to perform, e.g. validate");
	console.log("\t-u --url : The API domain to hit, e.g. api.datasift.com");
	console.log("\t-p --param [name] [value] : Additional parameters for the command");
	console.log("");
}

function parseAuthDetails(parsedOptions) {
	var auth = {};

	parsedOptions.argv.cooked.forEach(function(option, i) {
		if(option === "--auth")
		{
			var valid = false;
			var username = parsedOptions.argv.cooked[i + 1];
			var apikey = parsedOptions.argv.cooked[i + 2];

			// Check param arguments exist
			if(username && apikey)
			{
				if(username.indexOf("--") === -1 && apikey.indexOf("--") === -1)
				{
					valid = true;
				}
			}

			if(!valid)
				throw "Authentication details not found, please specify as -a [username] [apikey]";
			else
			{
				auth.username = username;
				auth.apikey = apikey;
			}
		}

	});

	return auth;
}

function parseParams(parsedOptions) {
	var params = {};

	parsedOptions.argv.cooked.forEach(function(option, i) {
		if(option === "--param")
		{
			var valid = false;
			var paramName = parsedOptions.argv.cooked[i + 1];
			var paramValue = parsedOptions.argv.cooked[i + 2];

			// Check param arguments exist
			if(paramName && paramValue)
			{
				if(paramName.indexOf("--") === -1 && paramValue.indexOf("--") === -1)
				{
					valid = true;
				}
			}

			if(!valid)
				throw "Parameter '" + paramName + "' is incorrectly specified, please check the arguments specified";
			else
			{
				var parts = paramName.split('.');
				var tempParams = params;

				while(parts.length > 1)
				{
					if(!tempParams[parts[0]])
						tempParams[parts[0]] = {};

					tempParams = tempParams[parts[0]];
					parts = parts.slice(1);
					
				}

				tempParams[parts[0]] = paramValue;
			}
			
		}
	});

	return params;
}

function parseOptions() {
	var knownOpts = { "endpoint" : [String, null],
					"command": [String, null],
					"url": [String,null],
					"help": Boolean,
					"version": Boolean,
					"auth": [String,null],
					"param": [String,null]
                };

	var shortHands = {
						"e" : ["--endpoint"],
						"c" : ["--command"],
						"h" : ["--help"],
						"v" : ["--version"],
						"a" : ["--auth"],
						"p" : ["--param"],
						"u" : ["--url"]
					};

	var parsed = nopt(knownOpts, shortHands, process.argv);
	var options = {};
	options.params = parseParams(parsed);
	options.auth = parseAuthDetails(parsed);
	
	if(parsed.version)
	{
		console.log(libVersion.version);
		return;
	}

	if(parsed.help)
	{
		printHelp();
		return;
	}

	options.api = (parsed.url) ? parsed.url : "api.datasift.com";
	options.endpoint = (parsed.endpoint) ? parsed.endpoint : "core";
	options.command = parsed.command;
	
	return options;

}

/* The CLI has been built to work with internal automated testing. In this function
  we map / adjust parameters from the shell script to match the library.
*/
function correctOptions(options)
{
	if(options.command === "prepare" && options.endpoint === "historics")
	{
		options.params.sources = "twitter";
	}

	if(options.command === "update" && options.endpoint === "historics")
	{
		options.params.reason = "CLI test script";
	}

	if(options.endpoint === "managed_sources" && options.params.source_id)
	{
		options.params.id = options.params.source_id;
	}

	if(options.endpoint === "managed_sources")
		options.endpoint = "source";

	if(options.command === "analyze" && options.endpoint === "pylon")
	{
		if(options.params.parameters) 
			options.params.parameters = JSON.parse(options.params.parameters);

		if(options.params.start) 
			options.params.start = parseInt(options.params.start,10);

		if(options.params.end) 
			options.params.end = parseInt(options.params.end,10);
	}
}

function resultHandler(err, result, headers, statusCode)
{
	if (err) {
		var type = typeof err;
		if (type == "string")
			console.log("ERROR: " + err); 
		else
			console.log("ERROR: " + JSON.stringify(err)); 
	}
	else
	{
		console.log(JSON.stringify({
			status: statusCode,
			headers: headers,
			body: result
		}));
	}
}

try
{
	var options = parseOptions();
	correctOptions(options);
	var ds = new DataSift(options.auth.username, options.auth.apikey, options.api, false);

	if(!options.command)
		throw "Please define a command to run.";

	if(options.endpoint === "core")
		ds[options.command](options.params, resultHandler);
	else
		ds[options.endpoint][options.command](options.params, resultHandler);	
}
catch(ex)
{
	console.log((ex.stack) ? ex.stack : JSON.stringify(ex));
}
