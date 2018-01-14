/*
 * Client-Sided Notion of a Tank
 *
 * Tanks can be controlled by Players, or by
 * a neural-network based AI
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* Image for all tanks */
var tankImage = [];

/* populate tank image with animation frames */
for (var i = 1; i < 9; i++){ 
	var image = new Image();
	image.src = 'public/assets/img/tank/'+ (i) + '.png';
	tankImage.push(image);
}

var TANK_WIDTH = 68, TANK_HEIGHT = 68;
var SHOOT_CD = 200; //shoot cd in millis
var TANK_HEALTH = 80;
var TANK_BULLETS = 42;

/* Tank Constructor
 *
 * @param {number} id - unique ID
 * @param {number} x - X pos in Arena
 * @param {number} y - Y pos in Arena
 * @param {number} speed  - px / frame to advance in dir
 * @param {boolean} control - whether our client control's the tank
 *
 * TO-DO: overload to only expose relevant variables.
 */
function Tank(id, x, y, speed, control){
	this.id = id; //unique id TO-DO: avoid id collision
	this.health = TANK_HEALTH;
	this.control = control;
	this.components = []; //no components by default
	this.width = TANK_WIDTH;
    this.height = TANK_HEIGHT;
    this.originalX = x; //Used for reset
    this.originalY = y; //Used for reset
	this.x = x;
	this.y = y;
	this.dir = Math.PI / 2;
	this.speed = speed; //this is in terms of px * FPS for now
	this.angularSpeed = 0.04; //this is in terms of rad * FPS for now
	this.rotate(0); // This is done to initialize x and y comps
	this.frame = 0; //current animation frame
	this.lastShoot =  0;
    this.damageDone = 0;
	this.bullets = TANK_BULLETS; //max capacity
	this.selected = false; // (controls hitbox rendering and selection)
	if (control)
		this.name = 'Player ' + id; //assume we're a player
	else{
		this.name = 'AI ' + id; // if we don't control, assume AI for now
	}
	setLinesForEntity(this);
}

/*
 * Reset the tanks, typically post-mortem
 */
Tank.prototype.reset = function() {
    this.lastShoot = 0;
    this.damageDone = 0;
    this.health = TANK_HEALTH;
	this.dir = Math.PI / 2;
	this.rotate(0);
    this.xComp = (Math.cos(this.dir));
    this.yComp = (-Math.sin(this.dir)); //y plane inverted
    this.frame = 0;
    this.bullets = TANK_BULLETS;
    /*  Position reset should be rethought. With current
        genetic algorithm implementation, it would make more sense
        to come up with a list of valid positions and reset tank
        positions to a random valid location (prevent positional bias) */
    /*this.x = this.originalX;
    this.y = this.originalY; */
    this.x = Math.random() * ARENA_WIDTH;
    this.y = Math.random() * ARENA_HEIGHT;
}

/*
 * Attach a list of Components to the Tank
 * @param {Array} components - Array of components attached to this tank
 */
Tank.prototype.attachComponents = function(components){
	this.components = components;

	this.components.forEach(function(comp){
		comp.setOwner(this);
	}, this);

	/* If we don't control, assuming AI. Create Neural Network */
	if (!this.control){
		this.neuralNetwork = new NeuralNetwork(this);
	}
}

/* 
 * @param {number} damage - the damage to inflict to this tank
 */
Tank.prototype.takeDamage = function(damage){
	this.health -= damage;
	if (this.health <= 0){ //die
        deadTanks.set(this.id, this); /* add us to global list of dead tanks */
        tanks.delete(this.id);
	}
}

/* 
 * @param {Ammo} damage - the Ammo object to pickup
 */
Tank.prototype.pickupAmmo = function(ammo){
	this.bullets = Math.min(this.bullets+ammo.bullets, TANK_BULLETS);
}

/*
 * Calculate the fitness of this tank
 * Used to evolve Neural Network
 * @returns {number} - The fitness of the tank
 */
Tank.prototype.calculateFitness = function(){
    return this.damageDone; //Fitness is health left + total dmg done
}

/*
 * Advance the tank in the current direction prop. to speed
 * @param {boolean} backwards - whether tank is backing up
 */
Tank.prototype.move = function(backwards){
	/* advance animation frame every 10 game frames only */
	var animationSpeed = .25;
	if(backwards){ //backwards anim
		this.frame += animationSpeed; 
		if (this.frame > tankImage.length-1){ 
			this.frame = 0;
		}
	}else{
		this.frame -= animationSpeed;
		if (this.frame < 0){ //backwards animation
			this.frame = tankImage.length-1;
		}
	}

	this.x += this.speed*this.xComp * (backwards ? -1 : 1);
	this.y += this.speed*this.yComp * (backwards ? -1 : 1);

	/* Lock tank within Arena */
	if (this.y > ARENA_HEIGHT){
		this.y = ARENA_HEIGHT;
	} else if (this.y < 0){
		 this.y = 0;
	}
	if (this.x > ARENA_WIDTH){
		this.x = ARENA_WIDTH;
	} else if (this.x < 0){
		this.x = 0;
	}
	this.preventCollisions(tanks);
}

/* 
 * Rotates the tank's direction (CCW by default)
 * @param {boolean} cw - Whether the rotation should be CW
 */
Tank.prototype.rotate = function(cw){
	if (cw){
		this.dir -= this.angularSpeed;
	}else{
		this.dir += this.angularSpeed;
	}
	this.dir %=  (2*Math.PI);
	if (this.dir < 0){
		this.dir+=2*Math.PI;
	}

	this.xComp = (Math.cos(this.dir));
	this.yComp = (-Math.sin(this.dir)); //y plane inverted

}

/*
 * Detect collisions with other tanks and snap them back
 * @param {Array} tanks - An array of tanks to check collisions with
 */
Tank.prototype.preventCollisions = function(tanks){
	tanks.forEach(function(tank){
		if (tank.id !== this.id){ //not our owner
			var xDist = Math.abs(this.x - tank.x);
			if (xDist < TANK_WIDTH){
				var yDist = Math.abs(this.y - tank.y);
				if (yDist < TANK_HEIGHT){ 
					if (xDist > yDist){
						if (this.x < tank.x){
							this.x -= (TANK_WIDTH - xDist);
						} else {
							this.x += (TANK_WIDTH - xDist);
						} 
					} else {
						if (this.y < tank.y){
							this.y -= (TANK_HEIGHT - yDist);
						} else {
							this.y += (TANK_HEIGHT - yDist);
						} 
					}

				}
			}
		}
	}, this);
}

/* 
 * Shoots a bullet from the tank's origin in dir
 */
Tank.prototype.shoot = function () {
    if (this.bullets > 0){
        var now = performance.now();
        if ((now - this.lastShoot) >= SHOOT_CD) {
            this.bullets--;
            this.lastShoot = now;
            new Bullet(this.id, this.x, this.y, 12, this.dir);
        }
	}
}


/* 
 * Updates the state of the Tank, listening to keys
 * @param {Object} keys - A listing of which keys are pressed
 */
Tank.prototype.update = function (Keys) {
	if (this.control){ // Client's keyboard controls tank
		if (Keys.isDown(Keys.LEFT)){
			this.rotate();
		}
		if (Keys.isDown(Keys.RIGHT)){
			this.rotate(true);
		}
		if (Keys.isDown(Keys.UP)){
			this.move();
		}
		if (Keys.isDown(Keys.DOWN)){
			this.move(true);
		}
		if (Keys.isDown(Keys.SPACE)){
			this.shoot();
		}
	}else if (this.neuralNetwork){ // AI powered by Neural Network
		this.neuralNetwork.act();
    }
    setLinesForEntity(this);
}

/* 
 * Draws the Tank to the given context
 * @param {CanvasRenderingContext2D} ctx - The context to draw to
 */
Tank.prototype.render = function(ctx){
	ctx.save(); //save context state
	var img = tankImage[Math.floor(this.frame)]; // img of current frame
    ctx.translate(this.x, this.y); //shift origin to tank
    this.drawHealth(ctx);
	ctx.rotate(-this.dir); //rotate plane around tank
	ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
	this.components.forEach(function(comp){
		comp.render(ctx); //draw all components
	});
    ctx.restore(); //restore normal xy coordinate plane
    ctx.fillText(this.name, this.x, this.y - img.naturalHeight / 2 - 16);
	if (this.selected){
		this.drawHitbox(ctx);
		if (this.neuralNetwork) { //TODO: toggle neural network rendering (?)
			this.neuralNetwork.render(ctx); // Draw Neural Network to Screen for Debug
		}
	}

}

/* 
 * Draws the Tank's healthbar
 * @param {CanvasRenderingContext2D} ctx - The context to draw to
 */
Tank.prototype.drawHealth = function(ctx){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.rect(-20,-54,40,6);
	ctx.lineWidth="4";
	ctx.stroke();

	var hp = 40*(this.health/TANK_HEALTH);

	ctx.beginPath();
	ctx.fillStyle = "green";
	ctx.rect(-20,-54,hp ,6);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = "red";
	ctx.rect(-20+hp,-54, 40-hp,6);
	ctx.fill();
}

/* 
 * Draws the Tank's hitbox
 * @param {CanvasRenderingContext2D} ctx - The context to draw to
 */
Tank.prototype.drawHitbox = function (ctx) {
    ctx.strokeStyle = "#0033FF";
    ctx.lineWidth = "4";
	if (this.lines){
        for (var i = 0; i < this.lines.length; i++){
			ctx.beginPath();
			ctx.moveTo(this.lines[i].x1, this.lines[i].y1);
			ctx.lineTo(this.lines[i].x2, this.lines[i].y2);
			ctx.stroke();
		}
    }
    //Draw lines for components too
    this.components.forEach(function (comp) {
        if (comp.line) {
            ctx.beginPath();
            ctx.moveTo(comp.line.x1, comp.line.y1);
            ctx.lineTo(comp.line.x2, comp.line.y2);
            ctx.stroke();
        }
    });
}