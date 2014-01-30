/**
*   Webarena - A web application for responsive graphical knowledge work
*
*   @author Felix Winkelnkemper, University of Paderborn, 2012
*    
*   @class Dispatcher
*   @classdesc The dispatcher is the connection between requests sent to the server by websocket
*	and the functions that are called inside the server. Server Modules register functions
*	on the dispatcher, that react on certain calls by the client. The websocket server
*	calls the call-function of the dispatcher in case of an incoming communication.
*
*/

"use strict";

var Dispatcher = {};
var Modules = false; 
var calls = {};

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
Dispatcher.init = function(theModules) {
	Modules = theModules;
}

/**
* The SocketServer (websocket) server calls the call-function of the dispatcher in case of an incoming communication.
*
* @param {Object} socket the socket of the client.
* @param {Object} message the received message.
*/
Dispatcher.call = function(socket, message) {
	var SocketServer = Modules.SocketServer;
	var type = message.type;
	var responseID = message.responseID;
	var data = message.data;

	if (calls[type]) {
		process.nextTick(function() { 

			var response = calls[type](socket, data, responseID); 		//TODO: this is still blocking, swtich to callbacks if necessary

			//TODO: Fire an event
			/**
			*	Clients can provide a unique responseID when calling a function on the server. If the
			*	function called has a result other than undefined and a responseID is given, the response
			*	is sent back to the client (including the responseID)
			*/
			if (responseID !== undefined && response !== undefined) Modules.Dispatcher.respond(socket, responseID, response);
				
		});
	} else {
		console.log('ERROR: No function for ' + type);
		SocketServer.sendToSocket(socket, 'error', 'ERROR: No function for ' + type);
	}
}

/**
 * Response to a client.
 * 
 * @param {Object} socket the socket of the client.
 * @param {Object} responseID the Id of the response.
 * @param {Object} response the response.
 */
Dispatcher.respond = function(socket, responseID, response) {
	Modules.SocketServer.respondToSocket(socket, responseID, response);
}

/**
 * Register a function for an incoming call type.
 * 
 * @param {Object} type The incoming call type.
 * @param {Function} callFunction the callback function.
 */
Dispatcher.registerCall = function(type, callFunction) {
	if (!callFunction) return;
	calls[type] = callFunction;
}

/**
 * Manages 'deleteObject' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('deleteObject', function(socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectManager.deleteObject(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'createObject' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('createObject', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectController.createObject(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'roomlist' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('roomlist' , function(socket, data, responseID) {
	Modules.RoomController.listRooms(resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'getPreviewableMimeTypes' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('getPreviewableMimeTypes', function (socket, data, responseID) {
	Dispatcher.respond(socket, responseID, Modules.Connector.getInlinePreviewMimeTypes());
});

/**
 * Manages 'memoryUsage' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('memoryUsage', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ServerController.getMemoryUsage(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'inform' messages. Information are sent to all clients in the same room
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('inform', function (socket, data, responseID) {
	Modules.RoomController.informAllInRoom(data, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'bugreport' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('bugreport', function (socket, data, responseID) {
	Modules.ServerController.bugreport(data, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'undo' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('undo', function(socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
    Modules.ObjectManager.undo(data, context, infoCallbackWrapper(socket));
});

/**
 * Manages 'duplicateObjects' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('duplicateObjects', function(socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectManager.duplicateNew(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Manages 'serverCall' messages.
 * 
 * @param {socket} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID The incoming call type.
 */
Dispatcher.registerCall('serverCall', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectController.executeServersideAction(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Creates a callback function that sends the result as an info message to the client.
 *
 * @param  {Object} socket the socket of the client
 * @returns {Function} a callback function that sends the result as an info message to the client
 */
function infoCallbackWrapper(socket) {
	return function(err, message) {
		if (err) Modules.SocketServer.sendToSocket(socket, 'error', err.message);
		else Modules.SocketServer.sendToSocket(socket, 'infotext', message);
	};
}

/**
 * Creates a callback function that sends the result message to the client.
 *
 * @param {Object} socket the socket of the client
 * @param {} responseID the response ID
 * @returns {Function} a function that sends the result message to the client
 */
function resultCallbackWrapper(socket, responseID) {
	return function(err, data) {
		if (err) {
			Modules.SocketServer.sendToSocket(socket, 'error', err.message);
		} else {
			Modules.Dispatcher.respond(socket, responseID, data);
		}
	}
}

module.exports = Dispatcher;
