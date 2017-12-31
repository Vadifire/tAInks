/*
 * An entity that can be picked up to 
 * restore a tank's ammunition
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

 /* Image for Ammo Pack */
var ammoImage = new Image();
ammoImage.src = 'public/img/missle/ammo-pack.png';
var nextAmmoId = 0; //just allow natural overflow



/* Ammo Constructor
 *
 * @param {number} x - X pos in Arena
 * @param {number} y - Y pos in Arena
 */
function Ammo(x, y){
	this.id = nextAmmoId++;
	this.x = x;
	this.y = y;
	this.dir = 0;
	this.xComp = 1;
	this.yComp = 0;
	this.width = ammoImage.naturalWidth;
	this.height = ammoImage.naturalHeight;
    this.bullets = 16;
    setLinesForEntity(this);
	ammo.set(this.id, this); /* add this to bullets map within client.js */
}

/*
 * Only need to check for collisions
 */
Ammo.prototype.update = function(){
	this.hitDetect(tanks); // detect collision with 'client.js'.tanks
}

/* 
 * Draws the ammo to the given context
 * @param {CanvasRenderingContext2D} ctx - The context to draw to
 */
Ammo.prototype.render = function(ctx){
	ctx.drawImage(ammoImage, this.x-ammoImage.naturalWidth/2, this.y-ammoImage.naturalHeight/2);
}

/*
 * Inserts ammo randomly onto the arena
 * 
 * @param {number} count - the # of ammo to insert
 */
insertAmmoRandomly = function(count){
	for (var i = 0; i < count; i++){
		var a = new Ammo(Math.random()*ARENA_WIDTH, Math.random()*ARENA_HEIGHT);
		ammo.set(a.id, a);
	}
}

/*
 * Detect collisions with tanks
 * @param {Array} tanks - An array of tanks to check collisions with
 */
Ammo.prototype.hitDetect = function(tanks){
	tanks.forEach(function(tank){
		if (doesEntityIntersectEntity(this, tank)) {
			tank.pickupAmmo(this);
			ammo.delete(this.id);
			insertAmmoRandomly(); //concurrent modification bug?
			return;
		}
	}, this);
}
