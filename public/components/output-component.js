/*
 * Client-Sided Notion of an Output Component
 *
 * Output Components serve as Output Nodes
 * in the Neural Network of a Tank AI
 *
 * An OutputComponent is intended to be a sort of
 * abstract class, and thus should not be directly created
 *
 * NOTE: There is a strong possibility that this 
 * class is reworked / removed as the Neural Network
 * system is built.
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/* Inherits from Component */
OutputComponent.prototype = Object.create(Component.prototype);

/* Input Component Constructor
 *
 * @param {Object} tank - the tank comp is attached to
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Object} image - the image for this component (often null)
 * @param {Object} node - the Output Node attached to this component
 */
function OutputComponent(tank, x, y, image, node){
	Component.call(this, tank, x, y, image); //super()
	this.node = node;
}

/*
 * Outputs have defined actions based on their node value
 * For example, a Tank may choose to move foward if the 
 * output node for this component exceeds a threshold
 */
function performAction(){
	throw new Error("No OutputComponent implementation for performAction()");
}