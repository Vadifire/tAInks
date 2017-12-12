/*
 * Client Sided Javascript
 *
 * Title: tAInks
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* CONSTANTS */
const SPRITE_WIDTH = 84;
const SPRITE_HEIGHT = 84;
const TARGET_FPS = 60;
var ARENA_WIDTH;
var ARENA_HEIGHT;
var DIAG_SPEED_FACTOR = Math.sqrt(2)/2;

/* ARCHITECTURE LEVEL VARS */
var socket = io(); //Client socket for server communication
var gameCanvas; //top, dynamic canvas layer
var bgCanvas; // background, static canvas layer
var ctx; //ctx for gameCanvas
var bgCtx; //ctx for bgCanvas

/* GAME VARS */
var gameInterval;
var tank = {
	x : 100,
	y : 100,
	speed : 2,  //this is in terms of px * FPS per now.
	image: null
};

/* IMAGE VARS */
var dirtImage = new Image();
dirtImage.src = 'public/img/dirt.png';
var tankImage = new Image();
tankImage.src = 'public/img/tank/1.png'; //TODO: transparency
tank.image = tankImage;

/* Document is Ready */
$(function() { 
	gameCanvas = $("#game-layer").get(0);
	ARENA_WIDTH = gameCanvas.width;
	ARENA_HEIGHT = gameCanvas.height;
	ctx = gameCanvas.getContext('2d');
	bgCanvas = $("#bg-layer").get(0);
	bgCtx = bgCanvas.getContext('2d');

	renderBG();
	setInterval(gameLoop, 1000 / TARGET_FPS); //very inefficient I'd imagine
});


/* Initially render BG Canvas with all dirt */
function renderBG(){
	if (!bgCtx) //bgCtx not yet retrieved
		return;
	var x = 0, y = 0; //base top left

	/* draw dirt */
	while (y < ARENA_HEIGHT){
		while (x < ARENA_WIDTH){
			bgCtx.drawImage(dirtImage, x, y);
			x += SPRITE_WIDTH;
		}
		x = 0;
		y += SPRITE_HEIGHT;
	}
}


/* Shoot for 60 UPS and max FPS */
function gameLoop(){
	update();
	render();
}

/* Render game-layer */
function render(){
	if (!ctx) //game ctx not yet retrieved
		return;
	ctx.clearRect(0,0,ARENA_WIDTH,ARENA_HEIGHT);
	ctx.drawImage(tank.image, tank.x, tank.y);
}

/* Update Local Game State */
function update(){
	/* Handle Tank Movement */

	var speed = tank.speed;
	if ((Keys.isDown(Keys.UP) || Keys.isDown(Keys.DOWN)) && 
		(Keys.isDown(Keys.LEFT) || Keys.isDown(Keys.RIGHT))){
		speed *= DIAG_SPEED_FACTOR; //Ensure Diag movement doesn't increase speed
	}

	if (Keys.isDown(Keys.UP)) tank.y-=tank.speed;
	if (Keys.isDown(Keys.LEFT)) tank.x-=tank.speed;
	if (Keys.isDown(Keys.DOWN)) tank.y+=tank.speed;
	if (Keys.isDown(Keys.RIGHT)) tank.x+=tank.speed;
}

/* Keep Track of Keys Pressed */
var Keys = {
	_pressed: {},

	UP: 87, //W
	LEFT: 65, //A
	DOWN: 83, // S
	RIGHT: 68, //D
  
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
  
	onKeydown: function(event) {
		this._pressed[event.keyCode] = true;
	},
  
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
}

/* Hook Key Presses */
window.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);