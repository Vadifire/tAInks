/*
 * Client-Sided Notion of an Output Component
 *
 * Output Components serve as Output Nodes
 * in the Neural Network of a Tank AI
 *
 * An OutputComponent is intended to be a sort of
 * abstract class, and thus should not be directly created
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* Inherits from Component */
OutputComponent.prototype = Object.create(Component.prototype);

/* Input Component Constructor
 *
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Object} image - the image for this component (often null)
 */
function OutputComponent(x, y, image){
	Component.call(this, x, y, image); //super()
}

/*
 * Outputs have defined actions based on their node value
 * For example, a Tank may choose to move foward if the 
 * output node for this component exceeds a threshold
 * 
 * @param {value} - the value of this output node
 */
OutputComponent.prototype.performAction = function(value){
	throw new Error("No OutputComponent implementation for performAction()");
}


/************************************************************
*                                                           *
*   Define OutputComponent Implementations Below            *
*                                                           *
*************************************************************/

/* Component that determines if Tank will move foward, backwards, or still */
function DriveComponent(x, y, image){OutputComponent.call(this,x,y,image)};
DriveComponent.prototype = Object.create(OutputComponent.prototype);
DriveComponent.prototype.performAction = function (value){
	if (value < 0.4){ 
		this.tank.move(); // bottom third, move fowards
	}else if (value > 0.6){
		this.tank.move(true); // top third, move backwards
	}
}

/* Component that determines if Tank will rotate CCW, CW, or not at all */
function RotateComponent(x, y, image){OutputComponent.call(this,x,y,image)};
RotateComponent.prototype = Object.create(OutputComponent.prototype);
RotateComponent.prototype.performAction = function (value){
	if (value < 0.4){ 
		this.tank.rotate(); // bottom third, move CCW
	}else if (value > 0.6){
		this.tank.rotate(true); // top third, move CW
	}
}

