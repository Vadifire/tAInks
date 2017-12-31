/*
 * Key Tracker
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

var Keys = {
	_pressed: {},

	UP: 87,   // W
	LEFT: 65, // A
	DOWN: 83, // S
	RIGHT: 68,// D
    SPACE: 32, // SPACE
    NEXT_GEN: 71, // G
  
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
  
    onKeydown: function (event) {
        if (event.keyCode === Keys.NEXT_GEN) { //should make sure we're on correct screen
            nextGeneration();
        } else {
            this._pressed[event.keyCode] = true;
        }
	},
  
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
}