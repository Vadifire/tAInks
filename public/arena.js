/*
 * Client Sided Notion of a Game
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* Whether the Game Loop is running */
var running = false;

/* FPS vars for performance measurement */
const TARGET_FPS = 60;
var lastTime = 0;
var fpsCount = 60;
var fps = 0;

var generation = 1;
var automaticGenSkip = 30; //seconds until skipping to next gen
var lastGenTime = 0;
var ammoAmount = 7;

/* TODO rework maps => create general entity Map */
var tanks = new Map(); //map tank ids to tanks
var deadTanks = new Map(); //graveyard of tanks (again, map tank ids to tanks)
var bullets = new Map(); //Maps bullet ids to bullet obj
var ammo = new Map(); //Maps ammo ids to ammo obj

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

var playerTank = new Tank(0, 100, 400, 3, true);
//tanks.set(playerTank.id, playerTank); //add player tank to map

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

function startGameLoop(){
    if (!running){
        running = true;
        gameLoop();
    }
}
function stopGameLoop(){
    running = false;
}

/*
 * Handle periodic game events
 * (i.e. game state update, canvas rendering)
 */
function gameLoop(){
    if (running){
        update();
        if(ctx)
            render();
        requestAnimFrame(gameLoop);
    }
}

/* 
 * Render all entities on the Game Canvas
 */
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

/*
 * Handle all game state updates
 * (ex: entity movement, collision detection, ammo respawn)
 */
function update() {
    ammo.forEach(function(ammo){
		ammo.update();
    });
	bullets.forEach(function(bullet){
		bullet.update();
	});
	tanks.forEach(function(tank){
		tank.update(Keys);
    });

    insertAmmoRandomly(ammoAmount-ammo.size); // # of Ammo in Arena

    if (tanks.size <= 1 || //Go to next generation when there is one tank left
    	((performance.now() - automaticGenSkip*1000) > lastGenTime)){ //or automatic gen skip
        nextGeneration();
    }
}


/* 
 * Advance to the next generation
 *
 *  1) 'Soft' kill all remaining tanks 
 *  2) Evolve Tanks
 *  3) Rest and advance to the next gen
 */
function nextGeneration() {
    //Soft Kill Tanks
    tanks.forEach(function (tank) { //soft kill remaining tanks
        deadTanks.set(tank.id, tank);
    });
    tanks = new Map(); //clear

    //Invoke Evolve Method
    tanks = evolve(deadTanks); //Allow Divine Influence

    //Reset Entities
    deadTanks = new Map(); // clear dead tanks
    bullets = new Map(); // clear any stray bullets
    tanks.forEach(function (tank) { //Revive the tanks
        tank.reset();
    });

    //Advance to the next generation
    generation++;
    lastGenTime = performance.now();
}