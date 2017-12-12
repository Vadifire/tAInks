/*
 * Server Sided NodeJS
 *
 * Title: tAInks
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* Dependencies */
var express = require('express'); //Express framework for Node
var app = express();
var path = require('path');
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{}); //Packet sending module
const bodyParser= require('body-parser'); //Used for MongoDB parsing
var db = require('./db'); //Interface with MongoDB
var player = require('./player'); //Import player model


/* Routes */
app.get('/',function(req, res) { //Respond with index.html to HTTP get request
	res.sendFile(path.join(__dirname,"public/index.html"));
});

//Serve public resources
app.use('/public', express.static('public'));

//Body Parser for MongoDB
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* API for interfacing with DB for Players */
app.post('/players', player.createPlayers);
app.get('/players', player.seeResults);
app.delete('/players/:id', player.delete);

/* Start Server */
var port = process.env.PORT || 3000;  //default to port 3000
serv.listen(port); //start server listener
console.log("Server started on port "+port+".");

/* Listen to packets from Clients */
io.sockets.on('connection', function(socket){

	socket.emit("welcome");

	//Handle disconnection
	socket.on('disconnect', function(){
		console.log('disconnected: '+socket.id);
	});
});