//Include the DataSift consumer
//var DataSift = require('/path/to/datasift.js');	//When downloading datasift.js
var DataSift = require('datasift');					//When using npm installation

//Create a new instance of the DataSift consumer
var streamConsumer = new DataSift('username', 'api_key').createStreamConsumer();

//Emitted when there is an error
streamConsumer.on("error", function(error){
    console.log("Error: " + error.message);
});

//Emitted when there is a warning
streamConsumer.on("warning", function(message){
    console.log("Warning: " + message);
});

//Emitted when disconnected
streamConsumer.on("disconnect", function(){
    console.log("Disconnected!");
});

//Emitted when an interaction is received
streamConsumer.on("interaction", function(data){
    console.log("Received data: " + JSON.stringify(data));
});

//Emitted when a delete message is received
streamConsumer.on("delete", function(data){
    console.log("Delete: " + JSON.stringify(data));
});

//Emitted for debugging information
streamConsumer.on("debug", function(message) {
    console.log("Debug: " + message);
});


//Connect
//Subscribe to Foursquare and Gowalla checkins
streamConsumer.subscribe('e4941c3a0b4a905314ce806dea26e0d7').then(
    function(state) {
        console.log('subscribed!')
    });
