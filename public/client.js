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
var playerTank = new Tank(0,300,400,2,true);
var aiTank = new Tank(1,600,200,2,false);
aiTank.attachComponents([new RandomComponent(), new DriveComponent(), new RotateComponent()]);
var tanks = [playerTank, aiTank];

var bullets = new Map(); //Maps bullet ids to bullet obj

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
	gameCanvas = $("#game-layer").get(0);
	ctx = gameCanvas.getContext('2d');
	bgCanvas = $("#bg-layer").get(0);
	bgCtx = bgCanvas.getContext('2d');
	ARENA_WIDTH = gameCanvas.width;
	ARENA_HEIGHT = gameCanvas.height;

	/* Hook Key Presses */
	gameCanvas.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
	gameCanvas.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);
	$(gameCanvas).focusout(function() {
		Keys._pressed = {}; /* clear input on loss of focus */
	}); 

	/* Set Current Page */
	currentPage = $('#login-page');
	ctx.font = '24px serif';
	ctx.textBaseline="bottom";
	ctx.textAlign="center";

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

	/* Draw All Entities In Game*/
	bullets.forEach(function (bullet) {
		bullet.render(ctx);
	});
	tanks.forEach(function(tank){
		tank.render(ctx);
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