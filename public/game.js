/*
 * Client Sided Notion of a Game
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* FPS vars for performance measurement */
const TARGET_FPS = 60;
var lastTime = 0;
var fpsCount = 60;
var fps = 0;

var generation = 1;
var automaticGenSkip = 30; //seconds until skipping to next gen
var lastGenTime = 0;

/* TODO rework maps => create general entity Map */
var tanks = new Map(); //map tank ids to tanks
var deadTanks = new Map(); //graveyard of tanks (again, map tank ids to tanks)
var bullets = new Map(); //Maps bullet ids to bullet obj
var ammo = new Map(); //Maps ammo ids to ammo obj

var playerTank = new Tank(0, 100, 400, 3, true);

//Scatter AI tanks
for (var i = 0; i < 6; i++){ //6
    //var ai = new Tank(i + 1, 200 + 200 * (i % 4) + 30 * (i % 8), 160 + Math.floor(i / 4) * 220, 3, false);
    var ai = new Tank(i + 1, 10+Math.random()*980, 10+Math.random()*580, 3, false);
    ai.attachComponents([
        /*new SensorComponent(0, -4, 0, tanks, laserImage1, 256, 4),
        new SensorComponent(-4, 0, Math.PI / 12, tanks, laserImage1, 256, 4),
        new SensorComponent(4, 0, -Math.PI / 12, tanks, laserImage1, 256, 4),*/

        new SensorComponent(0, 0, 0, ammo, laserImage2, 256, 4),
        new SensorComponent(0, 0, Math.PI/12, ammo, laserImage2, 256,4 ),
		new SensorComponent(0, 0, -Math.PI/12, ammo, laserImage2, 256,4 ), //What are constants?

        new RandomComponent(), new DirComponent(),
		new DriveComponent(), new RotateCWComponent(), new RotateCCWComponent(), new ShootComponent()]);
	tanks.set(ai.id, ai);
}
//Add Player to Map
//tanks.set(playerTank.id, playerTank);

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
    update();
    if(ctx)
        render();
    requestAnimFrame(gameLoop);
}

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

    insertAmmoRandomly(7-ammo.size); // # of Ammo in Arena

    if (tanks.size <= 1 || /* one tank left -> winner decided, end game */
    	(performance.now() - automaticGenSkip*1000 > lastGenTime)){ 
        nextGeneration();
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
    tanks = evolveUnselected(deadTanks, 0.6, 0.4); //Allow Divine Influence
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
    lastGenTime = performance.now();
}