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
 * @param {type} object               The object where the data is related to
 * @param {type} collection           The mongo db collection, where the data is stored
 * @param {type} [callback]           The callback which will receive the result (optional)
 * @param {type} [column]             Default is "objectid" (optional)
 * @returns {undefined}
 */
DBManager.getDocuments = function(object, collection, callback, column) {

  if (callback) {
    Dispatcher.registerCall("dbDocuments_" + collection + "_" + object.id, function(documents) {
      if (callback)
        callback(documents);
      Dispatcher.removeCall("dbDocuments_" + collection + "_" + object.id);
    });
  }

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('dbGetDocuments', {
    'oneMessage': (callback ? true : false),
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'column': column
  });
};

/**
 * Adds the given data object to the collection, given by its name.
 * 
 * @param {type} object       The object where the data is related to
 * @param {type} collection   The mongo db collection, where the data is about to be stored
 * @param {type} id           The unique id of this data element (some sort of hash)
 * @param {type} data         The data to be stored
 * @param {type} callback     [Optional]. A callback. If given, the server will only send a message to the client who called. 
 * @returns {undefined}
 */
DBManager.addDocument = function(object, collection, id, data, callback) {
  if (callback) {
    Dispatcher.registerCall("dbDocumentAdded_" + collection + "_" + object.id, function(result) {
      callback(result);
      Dispatcher.removeCall("dbDocumentAdded_" + collection + "_" + object.id);
    });
  }

  Modules.SocketClient.serverCall('dbAddDocument', {
    'singleResponse': (callback ? true : false),
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'id': id,
    'data': data
  });
};

/**
 * Removes the given data object from the collection, given by its name.
 * 
 * @param {type} object       The object where the data is related to
 * @param {type} collection   The mongo db collection, where the data is stored
 * @param {type} id           The unique id of the data element, which should be removed (some sort of hash)
 * @param {type} callback     [Optional]. A callback. If given, the server will only send a message to the client who called. 
 * @returns {undefined}
 */
DBManager.removeDocument = function(object, collection, id, callback) {
  if (callback) {
    Dispatcher.registerCall("dbDocumentRemoved_" + collection + "_" + object.id, function(result) {
      callback(result);
      Dispatcher.removeCall("dbDocumentRemoved_" + collection + "_" + object.id);
    });
  }

  Modules.SocketClient.serverCall('dbRemoveDocument', {
    'singleResponse': (callback ? true : false),
    'collection': collection,
    'object': {id: object.id, type: object.type},
    'id': id
  });
};