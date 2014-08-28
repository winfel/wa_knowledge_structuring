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
 * 
 * @param {type} socket
 * @param {type} data
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
    Modules.SocketServer.sendToSocket(socket, "dbDocuments_" + data.collection + "_" + data.object.id, docs);
  });
};

/**
 * 
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
DBManager.addDocument = function(socket, data) {
  var dbCollection = db.get(data.collection);
  var connection = Modules.UserManager.getConnectionBySocket(socket);

  dbCollection.insert({
    objectid: String(data.object.id),
    id: String(data.docId),
    user: connection.user.username,
    data: data.data
  });

  if (data.singleResponse) {
    // Send a message to the user who created this document.
    Modules.SocketServer.sendToSocket(connection.socket, "dbDocumentAdded_" + data.collection + "_" + data.object.id,
            {user: connection.user.username, id: data.docId, data: data.data});
  } else {
    // Send it to all other users within the room.
    var connectionOfOthers;
    for (var socketId in Modules.UserManager.getConnectionsForRoom(connection.rooms.left.id)) {
      connectionOfOthers = Modules.UserManager.getConnectionBySocketID(socketId);

      Modules.SocketServer.sendToSocket(connectionOfOthers.socket, "dbDocumentAdded_" + data.collection,
              {user: connection.user.username, id: data.docId, data: data.data});
    }
  }
};

/**
 * 
 * @param {type} socket
 * @param {type} data
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
            {user: connection.user.username, id: data.id, data: data.data});
  } else {
    // Send it to all other users within the room.
    var connectionOfOthers;
    for (var socketId in Modules.UserManager.getConnectionsForRoom(connection.rooms.left.id)) {
      connectionOfOthers = Modules.UserManager.getConnectionBySocketID(socketId);

      Modules.SocketServer.sendToSocket(connectionOfOthers.socket, "dbDocumentRemoved_" + data.collection,
              {user: connection.user.username, id: data.id, data: data.data});
    }
  }
};

/**
 * 
 * @param {type} theModules
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
