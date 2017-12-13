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

/* IMAGE VARS */
var dirtImage = new Image();
dirtImage.src = 'public/img/dirt.png';
var tankImage = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];
tankImage.forEach(function(item, index, array){
	item.src = 'public/img/tank/' + (index+1) + '.png';
	console.log(item.src)
});

/* GAME VARS */
var gameInterval;
var playerTank = new Tank(0,0,0,2);

var tanks = [ playerTank,
	new Tank(1,1000,100,2),
	new Tank(2,500,150,2),
	new Tank(3,200,200,2)
];

/* Document is Ready */
$(function() { 
	gameCanvas = $("#game-layer").get(0);
	ARENA_WIDTH = gameCanvas.width;
	ARENA_HEIGHT = gameCanvas.height;
	ctx = gameCanvas.getContext('2d');
	bgCanvas = $("#bg-layer").get(0);
	bgCtx = bgCanvas.getContext('2d');

	renderBG();
	ctx.font = '24px serif';
	
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
	
	/* Draw All Tanks In Game*/
	
	tanks.forEach(function(tank, index, array) {
		ctx.drawImage(tankImage[tank.animPos], tank.x, tank.y);
		ctx.fillText('Player ' + tank.id, tank.x, tank.y-10);
	});
}

/* Update Local Game State */
function update(){
	/* Handle Tank Movement */
	var speed = playerTank.speed;
	if ((Keys.isDown(Keys.UP) || Keys.isDown(Keys.DOWN)) && 
		(Keys.isDown(Keys.LEFT) || Keys.isDown(Keys.RIGHT))){
		speed *= DIAG_SPEED_FACTOR; //Ensure Diag movement doesn't increase speed
	}

	if (Keys.isDown(Keys.UP)) { 
		playerTank.y-= speed; 
		if(playerTank.animPos < 7 )
			playerTank.animPos += 1;
		else
			playerTank.animPos = 0;
	}
	if (Keys.isDown(Keys.DOWN)){ 
		playerTank.y+= speed; 
		if(playerTank.animPos >= 1 )
			playerTank.animPos -= 1;
		else
			playerTank.animPos = 7;
	}
	
	if (Keys.isDown(Keys.LEFT)) playerTank.x-= speed;
	if (Keys.isDown(Keys.RIGHT)) playerTank.x+= speed;
}

/* Tank Constructor */
function Tank(id, x, y, speed){
	this.id = id; //unique id TO-DO: avoid id collision
	this.x = x;
	this.y = y;
	this.speed = (speed < 0 ? 0 : speed); //assure positive integer. this is in terms of px * FPS per now.
	this.animPos = 0; //Animation position
}

Tank.prototype.move = function(x,y){
	this.x = x;
	this.y = y;
}

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

/* Hook Key Presses */
window.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);