/*
 * Client Sided Entry Point
 *
 * Title: tAInks
 *
 * Authors:
 *   @author Cedric Debelle
 *	 @author Calvin Ellis
 */

var socket = io(); //Client socket for server communication

//Respond to welcome message
socket.on("welcome", function(){
	$("<h2><center>Welcome to tAInks!</center></h2>").appendTo(document.body);
});