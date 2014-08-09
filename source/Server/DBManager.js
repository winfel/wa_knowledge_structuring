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
  
  dbCollection.find({objectid: String(data.object.id)}, {}, function(e, docs) {
    Modules.SocketServer.sendToSocket(socket, "dbDocuments" + data.object.id, docs);
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
    user: connection.user.username,
    data: data.data
  });
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
};

module.exports = DBManager;
