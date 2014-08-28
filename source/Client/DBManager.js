/* 
 * Client side of the DBManager.
 */
"use strict";

var Modules = false;

/**
 * Object providing functions for database management.
 */
var DBManager = {};

/**
 * Gets all documents from the given collection of a specific object.
 * 
 * @param {type} object
 * @param {type} collection
 * @param {type} callback
 * @param {type} [column]     Optional.
 * @returns {undefined}
 */
DBManager.getDocuments = function(object, collection, callback, column) {

  Dispatcher.registerCall("dbDocuments_" + collection + "_" + object.id, function(documents) {
    // call the callback
    if (callback)
      callback(documents);
    // deregister
    Dispatcher.removeCall("dbDocuments_" + collection + "_" + object.id);
  });

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbGetDocuments', {
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'column': column
  });
};

/**
 * Adds the given data object to the collection, given by its name.
 * 
 * @param {type} object
 * @param {type} collection
 * @param {type} data
 * @param {type} callback
 * @returns {undefined}
 */
DBManager.addDocument = function(object, collection, docId, data, callback) {
  if (callback) {
    Dispatcher.registerCall("dbDocumentAdded_" + collection + "_" + object.id, function(result) {
      // call the callback
      callback(result);
      // deregister
      Dispatcher.removeCall("dbDocumentAdded_" + collection + "_" + object.id);
    });
  }

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbAddDocument', {
    'singleResponse': (callback ? true : false),
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'docId': docId,
    'data': data
  });
};

/**
 * Removes the given data object from the collection, given by its name.
 * 
 * @param {type} object
 * @param {type} collection
 * @param {type} data
 * @param {type} callback
 * @returns {undefined}
 */
DBManager.removeDocument = function(object, collection, docId, callback) {
  if (callback) {
    Dispatcher.registerCall("dbDocumentRemoved_" + collection + "_" + object.id, function(result) {
      // call the callback
      callback(result);
      // deregister
      Dispatcher.removeCall("dbDocumentRemoved_" + collection + "_" + object.id);
    });
  }

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbRemoveDocument', {
    'singleResponse': (callback ? true : false),
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'docId': docId
  });
};