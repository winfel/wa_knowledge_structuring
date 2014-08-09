/* 
 * Client side of the DBManager.
 */
"use strict";

var Modules = false;

/**
 * Object providing functions for Database management.
 */
var DBManager = {};

/**
 * 
 * @param {type} object
 * @param {type} collection
 * @param {type} callback
 * @returns {undefined}
 */
DBManager.getDocuments = function(object, collection, callback) {

  Dispatcher.registerCall("dbDocuments" + object.id, function(documents) {
    // call the callback
    callback(documents);
    // deregister
    Dispatcher.removeCall("dbDocuments" + object.id);
  });

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbGetDocuments', {
    'collection': collection,
    'object': {id: object.id, type: object.type}
  });
};

/**
 * 
 * @param {type} object
 * @param {type} collection
 * @param {type} data
 * @param {type} callback
 * @returns {undefined}
 */
DBManager.addDocument = function(object, collection, data, callback) {
  
  Dispatcher.registerCall("dbDocumentAdded" + object.id, function(result) {
    // call the callback
    if(callback)
      callback(result);
    // deregister
    Dispatcher.removeCall("dbDocumentAdded" + object.id);
  });

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbAddDocument', {
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'data': data
  });
};