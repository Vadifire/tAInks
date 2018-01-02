/*
 * View Manager
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */
 
 /* Constants */
var VIEW_ELEMENT_ID = '#Viewport'; //the element within the DOM to append to
var VIEWS_SOURCE_DIR = '/public/views'; //directory of views source files
var STARTS_WITH_STRING = 'tAI-'; //beginning of string to match for data input

/* VIEWS 
 * 
 * src - the file name and path relative to VIEWS_SOURCE_DIR
 * cb - Callback function to be executed after we attempt to get the data from the server
 */
var VIEWS = {
	LOGIN : {src:'/login.html', cb:function(){ console.log("Successfully loaded Login!"); }},
	MAIN_MENU : {src:'/main-menu.html', cb:function(){ console.log("Successfully loaded Main Menu!"); }},
	ARENA: {src:'/arena.html', cb:function(){ 
		if (enableAudio){ arenaSoundLoop.play(); }
				gameCanvas = $("#game-layer").get(0);
				ARENA_WIDTH = gameCanvas.width;
				ARENA_HEIGHT = gameCanvas.height;
				ctx = gameCanvas.getContext('2d');
				bgCanvas = $("#bg-layer").get(0);
				bgCtx = bgCanvas.getContext('2d');
				
				/* Hook Key Presses */
				$(gameCanvas).focusout(function() {
					Keys._pressed = {}; /* clear input on loss of focus */
				}); 
				gameCanvas.addEventListener('keyup', function(event) { Keys.onKeyup(event); }, false);
				gameCanvas.addEventListener('keydown', function(event) { Keys.onKeydown(event); }, false);
				gameCanvas.addEventListener('click', clickOnCanvas, false);
				console.log("Successfully loaded Arena!"); 
			}},
	ARENA_LOBBY : {src:'/arena-lobby.html', cb:function(){}},
	TANK_GALLERY : {src:'/tank-gallery.html', cb:function(){
		
		var templateModel = $('#tank-select-wrapper-template').clone();
		
		//TO-DO populate tanks from database
		//var tanks = {id1:{name:'hAIry', score:50}, id2:{name:'clAIrance', score:80}, id3:{name:'jAInice', score:75} };
		
		//TO-DO populate tanks from database
		var tanks = [ new Tank(100, 5, 5, 2, false), new Tank(200, 5, 5, 2, false), new Tank(300, 5, 5, 2, false) ];
		
		
		//loop all tank fields and match to 'tAI_' + field_name
		$.each(tanks, function(key, tank){
			var main_selector = '#tank-select span';
			var current_tank_html = templateModel.clone(); //clone templateModel
			current_tank_html.attr('id', 'tank_'+tank.id); //re-assign a unique ID
			
			//gather an array of all id's within the template
			var IDs = current_tank_html.find('span')
             .map(function() { return this.id; }) //Project Ids
             .get();//ToArray
			 
			 //loop all IDs in the template to input data
			 for (ii = 0; ii < IDs.length; ii++) { 
				if(IDs[ii].startsWith(STARTS_WITH_STRING)){
					//found ID starting with STARTS_WITH_STRING, insert value
					eval("current_tank_html.find('#"+IDs[ii]+"').html(''+tank." + IDs[ii].replace(STARTS_WITH_STRING, '') + ")");
				}
			 }
			
			//add newly created node to the DOM
			current_tank_html.css('display', 'block'); //set display to visible
			$('#tank-select').append(current_tank_html);
		});
		
	}},
	TANK_EDIT : {src:'/tank-edit.html', cb:function(){}}
}
 
 /* Variables */
 var currentView;
 
 
/* View Manager Constructor
 *
 * @param {string?} view - View to be shown at start
 */
function ViewManager(view=VIEWS.LOGIN){
	this.currentView = view;
	this.setView(view);
}

/*
 * Set current View
 *
 * @param {string} - The path of the view
 */
ViewManager.prototype.setView = function(view=VIEWS.LOGIN){
	var view_path = VIEWS_SOURCE_DIR + view.src;
	//console.log("Changing view to " + view_path + "...");
	var vmngr = this;
	$.ajax({
	  url: view_path,
	  success: function(result){
		$( VIEW_ELEMENT_ID ).html( result );
		switch (view){
			case VIEWS.ARENA:
				break;
			default:
				arenaSoundLoop.stop();
				break;
		}
		vmngr.currentView = view;
		//console.log("Successfully changed view to " + vmngr.currentView);
	  },
	  dataType: "html",
	  error: function(textStatus){ console.log(textStatus); alert(error); },
	  complete: function(jqXHR, textStatus) { view.cb(); /* execute the views callback function */ }
	});
}

