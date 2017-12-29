/*
 * Server-Sided Player Object
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* TODO: investigate if the status responses are appropriate */

/* Define Player based on MongoDB Model */
require('mongoose').model('Player');
var mongoose = require('mongoose');
var Player = mongoose.model('Player');

/* Exports for interfacing with MongoDB */
module.exports = {
	registerPlayer: function (req, res) {
		var person = req.body;
		var failed = false;

		//Confirmation Invalid 
		if (person.password !== person.password_confirm){
			res.status(400); //'Bad Request'
			console.log("Passwords do not match");
			res.end();
			failed = true;
			return;
		}

		//Username / Password too short
		if (person.username.length == 0 || person.password.length < 5){
			res.status(406); //'Not Acceptable'
			console.log("Player username/password too short");
			res.end();
			failed = true;
			return;
		}

		//Check if Username already Registered
		Player.find({}, function (err, docs) {
			if (err) {
				res.status(504); //'Gateway Timeout'
				res.end(err);
			} else {
				for (var i = 0; i < docs.length; i++) {
					if (person.username === docs[i].username){ //TODO: optimize this search to be < O(n) ?
						failed = true;
						console.log("A user with this name already exists.");
						res.status(409); //'Conflict'
						res.end(err);
						return;
					}
				}
			}
		});

		new Player({ username: person.username, password: person.password}).save(function (err) {
			if (err) {
				res.status(504); //'Gateway Timeout'
				res.end(err);
			} else if (!failed) {
				console.log('Player Registered');
				res.status(201); //'Created'
			}
		});
	},

	loginPlayer: function (req, res, next) {
		var user = req.query.username;
		var pass = req.query.password;

		Player.find({}, function (err, docs) {
			if (err) {
				res.status(504); //'Gateway Timeout'
				res.end(err);
			} else {
				for (var i = 0; i < docs.length; i++) {
					if (docs[i].username === user){
						if (docs[i].password === pass){
							console.log("Login Accepted");
							res.status(200); //'OK'
							res.write(JSON.stringify(docs[i]));
							return;
						}else{
							console.log("Incorrect Password");
							res.status(401); //'Unauthorized'
							res.end();
							return;
						}
					}
				}
				console.log("Unknown User");
				res.status(401); //'Unauthorized'
				res.end();
			}
		});
	},

	delete: function( req, res, next) {
		console.log(req.params.id);
		Player.find({ _id: req.params.id}, function(err) {
			if(err) {
				req.status(504); //'Gateway Timeout'
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