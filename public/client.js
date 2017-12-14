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

/* ARCHITECTURE LEVEL VARS */
var socket = io(); //Client socket for server communication
var gameCanvas; //top, dynamic canvas layer
var bgCanvas; // background, static canvas layer
var ctx; //ctx for gameCanvas
var bgCtx; //ctx for bgCanvas

/* IMAGE VARS */
var dirtImage = new Image();
dirtImage.src = 'public/img/dirt.png';

/* GAME VARS */
var gameInterval;
var playerTank = new Tank(0,400,400,2,true);

var tanks = [ playerTank,
	new Tank(1,1000,100,2),
	new Tank(2,500,150,2),
	new Tank(3,200,200,2)
];

/* Keep Track of Keys Pressed */
var Keys = {
	_pressed: {},

	UP: 87,   // W
	LEFT: 65, // A
	DOWN: 83, // S
	RIGHT: 68,// D
  
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

/* Document is Ready */
$(function() { 
	gameCanvas = $("#game-layer").get(0);
	ARENA_WIDTH = gameCanvas.width;
	ARENA_HEIGHT = gameCanvas.height;
	ctx = gameCanvas.getContext('2d');
	bgCanvas = $("#bg-layer").get(0);
	bgCtx = bgCanvas.getContext('2d');

	/* Hook Key Presses */
	gameCanvas.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
	gameCanvas.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);

	renderBG();
	ctx.font = '24px serif';
	
	gameLoop(); //Start Game Loop
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

/* Lets Browser Efficiently Manage Animations */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame   || 
	window.mozRequestAnimationFrame      || 
	window.oRequestAnimationFrame        || 
	window.msRequestAnimationFrame       || 
	function(callback, element){
		window.setTimeout(function(){
			callback(performance.now());
		}, 1000 / TARGET_FPS);
	};
})();

/* Game loop invoked every frame */
function gameLoop(){
	update();
	render();
	requestAnimFrame(gameLoop);
}

/* Render game-layer */
function render(){
	if (!ctx) //game ctx not yet retrieved
		return;

	/* Clear Drawing Area */
	ctx.clearRect(0,0,ARENA_WIDTH,ARENA_HEIGHT);

	ctx.textBaseline="bottom";
	ctx.textAlign="center";
	/* Draw All Tanks In Game*/
	for (var tank in tanks){
		tanks[tank].render(ctx);
	}
}

/* Update Local Game State */
function update(){
	for (var tank in tanks){
		tanks[tank].update(Keys);
	}
}