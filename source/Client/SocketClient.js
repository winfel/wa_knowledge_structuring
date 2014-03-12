/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author , University of Paderborn, 2012
 * 
 */

"use strict";
var SocketClient = {};

/**
 * Init function called in index.html to initialize this module
 */
SocketClient.init = function() {
  var url = location.protocol + '//' + location.hostname;
  var socket = io.connect(url); // <--- Connects to the server: creates a websocket (socket.IO)
  Modules.Socket = socket;

  socket.on('message', function(data) {
    // console.log(data);
    if (data.type == 'call') {
      Modules.Dispatcher.call(data);
    }
    if (data.type == 'response') {
      Modules.Dispatcher.response(data);
    }
  });
  socket.on('disconnect', function() {
    GUI.disconnected();
  });
  socket.on('connect', function() {
    console.log("connect");
    GUI.connected();
  });
};

/**
 * Sends a message to the server
 * 
 * @param {Object} type the type of call.
 * @param {Object} data the data to be sent to the server.
 * @param {Object} responseID the response id.
 */
SocketClient.sendCall = function(type, data, responseID) {
  Modules.Socket.emit('message', {
    'type': type,
    'data': data,
    'responseID': responseID
  });
};

SocketClient.serverCall = SocketClient.sendCall;