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
    var maxDist = Math.max(TANK_HEIGHT, TANK_HEIGHT);
    var minDist = maxDist; //Used to only select the closest tank
    var selected;

    //TODO: rework with collision code
    tanks.forEach(function (tank) {
        var dist = Math.hypot(x - tank.x, y - tank.y);
        if (dist < minDist) {
            minDist = dist;
            selected = tank;
        }
    });

    if (selected) { //If something was selected, select it.
        selected.selected = !selected.selected;
    }
}