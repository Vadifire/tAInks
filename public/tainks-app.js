/*
 * Tainks-app
 * 
 * This will manage the angular js app tAinks. 
 * It is responsible for changing the views, 
  * and being the highest-level controller for the SPA
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */
 
 /* Dependencies */
 var app = angular.module('tAInks-app', []); //main app
 
 /* Constants */
var VIEWS_SOURCE_DIR = "/public/views"; //directory of views source files
var VIEWS = {
	LOGIN : {
		src:'/login.html', 
		cb:function(){}
	},
	MAIN_MENU : {
		src:'/main-menu.html', 
		cb:function(){}
	},
	TANK_GALLERY : {
		src:'/tank-gallery.html', 
		cb:function(){}
	},
	ARENA_LOBBY : {
		src:'/arena-lobby.html', 
		cb:function(){}
	},
	ARENA: {
		src:'/arena.html', 
		cb:function(){
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
		}
	}
}

app.controller('mainCtrl', function($scope){
	$scope.view = VIEWS.LOGIN; //Current view
	
	$scope.tanks = [ new Tank(1, 5, 5, 9, false), new Tank(2, 5, 5, 2, false), new Tank(3, 5, 5, 6, false), new Tank(4, 5, 5, 4, false), new Tank(5, 5, 5, 6, false) ];
	
	
	/* @return - string - Path to current view's html */
	$scope.getView = function(){
		return VIEWS_SOURCE_DIR + $scope.view.src;
	};
	
	/* 
	 * This function is to be bound to elements within
	 * the DOM to request to change the view
	 *
	 * @return - string - Path to current view's html 
	 */
	$scope.requestView = function($requested_id, $opts){
		console.log("Requested view " + $requested_id);
		
		if($opts){
			//handle request options
		}
		
		switch($requested_id){
			case 0:
				$scope.view = VIEWS.LOGIN;
				break;
			case 1:
				$scope.view = VIEWS.MAIN_MENU;
				break;
			case 2:
				$scope.view = VIEWS.TANK_GALLERY;
				break;
			case 3:
				$scope.view = VIEWS.ARENA_LOBBY;
				break;
			case 4:
				$scope.view = VIEWS.ARENA;
				break;
			default:
				$scope.view = VIEWS.LOGIN;
				break;				
		}
	};
});