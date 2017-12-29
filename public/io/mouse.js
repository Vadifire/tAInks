/*
 * Mouse Events Handler
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

function clickOnCanvas(event){

    var rect = gameCanvas.getBoundingClientRect();

    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log(x+", "+y);
    var maxDist = Math.max(TANK_HEIGHT, TANK_HEIGHT) * .7;

    //TODO: rework with collision code
    tanks.forEach(function(tank){
        if ((Math.hypot(x-tank.x, y-tank.y)) < maxDist){
            tank.selected = !tank.selected;
        }
    });
}