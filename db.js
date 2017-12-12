/*
 * MongoDB Schemas
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

var mongoose = require('mongoose');  
var Player = new mongoose.Schema({
	username: { type: String }
});

mongoose.model('Player', Player);  
	
mongoose.connect('mongodb://localhost/', function (err, db){
	if (err){
		console.log("Failed to connect to MongoDB.");
	}else{
		console.log("Connected to MongoDB.");
	}
}); 
