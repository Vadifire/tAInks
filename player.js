/*
 * Player Object
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* Define Player based on MongoDB Model */
require('mongoose').model('Player');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');


/* Exports for interfacing with MongoDB */
module.exports = {
	createPlayers: function (req, res) {
		var person = req.body;
		new Player({ username: person.username }).save(function (err) {
			if (err) {
				res.status(504);
				res.end(err);
			} else {
				console.log('player saved');
				res.end();
			}
		});
	},
	seeResults: function (req, res, next) {
		Player.find({}, function (err, docs) {
			if (err) {
				res.status(504);
				res.end(err);
			} else {
				for (var i = 0; i < docs.length; i++) {
					console.log('player:', docs[i].username);
				}
				res.end(JSON.stringify(docs));
			}
		});
	},
	delete: function( req, res, next) {
		console.log(req.params.id);
		Player.find({ _id: req.params.id}, function(err) {
			if(err) {
				req.status(504);
				req.end();
				console.log(err);
			}
		}).remove(function (err) {
			console.log(err);
			if (err) {
				res.end(err);            
			} else {
				res.end();
			}
		});
	}
}