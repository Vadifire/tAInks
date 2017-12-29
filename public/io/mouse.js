/*
 * Mouse Events Handler
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

function clickOnCanvas(event){

    var y = event.clientY-92; //Not sure why this is needed, likely from HTML/css
    var x = event.clientX;
    var maxDist = Math.max(TANK_HEIGHT, TANK_HEIGHT) * .7;

    //TODO: rework with collision code
    tanks.forEach(function(tank){
        if ((Math.hypot(x-tank.x, y-tank.y)) < maxDist){
            tank.selected = !tank.selected;
        }
    });
}