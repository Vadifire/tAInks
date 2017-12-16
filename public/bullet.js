/*
 * Client-Sided Notion of a Bullet
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* Image for Bullet*/
var bulletImage = new Image();
bulletImage.src = 'public/img/missle/21.png';
var nextBulletId = 0; //just allow natural overflow

/* Bullet Constructor
 *
 * @param {number} ownerID - unique ID of tank owner
 * @param {number} x - X pos in Arena
 * @param {number} y - Y pos in Arena
 * @param {number} speed  - px / frame to advance in dir
 * @param {number} dir - direction bullet is travelling in
 */
function Bullet(ownerID, x, y, speed, dir){
	this.id = nextBulletId++;
	this.ownerID = ownerID; //unique id TO-DO: avoid id collision
	this.x = x;
	this.y = y;
	this.speed = Math.abs(speed); //this is in terms of px * FPS for now
	this.dir = dir;
	this.width = 16;
	this.height = 16;
	bullets.set(this.id, this); /* add this to bullets map within client.js */
}

/*
 * Update method is simply calling upon the bullet to move
 * Advance the bullet in the current direction prop. to speed
 */
Bullet.prototype.update = function(){
	this.x += (this.speed*Math.cos(this.dir));
	this.y -= (this.speed*Math.sin(this.dir));

	this.hitDetect(tanks); // detect collision with 'client.js'.tanks

	/* if bullet leaves arena */
	if (this.y > ARENA_HEIGHT || this.y < 0 || this.x > ARENA_WIDTH || this.x < 0){
		bullets.delete(this.id);
	}
}

/* 
 * Draws the bullet to the given context
 * @param {Object} ctx - The context to draw to
 */
Bullet.prototype.render = function(ctx){
	ctx.save(); //save context state
	ctx.translate(this.x, this.y); //shift origin to tank
	ctx.rotate(-this.dir); //rotate plane around tank
	ctx.drawImage(bulletImage, -bulletImage.naturalWidth/2, -bulletImage.naturalHeight/2);
	ctx.restore(); //restore normal xy coordinate plane
}

/*
 * Detect hit detections with other tanks
 * @param {Object} tanks - An array of tanks to check collisions with
 */
Bullet.prototype.hitDetect = function(tanks){
	var w = (TANK_WIDTH + this.width) / 2;
	var h = (TANK_HEIGHT + this.height) / 2;
	for (var i = 0 ; i < tanks.length; i++){
		if (tanks[i].id !== this.ownerID){ //not our owner
			if (Math.abs(this.x - tanks[i].x) < w){ //within w px
				if (Math.abs(this.y - tanks[i].y) < h){ //within h px
					bullets.delete(this.id);
					break;
				}
			}
		}
	}
}
