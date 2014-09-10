"use strict";
/**
* @class SocketClient
*/
var SocketClient = {};

/**
* @function init
* @desc Init function called in index.html to initialize this module
*/
SocketClient.init = function() {
  var url = location.protocol + '//' + location.hostname;
  var socket = io.connect(url); // <--- Connects to the server: creates a websocket (socket.IO)
  Modules.Socket = socket;

  socket.on('message', function(data) {
    // console.log("message: " + JSON.stringify(data));
    
    if (data.type == 'call') {
      Modules.Dispatcher.call(data);
    }
    
    if (data.type == 'response') {
      Modules.Dispatcher.response(data);
    }
  });
  
  socket.on('disconnect', function() {
    console.log("disconnect");
    GUI.disconnected();
  });
  
  socket.on('connect', function() {
    console.log("connect");
    GUI.connected();
  });
};

/**
 * @function sendCall
 * @desc Sends a message to the server
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