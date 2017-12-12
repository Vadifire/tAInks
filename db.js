/*
 * MongoDB Schemas
 *
 * Authors:
 *   @author Cedric Debelle
 *	 @author Calvin Ellis
 */

var mongoose = require('mongoose');  
var Player = new mongoose.Schema({
	username: { type: String }
});

mongoose.model('Player', Player);  
mongoose.connect('mongodb://localhost/'); 

console.log('Connected to DB');