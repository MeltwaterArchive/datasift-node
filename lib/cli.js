var nopt = require("nopt");
var DataSift = require('../lib/datasift');
var libVersion = require('../lib/library-version');

function printHelp() {
	console.log("Usage: cli.js -a [-e] -c [-u] [-p*]");
	console.log("\t-a --auth : Authentication details in format 'username:apikey'");
	console.log("\t-e --endpoint : The API endpoint, e.g. core");
	console.log("\t-c --command : The command you want to perform, e.g. validate");
	console.log("\t-u --url : The API domain to hit, e.g. api.datasift.com");
	console.log("\t-p --param [name] [value] : Additional parameters for the command");
	console.log("");
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
						"u" : ["--url"],
						"h" : ["--help"],
						"v" : ["--version"],
						"a" : ["--auth"],
						"p" : ["--param"]
					};

	var parsed = nopt(knownOpts, shortHands, process.argv);
	var options = {};
	options.params = parseParams(parsed);
	
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

	if(parsed.auth)
	{
		var authOk = false;
		authDetails = parsed.auth.split(":");

		if(authDetails.length === 2)
		{
			if(authDetails[0].length > 0 && authDetails[1].length > 0)
			{
				options.username = authDetails[0];
				options.apikey = authDetails[1];	
				authOk = true;
			}
		}
		
		if(!authOk)
		{
			throw "Authentication details must be provided in format username:apikey";
		}
	}
	else
	{
		throw "Authentication details must be provided, see -a option.";
	}

	options.api = (parsed.url) ? parsed.url : "api.datasift.com";
	options.endpoint = (parsed.endpoint) ? parsed.endpoint : "core";
	options.command = parsed.command;
	
	return options;

}

function resultHandler(err, result, headers, statusCode)
{
	if (err) {
		console.log("ERROR: " + err); 
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
	var ds = new DataSift(options.username, options.apikey);

	if(!options.command)
		throw "Please define a command to run.";

	if(options.endpoint === "core")
		ds[options.command](options.params, resultHandler);
	else
		ds[options.endpoint][options.command](options.params, resultHandler);	
}
catch(ex)
{
	console.log((ex.stack) ? ex.stack : ex);
}
