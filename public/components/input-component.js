/*
 * Client-Sided Notion of an Input Component
 *
 * Input Components serve as Input Nodes
 * in the Neural Network of a Tank AI
 *
 * An InputComponent is intended to be a sort of
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
InputComponent.prototype = Object.create(Component.prototype);

/* Input Component Constructor
 *
 * @param {Object} tank - the tank comp is attached to
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Object} image - the image for this component (often null)
 * @param {Object} node - the Input Node attached to this component
 */
function InputComponent(tank, x, y, image, node){
	Component.call(this, tank, x, y, image); //super()
	this.node = node;
}

/*
 * Inputs are sensors that read information from the game state
 * Individual Input Components MUST override the readInput() method
 * @returns {number} - A value between 0 and 1, based on the input signal strength
 */
function readInput(){
	throw new Error("No InputComponent implementation for readInput()");
}