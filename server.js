/*
 * Server Sided NodeJS
 *
 * Title: tAInks
 *
 * Authors:
 *   @author Cedric Debelle
 *	 @author Calvin Ellis
 */

/* Dependencies */
var express = require('express');
var app = express();
var path = require('path');
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

/* Routes */
app.get('/',function(req, res) {
	res.sendFile(path.join(__dirname,"public/index.html"));
});
app.use('/public', express.static('public'));

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