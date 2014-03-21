/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 * @class Dispatcher 
 * @classdesc Object holding functions for server communication
 */

"use strict";


var Dispatcher = {};

/**
 * List of calls
 */
var calls = {};

/**
 * List of waiting response functions
 */
var responseFunctions = {};

var responseCleanupTimeout = false;

Dispatcher.counter = 1;

/**
 * Manages a call from the server
 * 
 * @param {Object} message the received from the server.
 */
Dispatcher.call = function(message) {
  var type = message.name;
  var data = message.data;

  if (calls[type]) {
    calls[type](data);
  } else {
    console.log('ERROR: No function for ' + type);
  }
};

/**
 * Manages a response from the server
 * 
 * @param {Object} message the received from the server.
 */
Dispatcher.response = function(message) {
  var id = message.id;
  var data = message.data;

  if (responseFunctions[id]) {
    responseFunctions[id](data);
    delete (responseFunctions[id]);
  } else {
    console.log('ERROR: No function for ' + id);
  }
};

/**
 * Make a query to the server
 * 
 * @param {Object} queryName The type of query
 * @param {Object} queryArguments The arguments of the query
 * @param {Object} responseFunction The response function (callback function)
 */
Dispatcher.query = function(queryName, queryArguments, responseFunction) {
  this.counter++;
  var random = this.counter + ' ' + (new Date().getTime() - 1296055327011);
  var responseID = queryName + random;

  responseFunctions[responseID] = responseFunction;
  if (responseCleanupTimeout) {
    window.clearTimeout(responseCleanupTimeout);
    responseCleanupTimeout = false;
  }
  responseCleanupTimeout = window.setTimeout(function() {
    responseFunction = {}; // get rid of all remaining response functions
  }, 5000);
  Modules.SocketClient.sendCall(queryName, queryArguments, responseID);
};

/**
 * Register a new callfunction by type
 * 
 * @param {Object} type the type of call function
 * @param {Object} callFunction the call function to be registered.
 */
Dispatcher.registerCall = function(type, callFunction) {
  //callfunction signature (socket,data);
  calls[type] = callFunction;
};

/**
 * Removes a callfunction for a certain type
 * 
 * @param {Object} type the type of call function
 */
Dispatcher.removeCall = function(type) {
  delete calls[type];
};

/**
 * Init function called in index.html to initialize this module
 */
Dispatcher.init = function() {
  // do nothing
};