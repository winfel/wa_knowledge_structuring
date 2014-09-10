// This is the client side ObjectManager

"use strict";

var Modules = false;

/**
 * Object providing functions for object management
 */
var UserManager = {};

UserManager.storeTabCache = function(objectList, cache) {
  // get current user -- FIXME
  var username = GUI.username;

  //send data to server
  Modules.SocketClient.serverCall('umStoreTabCache', {
    'objectlist': objectList,
    'cache': cache,
    'username': username
  });
};

/**
 * Check whether a user exists in the server or not
 * 
 * @param {String} newUser
 * @param {Function} callback
 */
UserManager.isValidUser = function(newUser, callback) {
  Dispatcher.query('umisValidUser', {'user': newUser}, callback);
};

UserManager.getTabCache = function(callback) {
  // get current user -- FIXME
  var username = GUI.username;

  Dispatcher.registerCall("umGetTabCache" + username, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umGetTabCache" + username);
  });

  Modules.SocketClient.serverCall('umGetTabCache', {
    'username': username
  });
};

UserManager.setDataOfSpaceWithDest = function(dest, key, value) {
  Modules.SocketClient.serverCall('umSetDataOfSpaceWithDest', {
    'destination': dest,
    'key': key,
    'value': value
  });
};

UserManager.removeDataOfSpaceWithDest = function(dest, key) {
  Modules.SocketClient.serverCall('umRemoveDataOfSpaceWithDest', {
    'destination': dest,
    'key': key,
  });
};

UserManager.getDataOfSpaceWithDest = function(dest, key, callback) {
  Dispatcher.registerCall("umGetDataOfSpaceWithDest" + dest + key, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umGetDataOfSpaceWithDest" + dest + key);
  });

  Modules.SocketClient.serverCall('umGetDataOfSpaceWithDest', {
    'destination': dest,
    'key': key
  });
};

/**
 * broadcasts a change of a name to all other users. 
 * They might need that information for their tab-bar
 * 
 * @param object
 **/
UserManager.broadcastNameChange = function(object) {
  Modules.SocketClient.serverCall('umBroadcastNameChange', {
    'object': object
  });
};

/**
 * 
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getMissingUsers = function(object, role, callback) {

  if (callback) {
    Dispatcher.registerCall("umMissingUsers" + object.id, function(data) {
      // call the callback
      var users = new Array();

      data.allUsers.forEach(function(user) {
        if (data.alreadyAddedUsers.indexOf(user.username) < 0)
          users.push(user);
      });
      callback(users.sort(function(a, b) {
        // Sort the list alphabetically.
        return a.username.toLowerCase() > b.username.toLowerCase();
      }));

      Dispatcher.removeCall("umMissingUsers" + object.id);
    });
  }

  Modules.SocketClient.serverCall('umGetMissingUsers', {
    'object': Modules.RightManager.reduceObject(object),
    'role': role
  });
};
