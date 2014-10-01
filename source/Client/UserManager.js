// This is the client side ObjectManager

"use strict";

var Modules = false;

/**
* @class UserManager
 */
var UserManager = {};

/**
 * 
 * @function init
 * @param {type} theModules
 * @returns {undefined}
 */
UserManager.init = function(theModules) {
  Modules = theModules;

  Modules.Dispatcher.registerCall("umBroadcastDeleteObjectFromTabs", function(data) {
    GUI.tabs.removeTab(data.objectID);
  });

  Modules.Dispatcher.registerCall("umBroadcastNameChange", function(data) {
    GUI.tabs.updateNameOfTabWithID(data.object.id, data.object.name);
  });
};

/**
 * 
 * @function storeTabCache
 * @param {type} objectList
 * @param {type} cache
 * @returns {undefined}
 */
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
 * @function isValidUser
 * @param {String} newUser
 * @param {Function} callback
 */
UserManager.isValidUser = function(newUser, callback) {
  Dispatcher.query('umisValidUser', {'user': newUser}, callback);
};

/**
 * 
 * @function getTabCache
 * @param {type} callback
 * @returns {undefined}
 */
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

/**
 * 
 * @function setDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 * @param {type} value
 * @returns {undefined}
 */
UserManager.setDataOfSpaceWithDest = function(dest, key, value) {
  Modules.SocketClient.serverCall('umSetDataOfSpaceWithDest', {
    'destination': dest,
    'key': key,
    'value': value
  });
};

/**
 * 
 * @function removeDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 * @returns {undefined}
 */
UserManager.removeDataOfSpaceWithDest = function(dest, key) {
  Modules.SocketClient.serverCall('umRemoveDataOfSpaceWithDest', {
    'destination': dest,
    'key': key
  });
};

/**
 * 
 * @function getDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 * @param {type} callback
 * @returns {undefined}
 */
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
 * Broadcasts a change of a name to all other users. 
 * They might need that information for their tab-bar
 * 
 * @function broadcastNameChange
 * @param object
 **/
UserManager.broadcastNameChange = function(object) {
  Modules.SocketClient.serverCall('umBroadcastNameChange', {
    'object': object
  });
};

/**
 * 
 * @function getMissingUsers
 * @param {type} object
 * @param {type} role
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getMissingUsers = function(object, role, callback) {

  if (callback) {
    Modules.Dispatcher.registerCall("umMissingUsers" + object.id, function(data) {
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

      Modules.Dispatcher.removeCall("umMissingUsers" + object.id);
    });
  }

  Modules.SocketClient.serverCall('umGetMissingUsers', {
    'object': Modules.RightManager.reduceObject(object),
    'role': role
  });
};
