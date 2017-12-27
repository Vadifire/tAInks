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
var enableAudio = false; //Whether or not we should play Audio
var arenaSoundLoop = new Howl({src: ['public/audio/arena-loop.mp3'], loop:true, volume: 0.2});

/* GAME VARS */
var tanks = new Map(); //map tank ids to tanks
var deadTanks = new Map(); //graveyard of tanks (again, map tank ids to tanks)
var bullets = new Map(); //Maps bullet ids to bullet obj

var playerTank = new Tank(0, 100, 400, 3, true);
//Scatter AI tanks
for (var i = 0; i < 5; i++){ //12
    //var ai = new Tank(i + 1, 200 + 200 * (i % 4) + 30 * (i % 8), 160 + Math.floor(i / 4) * 220, 3, false);
    var ai = new Tank(i + 1, Math.random()*1200, Math.random()*800, 3, false);
    ai.attachComponents([new TankSensorComponent(0, -96, Math.PI / 2),
        new TankSensorComponent(96 / 2 * Math.sqrt(2), -96 / 2 * Math.sqrt(2), Math.PI / 4),
        new TankSensorComponent(-96 / 2 * Math.sqrt(2), -96 / 2 * Math.sqrt(2), Math.PI * 3 / 4),
		new DriveComponent(), new RotateComponent(), new ShootComponent()]);
	tanks.set(ai.id, ai);
}
//Add Player to Map
//tanks.set(playerTank.id, playerTank);
var generation = 1;
console.log("CURRENT GENERATION: "+generation);

var viewmngr; //Object in charge of handling views shown to user.

/* Keep Track of Keys Pressed */
var Keys = {
	_pressed: {},

	UP: 87,   // W
	LEFT: 65, // A
	DOWN: 83, // S
	RIGHT: 68,// D
    SPACE: 32, // SPACE
    NEXT_GEN: 71, // G
  
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
  
    onKeydown: function (event) {
        if (event.keyCode === Keys.NEXT_GEN) {
            nextGeneration();
        } else {
            this._pressed[event.keyCode] = true;
        }
	},
  
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
}

/* Document is Ready */
$(function() { 
	viewmngr = new ViewManager();
	gameLoop(); //Start Game Loop
});

/* Lets Browser Efficiently Manage Animations */
window.requestAnimFrame = (function () {
	return  window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame   || 
	window.mozRequestAnimationFrame      || 
	window.oRequestAnimationFrame        || 
	window.msRequestAnimationFrame       || 
	function(callback, element){
        window.setTimeout(function () {
            callback(performance.now());
		}, 1000 / TARGET_FPS);
	};
})();

/* Game loop invoked every frame */
function gameLoop(){
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

/* FPS vars for performance measurement */
var lastTime = 0;
var fpsCount = 60;
var fps = 0;

/* Render game-layer for arena */
function render(){
	/* Clear Drawing Area */
	ctx.clearRect(0,0,ARENA_WIDTH,ARENA_HEIGHT);

    /* Draw HUD Info */
    ctx.font = '24px impact';
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText("Generation: "+generation,ARENA_WIDTH-4, 0);
    if (performance.now() - 1000 > lastTime) {
        fps = fpsCount;
        fpsCount = 0;
        lastTime = performance.now();
    }
    fpsCount++;
    ctx.fillText("FPS: " + fps, ARENA_WIDTH - 4, 28);

    ctx.font = '16px impact';
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";

	/* Draw All Entities In Game*/
	bullets.forEach(function (bullet) {
		bullet.render(ctx);
	});
	tanks.forEach(function(tank){
		tank.render(ctx);
    });
}

/* Update Local Game State */
function update() {
	bullets.forEach(function(bullet){
		bullet.update(Keys);
	});
	tanks.forEach(function(tank){
		tank.update(Keys);
    });

    if (tanks.size <= 1) { /* one tank left -> winner decided, end game */
        processGameEnd();
    }
}

/*
 * Process the game's end
 *  1) Evolve the population based on individual's fitness function
 *  2) Reset tanks and round
 */
function processGameEnd() {
    if (tanks.size === 1) { //if a lone winner stands, now add them to death list
        var tankWinner = tanks.entries().next().value[1]; //get first tank from tanks Map
        deadTanks.set(tankWinner.id, tankWinner); // add last tank to dead tanks
        tanks.delete(tankWinner.id); // remove from active tanks list
    }
    tanks = evolve(deadTanks, 0.25);
    deadTanks = new Map(); // clear dead tanks
    bullets = new Map(); // clear any stray bullets
    tanks.forEach(function (tank) { //Revive the tanks
        tank.reset();
    });
    generation++; //Upgrade global generation var
    console.log("CURRENT GENERATION: " + generation);
    console.log(tanks);
}


/*
 * Kill all remaining tanks and proceed to next gen
 */
function nextGeneration() {
    tanks.forEach(function (tank) { //soft kill remaining tanks
        deadTanks.set(tank.id, tank);
    });
    tanks = new Map(); //clear
    processGameEnd();
}