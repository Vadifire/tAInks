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
var player = require('./models/player'); //Import player model
var tank = require('./models/tank'); //Import tank model
var sass = require('node-sass');//Node SCSS
var fs = require('fs'); //Filesystem

/* Routes */
app.get('/',function(req, res) { //Respond with index.html to HTTP get request
	res.sendFile(path.join(__dirname,"public/views/index.html"));
});

/* Build SCSS into CSS */
var scss_filename = './public/styles.scss';
var scss_savepath = './public/styles.css';
console.log("Begin compiling " + scss_filename + " to " + scss_savepath);
sass.render({
  file: scss_filename
}, function(err, result) {
	if(err) console.log(err);
	fs.writeFile(scss_savepath, result.css, function(err_write) {
		if(err_write) console.log(err_write);
		console.log("Successfully compiled " + scss_filename + " to " + scss_savepath);
	});
});

//Serve public resources
app.use('/public', express.static('public'));

//Body Parser for MongoDB
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


/* MongoDB API for Players */
app.post('/players', player.registerPlayer);
app.get('/players', player.loginPlayer);
//app.delete('/players/:id', player.delete);

/* MongoDB API for Tanks */
app.post('/tanks', tank.createTank);
app.get('/tanks', tank.seeTanks);
//app.delete('/tanks/:id', tank.delete);


/* Start Server */
var port = process.env.PORT || 3000;  //default to port 3000
serv.listen(port); //start server listener
console.log("Server started on port "+port+".");

/* Listen to packets from Clients */
io.sockets.on('connection', function(socket){
	//Handle disconnection
	socket.on('disconnect', function(){
	});
});