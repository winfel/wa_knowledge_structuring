// This is the client side ObjectManager

"use strict";

var Modules = false;

/**
 * Object providing functions for object management
 */
var UserManager = {};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @returns {undefined}
 */
UserManager.addRole = function(object, role) {
  this.modifyRole(object, role, true);
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @returns {undefined}
 */
UserManager.removeRole = function(object, role) {
  this.modifyRole(object, role, false);
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} grant
 * @returns {undefined}
 */
UserManager.modifyRole = function(object, role, grant) {
  // do nothing
  var serverCall = (grant ? "umAddRole" : "umRemoveRole");

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall(serverCall, {
    'object': object,
    'role': role
  });
};

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

UserManager.setDataOfSpaceWithDest = function(dest,key,value){
  Modules.SocketClient.serverCall('umSetDataOfSpaceWithDest', {
    'destination': dest,
    'key':key,
    'value':value
  });
};

UserManager.removeDataOfSpaceWithDest = function(dest,key){
  Modules.SocketClient.serverCall('umRemoveDataOfSpaceWithDest', {
    'destination': dest,
    'key':key,
  });
};

UserManager.getDataOfSpaceWithDest = function(dest,key,callback){
  Dispatcher.registerCall("umGetDataOfSpaceWithDest" + dest + key, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umGetDataOfSpaceWithDest" + dest + key);
  });

  Modules.SocketClient.serverCall('umGetDataOfSpaceWithDest', {
    'destination': dest,
    'key':key
  });
};

/**
* broadcasts a change of a name to all other users. 
* They might need that information for their tab-bar
**/
UserManager.broadcastNameChange = function(object){
  Modules.SocketClient.serverCall('umBroadcastNameChange', {
    'object': object
  });
}

/**
 * 
 * @param {type} object
 * @param {type} user
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getRoles = function(object, user, callback) {

  Dispatcher.registerCall("umGetRoles" + object.id, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umGetRoles" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umGetRoles', {
    'object': object,
    'username': user
  });
};

UserManager.loadDefaultRoles = function(object, callback) {

  Dispatcher.registerCall("umDefaultRoles" + object.id, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umDefaultRoles" + object.id);
  });
  
  Modules.SocketClient.serverCall("umLoadDefaultRoles", {
    'object': object
  });
};

UserManager.removeAllRoles = function(object, callback) {
  Dispatcher.registerCall("umRolesCleared" + object.id, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umRolesCleared" + object.id);
  });
  
  Modules.SocketClient.serverCall("umClearRoles", {
    'object': object
  });
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} user
 * @returns {undefined}
 */
UserManager.addUser = function(object, role, user) {
  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('umAddUser', {
    'role': role,
    'object': object,
    'username': user
  });
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} user
 * @returns {undefined}
 */
UserManager.removeUser = function(object, role, user) {
  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('umRemoveUser', {
    'object': object,
    'role': role,
    'username': user
  });
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} user
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getUsers = function(object, role, user, callback) {

  Dispatcher.registerCall("umUsers" + object.id, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umUsers" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umGetUsers', {
    'object': object,
    'role': role,
    'username': user
  });
};

/**
 * 
 * @param {type} object
 * @param {type} role
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getMissingUsers = function(object, role, callback) {

  Dispatcher.registerCall("umMissingUsers" + object.id, function(data) {
    // call the callback
    var users = new Array();
    
    data.allUsers.forEach(function(user) {
      // If the user is not already added, push it to the result array.
      if(data.alreadyAddedUsers.indexOf(user.username) < 0)
        users.push(user);
    });
    callback(users);

    // deregister
    Dispatcher.removeCall("umMissingUsers" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umGetMissingUsers', {
    'object': object,
    'role': role
  });
};
