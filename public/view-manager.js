/*
 * View Manager
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */
 
 /* Constants */
var VIEW_ELEMENT_ID = '#Viewport'; //the element within the DOM to append to
var VIEWS_SOURCE_DIR = '/public/views' //directory of views source files
var VIEWS = {
	LOGIN : '/login.html',
	MAIN_MENU : '/main-menu.html',
	ARENA: '/arena.html',
	ARENA_LOBBY : '/arena-lobby.html',
	TANK_GALLERY : '/tank-gallery.html',
	TANK_EDIT : '/tank-edit.html'
}
 
 /* Variables */
 var currentView;
 
 
/* View Manager Constructor
 *
 * @param {string?} view - View to be shown at start
 */
function ViewManager(view=VIEWS.LOGIN){
	this.currentView = VIEWS.LOGIN;
	this.setView(view);
}

/*
 * Set current View
 *
 * @param {string} - The path of the view
 */
ViewManager.prototype.setView = function(view=VIEWS.LOGIN){
	var view_path = VIEWS_SOURCE_DIR + view;
	console.log("Changing view to " + view_path + "...");
	var vmngr = this;
	$.ajax({
	  url: view_path,
	  success: function(result){
		$( VIEW_ELEMENT_ID ).html( result );
		if(view === VIEWS.ARENA){
			console.log(vmngr);
			gameCanvas = $("#game-layer").get(0);
			ARENA_WIDTH = gameCanvas.width;
			ARENA_HEIGHT = gameCanvas.height;
			ctx = gameCanvas.getContext('2d');
			ctx.font = '24px serif';
			ctx.textBaseline="bottom";
			ctx.textAlign="center";
			bgCanvas = $("#bg-layer").get(0);
			bgCtx = bgCanvas.getContext('2d');
			
			/* Hook Key Presses */
			gameCanvas.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
			gameCanvas.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);
		}
		vmngr.currentView = view;
		console.log("Successfully changed view to " + vmngr.currentView);
	  },
	  dataType: "html",
	  error: function(textStatus){ console.log(textStatus); }
	});
	
}

