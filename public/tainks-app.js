/*
 * Tainks-app
 * 
 * This will manage the angular js app tAinks. 
 * It is responsible for being the highest-level controller for display
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */
 
 /* Dependencies */
 var app = angular.module('tAInks-app', []); //main app
 
 /* Constants */
var VIEWS_SOURCE_DIR = "/public/views"; //directory of views source files

app.controller('mainCtrl', function($scope){
	$scope.player_tanks = [ new Tank(1, 5, 5, 9, false), new Tank(2, 5, 5, 2, false), new Tank(3, 5, 5, 6, false), 
		new Tank(4, 5, 5, 4, false), new Tank(5, 5, 5, 6, false) ];
	
	$scope.game_tanks = tanks;
	$scope.game_generation = generation;
	/* @return - string - Path to current view's html */
	$scope.getView = function(){
		return VIEWS_SOURCE_DIR + view.src;
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
		
		//set view based on requested id
		switch($requested_id){
			case 0:
				view = VIEWS.LOGIN;
				break;
			case 1:
				view = VIEWS.MAIN_MENU;
				break;
			case 2:
				view = VIEWS.TANK_GALLERY;
				break;
			case 3:
				view = VIEWS.ARENA_LOBBY;
				break;
			case 4:
				view = VIEWS.ARENA;
				setTimeout(function(){
					if(document.getElementById('arena')){
						view.cb();
						clearInterval(this);
					}
				}, 100);
				break;
			default:
				view = VIEWS.LOGIN;
				break;				
		}
		
		
	};
	
});