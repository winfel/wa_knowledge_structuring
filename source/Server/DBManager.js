/* 
 * Server side of the DBManager.
 */
"use strict";

var Modules = false;

/**
 * Object providing functions for Database management.
 */
var db = false;

var DBManager = {};

/**
 * Receives all documents from a given collection, which are stored in the
 * context of a given object id.
 * 
 * @param {type} socket   Socket of the client, which called this function
 * @param {type} data     Data object containing the required information
 * @returns {undefined}
 */
DBManager.getDocuments = function(socket, data) {
  var dbCollection = db.get(data.collection);

  // If data.column is defined, use it as the attribute to look for.
  var obj = {};
  if (data.column)
    obj[data.column] = String(data.object.id);
  else
    obj["objectid"] = String(data.object.id);

  dbCollection.find(obj, {}, function(e, docs) {

    if (data.oneMessage) {
      // Send one big message with all documents to the client.
      Modules.SocketServer.sendToSocket(socket, "dbDocuments_" + data.collection + "_" + data.object.id, docs);
    } else {
      // Send a message for each document to the client.
      for (var i in docs) {
        Modules.SocketServer.sendToSocket(socket, "dbDocument_" + data.collection, docs[i]);
      }
      Modules.SocketServer.sendToSocket(socket, "dbAllDocumentsSend_" + data.collection);
    }
  });
};

/**
 * Adds a document to the given collection. It will also notify all members within the same of room of the requester
 * or - if requested - only to the client of requester.
 * 
 * @param {type} socket   Socket of the client, which called this function
 * @param {type} data     Data object containing the required information
 * @returns {undefined}
 */
DBManager.addDocument = function(socket, data) {
  var dbCollection = db.get(data.collection);
  var connection = Modules.UserManager.getConnectionBySocket(socket);

  dbCollection.insert({
    objectid: String(data.object.id),
    id: String(data.id),
    user: connection.user.username,
    data: data.data
  });

  if (data.singleResponse) {
    // Send a message to the user who created this document.
    Modules.SocketServer.sendToSocket(connection.socket, "dbDocumentAdded_" + data.collection + "_" + data.object.id,
            {user: connection.user.username, id: data.id, data: data.data});
  } else {
    // Send it to all other users within the room.
    var connectionOfOthers;
    for (var socketId in Modules.UserManager.getConnectionsForRoom(connection.rooms.left.id)) {
      connectionOfOthers = Modules.UserManager.getConnectionBySocketID(socketId);

      Modules.SocketServer.sendToSocket(connectionOfOthers.socket, "dbDocumentAdded_" + data.collection,
              {user: connection.user.username, id: data.id, data: data.data});
    }
  }
};

/**
 * Removes a document from the given collection. It will also notify all members within the same of room of the requester
 * or - if requested - only to the client of requester.
 * 
 * @param {type} socket   Socket of the client, which called this function
 * @param {type} data     Data object containing the required information
 * @returns {undefined}
 */
DBManager.removeDocument = function(socket, data) {
  var dbCollection = db.get(data.collection);
  var connection = Modules.UserManager.getConnectionBySocket(socket);

  dbCollection.remove({
    objectid: String(data.object.id),
    id: String(data.id)
  });

  if (data.singleResponse) {
    // Send a message to the user who created this document.
    Modules.SocketServer.sendToSocket(connection.socket, "dbDocumentRemoved_" + data.collection + "_" + data.object.id,
            {user: connection.user.username, id: data.id});
  } else {
    // Send it to all other users within the room.
    var connectionOfOthers;
    for (var socketId in Modules.UserManager.getConnectionsForRoom(connection.rooms.left.id)) {
      connectionOfOthers = Modules.UserManager.getConnectionBySocketID(socketId);

      Modules.SocketServer.sendToSocket(connectionOfOthers.socket, "dbDocumentRemoved_" + data.collection,
              {user: connection.user.username, id: data.id});
    }
  }
};

/**
 * Initializes the DBManager.
 * 
 * @param {type} theModules   The modules object
 * @returns {undefined}
 */
DBManager.init = function(theModules) {
  Modules = theModules;

  db = require('monk')(Modules.MongoDBConfig.getURI());

  // Register DatabaseManager related server calls...
  Modules.Dispatcher.registerCall('dbGetDocuments', this.getDocuments);
  Modules.Dispatcher.registerCall('dbAddDocument', this.addDocument);
  Modules.Dispatcher.registerCall('dbRemoveDocument', this.removeDocument);
};

module.exports = DBManager;
