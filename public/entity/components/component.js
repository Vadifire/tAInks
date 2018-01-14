/*
 * Client-Sided Notion of a Component
 * Components are attached to Tanks
 * They may serve as I/O for AI
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* Component Constructor
 *
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Image} image - the image for this component (often null)
 */
function Component(x, y, image){
	this.xOffset = -y; //due to rotation
	this.yOffset = x;
	this.image = image;
}

/*
 * Attach this component to a tank
 * @param {Tank} tank - The owner for this component
 */
Component.prototype.setOwner = function(tank){
	this.tank = tank;
}

/*
 * If our component has an image, render it as an
 * attachment to the tank owner
 * @param {CanvasRenderingContext2D } ctx - The context to draw to
 */
Component.prototype.render = function(ctx){
	if (this.image){
		ctx.save(); //save context state
		ctx.translate(this.xOffset, this.yOffset); //shift origin to tank
		if (this.dir)
			ctx.rotate(-this.dir); //rotate plane around tank
		ctx.drawImage(this.image, -this.image.naturalWidth/2, -this.image.naturalHeight/2);
		ctx.restore(); //pop saved context off stack
	}
}