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
 * @param {Object} tank - the tank comp is attached to
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Object} image - the image for this component (often null)
 */
function Component(tank, x, y, image){
	this.tank = tank; //this.tank = our owner
	this.xOffset = -y; //due to rotation
	this.yOffset = x;
	this.image = image;
}

/*
 * If our component has an image, render it as an
 * attachment to the tank owner
 * @param {Object} ctx - The context to draw to
 */
Component.prototype.render = function(ctx){
	if (this.image){
		ctx.drawImage(image, this.xOffset-this.image.naturalWidth/2, 
			this.yOffset-this.image.naturalHeight/2);
	}
}