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
	image.src = 'public/img/tank/'+ (i) + '.png';
	tankImage.push(image);
}

var TANK_WIDTH = 64, TANK_HEIGHT = 64;

/* Tank Constructor
 *
 * @param {number} id - unique ID
 * @param {number} x - X pos in Arena
 * @param {number} y - Y pos in Arena
 * @param {number} speed  - px / frame to advance in dir
 * @param {boolean} control - whether our client control's the tank
 */
function Tank(id, x, y, speed, control){
	this.id = id; //unique id TO-DO: avoid id collision
	this.health = 100;
	this.control = control;
	this.components = []; //no components by default
	this.width = TANK_WIDTH;
	this.height = TANK_HEIGHT;
	this.x = x;
	this.y = y;
	this.dir = Math.PI / 2;
	this.speed = speed; //this is in terms of px * FPS for now
	this.angularSpeed = 0.04; //this is in terms of rad * FPS for now
	this.frame = 0; //current animation frame
	if (control)
		this.name = 'Player ' + id; //assume we're a player
	else{
		this.name = 'AI ' + id; // if we don't control, assume AI for now
	}
}

/*
 * Attach a list of Components to the Tank
 * @param {object} components - Array of components attached to this tank
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
Tank.prototype.dealDamage = function(damage){
	this.health -= damage;
	if (this.health <= 0){ //die
		tanks.delete(this.id);
		if (tanks.size == 1){ //only one tank left - they win!
			//process winning here
		}
	}
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
	this.x += (this.speed*Math.cos(this.dir) * ((backwards) ? -1 : 1));
	this.y -= (this.speed*Math.sin(this.dir) * ((backwards) ? -1 : 1));

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
	if (this.dir > Math.PI * 2){
		this.dir -= Math.PI * 2;	
	}else if (this.dir < 0){
		this.dir += Math.PI * 2;
	}
}


/* 
 * Shoots a bullet from the tank's origin in dir
 */
Tank.prototype.shoot = function(){
	new Bullet(this.id, this.x, this.y, 5, this.dir);
}


/* 
 * Updates the state of the Tank, listening to keys
 * @param {Object} keys - A listing of which keys are pressed
 */
Tank.prototype.update = function(Keys){
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
	}else if (this.neuralNetwork){ // AI powered by Neural Network
		this.neuralNetwork.act();
	}
}

/* 
 * Draws the Tank to the given context
 * @param {Object} ctx - The context to draw to
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
	ctx.fillText(this.name, this.x, this.y-img.naturalHeight/2-16);
}

/* 
 * Draws the Tank's healthbar
 * @param {Object} ctx - The context to draw to
 */
Tank.prototype.drawHealth = function(ctx){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.rect(-20,-54,40,6);
	ctx.lineWidth="4";
	ctx.stroke();

	var hp = 40*(this.health/100);

	ctx.beginPath();
	ctx.fillStyle = "green";
	ctx.rect(-20,-54,hp ,6);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = "red";
	ctx.rect(-20+hp,-54, 40-hp,6);
	ctx.fill();
}
