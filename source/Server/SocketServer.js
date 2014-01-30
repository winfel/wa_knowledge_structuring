/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 * @class SocketServer
 * @classdesc Sends messages to socket clients.
 * 
 * @requires node-uuid
 * @requires socket.io
 */

"use strict";
var SocketServer = {};

var Modules = false;
var uuid = require('node-uuid');

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
SocketServer.init = function(theModules) {
	Modules = theModules;
	var Dispatcher = Modules.Dispatcher;
	var UserManager = Modules.UserManager;
	var io = require('socket.io').listen(Modules.WebServer.server);
	
	io.set('log level', 1);

	io.sockets.on('connection', function(socket) {
		UserManager.socketConnect(socket);
		SocketServer.sendToSocket(socket, 'welcome', 0.5);
		
		socket.on('message', function(data) {
			Dispatcher.call(socket, data);
		});
		socket.on('disconnect', function() {
			UserManager.socketDisconnect(socket);
		});

	});
}

/**
 * Send request to client, add one time response listener.
 * 
 * @param {Object} socket the socket of the client
 * @param {String} name response's name
 * @param {Object} data data to be sent to the client
 * @param {Function} callback callback function
 */
SocketServer.askSocket = function(socket, name, data, callback) {
	var requestID = uuid.v4();
	data.responseID = requestID;
	
	socket.once('response::' + name + '::' + requestID, function(responseData) {
		callback(responseData);
	});

	this.sendToSocket(socket, name, data);
}


/**
 * Sends a message to a client socket.
 * 
 * @param {Object} socket the socket of the client
 * @param {String} name response's name
 * @param {Object} data data to be sent to the client
 */
SocketServer.sendToSocket = function(socket, name, data) {
	socket.emit('message', {
							type : 'call',
							'name' : name,
							'data' : data
						});
}

/**
 * Sends a response message to a client socket.
 * 
 * @param {Object} socket the socket of the client
 * @param {String} responseID the Id of the response
 * @param {Object} data data to be sent to the client
 */
SocketServer.respondToSocket = function(socket, responseID, data) {
	socket.emit('message', {
							type : 'response',
							'id' : responseID,
							'data' : data
						});
}


module.exports = SocketServer;