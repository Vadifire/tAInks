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

/* This component is mainly for testing - returns random number beween 0 and 1 */
function RandomComponent(x, y, image){InputComponent.call(this,x,y,image)};
RandomComponent.prototype = Object.create(InputComponent.prototype);
RandomComponent.prototype.readInput = function(){
	return Math.random();
}

/* Component that reprsents tank direction */
function DirComponent(x, y, image){InputComponent.call(this,x,y,image)};
DirComponent.prototype = Object.create(InputComponent.prototype);
DirComponent.prototype.readInput = function(){
	return (this.tank.dir)/(2*Math.PI);
}

/* Component that reprsents tank direction */
function xComponent(x, y, image){InputComponent.call(this,x,y,image)};
xComponent.prototype = Object.create(InputComponent.prototype);
xComponent.prototype.readInput = function(){
	return (this.tank.x / ARENA_WIDTH);
}

/* Component that reprsents tank direction */
function yComponent(x, y, image){InputComponent.call(this,x,y,image)};
yComponent.prototype = Object.create(InputComponent.prototype);
yComponent.prototype.readInput = function(){
	return (this.tank.y / ARENA_HEIGHT);
}

/* Component that reprsents tank bullet count */
function BulletComponent(x, y, image){InputComponent.call(this,x,y,image)};
BulletComponent.prototype = Object.create(InputComponent.prototype);
BulletComponent.prototype.readInput = function(){
	return (this.tank.bullets / TANK_BULLETS);
}

/* LASER IMAGES */
var laserImage1 = new Image();
laserImage1.src = 'public/assets/img/laser1.png';
var laserImage2 = new Image();
laserImage2.src = 'public/assets/img/laser2.png';

/* Component that measures distance to nearest tank down a line */
function SensorComponent(x, y, dir, map, image, width, height) {
    //Populate width and height from image if needed

    //The problem is sometimes images don't finish loading...
    if (!width) {
        this.width = image.naturalWidth;
    } else {
        this.width = width;
    }
    if (!height) {
        this.height = image.naturalHeight;
    } else {
        this.height = height;
    }

    /* Instead of taking the normal coords where x,y denotes where to put
    the center of the component relative to the center of the tank, we
    want to think in terms of where to put the base of the laser sensor
    relative to the tank */
    this.xComp = Math.sin(dir) * (this.width + TANK_WIDTH) / 2;
    this.yComp = Math.cos(dir) * (this.width + TANK_WIDTH) / 2;

    x -= this.xComp;
    y -= this.yComp;

    InputComponent.call(this, x, y, image);
    this.dir = dir; // relative to tank
    this.entityMap = map;
}
SensorComponent.prototype = Object.create(InputComponent.prototype);
SensorComponent.prototype.readInput = function () {
    var angle = this.dir;
    var line = {
        x1: this.xOffset + (this.width) / 2,
        y1: this.yOffset - this.width/2 * Math.sin(angle),
        x2: this.xOffset - (this.width) / 2,
        y2: this.yOffset + this.width/2 * Math.sin(angle),
    } 
    rotateLineAroundEntity(line, this.tank);
    this.line = line;
    var ret = 0;
    this.entityMap.forEach(function (e) { //Check for collisions with every ammo pack
        if (e.lines && doesLineIntersectEntity(line, e)) {
            if (e instanceof Tank){
                if ((this.tank.id !== e.id) && e.health > 0){
                    ret = 1; return;
                }
            }
            else{
                ret = 1; return;
            }
        }
    }, this);
    return ret;
}