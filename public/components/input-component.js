/*
 * Client-Sided Notion of an Input Component
 *
 * Input Components serve as Input Nodes
 * in the Neural Network of a Tank AI
 *
 * An InputComponent is intended to be a sort of
 * abstract class, and thus should not be directly created
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* Inherits from Component */
InputComponent.prototype = Object.create(Component.prototype);

/* Input Component Constructor
 *
 * @param {number} x - The x-pos offset relative to tank x
 * @param {number} y - The y-pos offset relative to tank y
 * @param {Image} image - the image for this component (often null)
 */
function InputComponent(x, y, image){
	Component.call(this, x, y, image); //super()
}

/*
 * Inputs are sensors that read information from the game state
 * Individual Input Components MUST override the readInput() method
 *
 * @returns {number} - A value between 0 and 1, based on the input signal strength
 */
InputComponent.prototype.readInput = function(){
	throw new Error("No InputComponent implementation for readInput()");
}


/************************************************************
*                                                           *
*   Define InputComponent Implementations Below             *
*                                                           *
*************************************************************/

/* This component is for testing only - returns random number beween 0 and 1 */
function RandomComponent(x, y, image){InputComponent.call(this,x,y,image)};
RandomComponent.prototype = Object.create(InputComponent.prototype);
RandomComponent.prototype.readInput = function(){
	return Math.random();
}

/* Component that measures distance to nearest tank down a line */
function TankSensorComponent(x, y, dir) {
    var image = new Image();
    image.src = 'public/img/laser.png';
    InputComponent.call(this, x, y, image);
    this.dir = dir; // relative to tank
}
TankSensorComponent.prototype = Object.create(InputComponent.prototype);
TankSensorComponent.prototype.readInput = function () {
    var angle = this.tank.dir + this.dir;

    var line = {
        x1: this.xOffset - 64,
        y1: this.yOffset,
        x2: this.xOffset + 64,
        y2: this.yOffset,
    }
    rotateLineAroundEntity(line, this.tank);
    this.line = line;

    tanks.forEach(function (tank) { //Check for collisions with every tank
        if (tank.id !== this.tank.id){ //dont check for self-collisions
            if (doesLineIntersectEntity(line, tank)){
                console.log('i can see u...');
            }
        }
    }, this);

}