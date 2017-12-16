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
var currentPage; //Page (div) currently being viewed

/* GAME VARS */
var gameInterval;
var playerTank = new Tank(0,400,400,2,true);

var tanks = [ playerTank,
	new Tank(1,1000,100,2),
	new Tank(2,500,150,2),
	new Tank(3,200,200,2)
];

var bullets = new Map(); //Maps bullet ids to bullet obj
var viewmngr; //Object in charge of handling views shown to user.

/* Keep Track of Keys Pressed */
var Keys = {
	_pressed: {},

	UP: 87,   // W
	LEFT: 65, // A
	DOWN: 83, // S
	RIGHT: 68,// D
	SPACE: 32, // SPACE
  
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
  
	onKeydown: function(event) {
		this._pressed[event.keyCode] = true;
		if (event.keyCode == Keys.SPACE){
			playerTank.shoot(); //listen to shoots
		}
	},
  
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
}

/* Document is Ready */
$(function() { 

if ($("#game-layer").length > 0){ //game ctx not yet retrieved
		
	}
	
	/* Set Current Page */
	viewmngr = new ViewManager();
	
	gameLoop(); //Start Game Loop
});


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
	console.log(viewmngr.currentView);
	switch(viewmngr.currentView){
		case VIEWS.ARENA:
			update();
			render();
			requestAnimFrame(gameLoop);
			break;
		default:
			requestAnimFrame(gameLoop);
			break;
	}
}

/* Render game-layer */
function render(){
	/* Clear Drawing Area */
	ctx.clearRect(0,0,ARENA_WIDTH,ARENA_HEIGHT);

	ctx.textBaseline="bottom";
	ctx.textAlign="center";

	/* Draw All Entities In Game*/
	bullets.forEach(function (bullet) {
		bullet.render(ctx);
	});
	tanks.forEach(function(tank){
		tank.render(ctx);
		console.log("im a tank ");
	});
}

/* Update Local Game State */
function update(){
	bullets.forEach(function(bullet){
		bullet.update(Keys);
	});
	tanks.forEach(function(tank){
		tank.update(Keys);
	});
}