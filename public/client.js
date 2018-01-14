/*
 * Client Sided Javascript
 *
 * Title: tAInks
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/* ARCHITECTURE LEVEL VARS */
var socket = io(); //Client socket for server communication
var trainingSettings = new TrainingSettings();
var gameCanvas; //top, dynamic canvas layer
var bgCanvas; // background, static canvas layer
var ctx; //ctx for gameCanvas
var bgCtx; //ctx for bgCanvas
var currentPage; //Page (div) currently being viewed
var enableAudio = false; //Whether or not we should play Audio
var arenaSoundLoop = new Howl({src: ['public/assets/audio/arena-loop.mp3'], loop:true, volume: 0.2});
var view = VIEWS.LOGIN; //Current view
var ARENA_WIDTH;
var ARENA_HEIGHT;

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
			startGameLoop();
			console.log("Successfully loaded Arena!"); 
		}
	}
}