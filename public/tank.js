/*
 * Client-Sided Notion of a Tank
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

/* Tank Constructor
 *
 * @param {string?} id - unique ID
 * @param {number} x - X pos in Arena
 * @param {number} y - Y pos in Arena
 * @param {number} speed  - px / frame to advance in dir
 * @param {boolean} control - whether our client control's the tank
 */
function Tank(id, x, y, speed, control){
	this.id = id; //unique id TO-DO: avoid id collision
	if (control)
		this.name = 'Player ' + id; //assume we're a player
	else{
		this.name = 'AI ' + id; //assume we're a player
	}
	this.x = x;
	this.y = y;
	this.dir = Math.PI / 2;
	this.speed = Math.abs(speed); //this is in terms of px * FPS for now
	this.angularSpeed = 0.04; //this is in terms of rad * FPS for now
	this.frame = 0; //current animation frame
	this.control = control;
}

/*
 * Advance the tank in the current direction prop. to speed
 * @param {boolean} backwards - whether tank is backing up
 */
Tank.prototype.move = function(backwards){
	this.frame += .25; /* advance animation frame every 10 game frames only */
	if (this.frame > tankImage.length-1){
		this.frame = 0;
	}
	this.x += (this.speed*Math.cos(this.dir) * ((backwards) ? -1 : 1));
	this.y -= (this.speed*Math.sin(this.dir) * ((backwards) ? -1 : 1));
}

/* 
 * Rotates the tank's direction (CCW by default)
 * @param {boolean} cw - Whether the rotation should be CW
 */
Tank.prototype.rotate = function(cw){
	console.log(this.dir);
	if (cw)
		this.dir -= this.angularSpeed;
	else
		this.dir += this.angularSpeed;
	if (this.dir > Math.PI * 2){
		this.dir -= Math.PI * 2;	
	}else if (this.dir < 0){
		this.dir += Math.PI * 2;
	}
}


/* 
 * Updates the state of the Tank, listening to keys
 * @param {Object} keys - A listing of which keys are pressed
 */
Tank.prototype.update = function(Keys){
	if (this.control){ //if our client controls the tank
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
	}
}

/* 
 * Draws the Tank to the given context
 * @param {Object} ctx - The context to draw to
 */
Tank.prototype.render = function(ctx){
	ctx.save(); //save context state
	ctx.translate(this.x, this.y);
	ctx.rotate(-this.dir); //rotate context plane
	ctx.drawImage(tankImage[Math.floor(this.frame)], -SPRITE_WIDTH/2, -SPRITE_HEIGHT/2);
	ctx.restore(); //restore normal xy coordinate plane
	ctx.fillText(this.name, this.x, this.y-SPRITE_HEIGHT/2);
}