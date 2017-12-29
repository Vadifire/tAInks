/*
 * Server-Sided Tank Object
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* Define Tank based on MongoDB Model */
require('mongoose').model('Tank');
var mongoose = require('mongoose');
var Tank = mongoose.model('Tank');

/* Exports for interfacing with MongoDB */
module.exports = {
	createTank: function (req, res) {
		var tank = req.body;
		new Tank({ name: tank.name }).save(function (err) {
			if (err) {
				res.status(504);
				res.end(err);
			} else {
				console.log('tank saved');
				res.end();
			}
		});
	},
	seeTanks: function (req, res, next) {
		Tank.find({}, function (err, docs) {
			if (err) {
				res.status(504);
				res.end(err);
			} else {
				for (var i = 0; i < docs.length; i++) {
					console.log('tank:', docs[i].name);
				}
				res.end(JSON.stringify(docs));
			}
		});
	},
	delete: function( req, res, next) {
		console.log(req.params.id);
		Tank.find({ _id: req.params.id}, function(err) {
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