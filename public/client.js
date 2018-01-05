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
var VIEWS = {
	LOGIN : {
		src:'/login.html', 
		cb:function(){}
	},
	MAIN_MENU : {
		src:'/main-menu.html', 
		cb:function(){}
	},
	TANK_GALLERY : {
		src:'/tank-gallery.html', 
		cb:function(){}
	},
	ARENA_LOBBY : {
		src:'/arena-lobby.html', 
		cb:function(){}
	},
	ARENA: {
		src:'/arena.html', 
		cb:function(){
		if (enableAudio){ arenaSoundLoop.play(); }
				gameCanvas = $("#game-layer").get(0);
				ARENA_WIDTH = gameCanvas.width;
				ARENA_HEIGHT = gameCanvas.height;
				ctx = gameCanvas.getContext('2d');
				bgCanvas = $("#bg-layer").get(0);
				bgCtx = bgCanvas.getContext('2d');
				
				/* Hook Key Presses */
				$(gameCanvas).focusout(function() {
					Keys._pressed = {}; /* clear input on loss of focus */
				}); 
				gameCanvas.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
				gameCanvas.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);
				gameCanvas.addEventListener('click', clickOnCanvas, false);
				console.log("Successfully loaded Arena!"); 
		}
	}
}

/* ARCHITECTURE LEVEL VARS */
var socket = io(); //Client socket for server communication
var gameCanvas; //top, dynamic canvas layer
var bgCanvas; // background, static canvas layer
var ctx; //ctx for gameCanvas
var bgCtx; //ctx for bgCanvas
var currentPage; //Page (div) currently being viewed
var enableAudio = false; //Whether or not we should play Audio
var arenaSoundLoop = new Howl({src: ['public/audio/arena-loop.mp3'], loop:true, volume: 0.2});
var view = VIEWS.LOGIN; //Current view

/* GAME VARS */

/* TODO rework maps => create general entity Map */
var tanks = new Map(); //map tank ids to tanks
var deadTanks = new Map(); //graveyard of tanks (again, map tank ids to tanks)
var bullets = new Map(); //Maps bullet ids to bullet obj
var ammo = new Map(); //Maps ammo ids to ammo obj

var playerTank = new Tank(0, 100, 400, 3, true);
//Scatter AI tanks
for (var i = 0; i < 4; i++){ //12
    //var ai = new Tank(i + 1, 200 + 200 * (i % 4) + 30 * (i % 8), 160 + Math.floor(i / 4) * 220, 3, false);
    var ai = new Tank(i + 1, 10+Math.random()*652, 10+Math.random()*358, 3, false);
    ai.attachComponents([new SensorComponent(0, -96, Math.PI / 2, tanks, laserImage1),
        new SensorComponent(96 * (1/2), -96 * (Math.sqrt(3)/2), Math.PI / 3, tanks, laserImage1),
        new SensorComponent(-96 * (1/2), -96 * (Math.sqrt(3)/2), Math.PI * 2 / 3, tanks, laserImage1),

        new SensorComponent(0, -92, Math.PI / 2, ammo, laserImage2),
        new SensorComponent(100 * (1/2), -96 * (Math.sqrt(3)/2), Math.PI / 3, ammo, laserImage2),
        new SensorComponent(-100 * (1/2), -96 * (Math.sqrt(3)/2), Math.PI * 2 / 3, ammo, laserImage2),

        new DirComponent(), new RandomComponent(), new BulletComponent(),
		new DriveComponent(), new RotateComponent(), new ShootComponent()]);
	tanks.set(ai.id, ai);
}
//Add Player to Map
//tanks.set(playerTank.id, playerTank);
var generation = 1;
console.log("CURRENT GENERATION: "+generation);

/* Document is Ready */
$(function() { 
	gameLoop(); //Start Game Loop
});

/* Lets Browser Efficiently Manage Frames */
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
	switch(view){
		case VIEWS.ARENA:
			update();
			if(ctx)
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

    /* Draw All Entities In Game*/
	ammo.forEach(function(ammo){
		ammo.render(ctx);
    });
	bullets.forEach(function (bullet) {
		bullet.render(ctx);
	});
	tanks.forEach(function(tank){
		tank.render(ctx);
    });

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
}

/* Update Local Game State */
function update() {
    ammo.forEach(function(ammo){
		ammo.update(ctx);
    });
	bullets.forEach(function(bullet){
		bullet.update(Keys);
	});
	tanks.forEach(function(tank){
		tank.update(Keys);
    });

    insertAmmoRandomly(4-ammo.size); // # of Ammo in Arena

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
    tanks = evolveUnselected(deadTanks, 0.25, 0.8); //Allow Divine Influence
    deadTanks = new Map(); // clear dead tanks
    bullets = new Map(); // clear any stray bullets
    tanks.forEach(function (tank) { //Revive the tanks
        tank.reset();
        console.log(tank.neuralNetwork.network);
    });
    generation++; //Upgrade global generation var
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