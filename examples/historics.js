// A simple example to show how to compile CSDL on DataSift and stream the response to you

// require DataSift
var DataSift = require('../lib/datasift'),
	async = require('async'),
	username = 'abcd',
	apikey = '1234',
	queue = [],
	hash = false,
	ds = new DataSift(username, apikey);


var compile = function (next) {

	console.log('Compiling CSDL ...');

	ds.compile({
		csdl: 'interaction.content contains_any "Apple,Google" AND interaction.type == "twitter"'
	}, function (err, response) {
		if (response & response.hash) {
			console.log('Stream compiled, hash: ' + response.hash);
			hash = response.hash;
			next();
			return;
		}
		return next(err);
	});
};

var historicStatus = function (next) {

	console.log("Getting historics status ...");

	var noDays = 2,
		dateOffset = 24*60*60*1000,
		startDate = new Date(),
		endDate = new Date();

	startDate.setTime(startDate.getTime() - Math.ceil(dateOffset*(noDays+1)));
	endDate.setTime(endDate.getTime() - dateOffset);

	ds.historics.status({
			start: Math.round(this.startDate/1000),
			end: Math.round(this.startDate/1000),
			sources: "twitter"
		}, function(err,response) {
			$this.historicPrepare();
	});
},

// push each of the functions onto the queue in order
queue.push(compile);

// run all our functions
async.series(queue);






var test = {
	compile: function() {

		console.log("Compiling CSDL...");

		$this = this;

		ds.compile({ csdl: csdl}, function(err, response) {
			if(err)
				throw err;

			$this.streamHash = response.hash;
			$this.historicStatus();
		});
	},

	historicStatus: function() {
		$this = this;

		console.log("Getting historics status...");

		var noDays = 2;
		var dateOffset = 24*60*60*1000; 
		this.startDate = new Date();
	    this.endDate = new Date();
	    this.startDate.setTime(this.startDate.getTime() - Math.ceil(dateOffset*(noDays+1)));
	    this.endDate.setTime(this.endDate.getTime() - dateOffset);

		ds.historics.status({
				start: Math.round(this.startDate/1000),
				end: Math.round(this.startDate/1000),
				sources: "twitter"
			}, function(err,response) {
				$this.historicPrepare();
		});
	},

	historicPrepare: function() {
		
		console.log("Preparing historic query...");

		$this = this;

		ds.historics.prepare({
				hash: this.streamHash,
				start: Math.round(this.startDate/1000),
				end: Math.round(this.endDate/1000),
				name: "Historic Pull test",
				sources: "twitter"
			}, function(err,response) {
				console.log("Historics ID: " + response.id);
				$this.historicsId = response.id;
				$this.createSubscription();
		});
	},

	createSubscription: function() {

		console.log("Creating subscription...");

		$this = this;

		var options = {
					historics_id: this.historicsId,
					name: "Test historic pull",
					output_type: "pull",
					output_params: {
						format: "json_new_line"
					}
				};

		ds.push.create(options,
				function(err, response) {
					if(err)
						throw err;

					console.log("Subscription ID: " + response.id);
					$this.subscriptionId = response.id;	
					$this.historicStart();
					
				}
			);
	},

	historicStart: function() {
		console.log("Starting historic query...");

		$this = this;

		ds.historics.start({
				id: this.historicsId
			}, function(err,response) {
				console.log("Historic started!");
				$this.pullData();
		});
	},

	pullData: function() {

		$this = this;

		setTimeout(function() {

			console.log("Pulling data");

			ds.pull({ id: $this.subscriptionId },
				function(err, data, headers) {
					
					if(err)
						throw err;

					if(data)
						console.log("Interactions: " + data.length);

					if(headers['x-datasift-bytes-remaining'])
					{
						var remainingBytes = parseInt(headers['x-datasift-bytes-remaining']);
						console.log("Remaining bytes: " + remainingBytes);
						
						if(remainingBytes == 0)
							$this.checkSubscriptionStatus();
						else
							$this.pullData();	
					}
					else
					{
						$this.checkSubscriptionStatus();
					}
					
				}
			);
		},5000);

	},

	checkSubscriptionStatus: function() {

		$this = this;

		setTimeout(function() {

			console.log("Pulling data");

			ds.push.get({ id: $this.subscriptionId },
				function(err, response, headers) {
					
					if(err)
						throw err;

					console.log("Status: " + response.status);

					if(response.status == "finished")
					{
						console.log("FINISHED!");
						process.exit(0);
					}
					else
					{
						$this.pullData();
					}
					
				}
			);
		},5000);

	},

	stopSubscription: function() {

		$this = this;

		ds.push.stop({id: this.subscriptionId}, 
			function(err, response) 
			{
				if(err)
					throw err;

				console.log("Stopped subscription");

				$this.deleteSubscription();
				
			}
		);
	},

	deleteSubscription: function() {

		$this = this;

		ds.push.delete({id: this.subscriptionId}, 
			function(err, response) 
			{
				if(err)
					throw err;
					
				console.log("Deleted subscription");
			}
		);
	}
}

test.compile();
