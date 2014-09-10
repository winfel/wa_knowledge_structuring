// This is the client side UserManager

"use strict";

var Modules = false;

/**
 * Object providing functions for object management
 * @class UserManager
 */
 var UserManager = {};

/**
 * @function addRole
 * @param {type} object
 * @param {type} role
 */
 UserManager.addRole = function(object, role) {
  this.modifyRole(object, role, true);
};

/**
 * @function removeRole
 * @param {type} object
 * @param {type} role
 */
 UserManager.removeRole = function(object, role) {
  this.modifyRole(object, role, false);
};

/**
 * @function modigyRole
 * @param {type} object
 * @param {type} role
 * @param {type} grant
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
/**
* @function StoreTabCache
* @param {type} ObjectList
* @param {type} cache
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
 * 
 * @function isValidUser
 * @param {String} newUser
 * @param {Function} callback
 * @desc Check whether a user exists in the server or not
 */
 UserManager.isValidUser = function(newUser, callback) {
  Dispatcher.query('umisValidUser', { 'user': newUser } ,callback);
}
/**
 * @function getTabCache
 * @param {Function} callback
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
 * @function setDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 * @param {type} value
 */
 UserManager.setDataOfSpaceWithDest = function(dest,key,value){
  Modules.SocketClient.serverCall('umSetDataOfSpaceWithDest', {
    'destination': dest,
    'key':key,
    'value':value
  });
};
/**
 * @function removeDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 */
 UserManager.removeDataOfSpaceWithDest = function(dest,key){
  Modules.SocketClient.serverCall('umRemoveDataOfSpaceWithDest', {
    'destination': dest,
    'key':key,
  });
};
/**
 * @function getDataOfSpaceWithDest
 * @param {type} dest
 * @param {type} key
 * @param {Function} callback
 */
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
* @function broadcastNameChange
* @param {type} object
* @desc broadcasts a change of a name to all other users. They might need that information for their tab-bar
**/
UserManager.broadcastNameChange = function(object){
  Modules.SocketClient.serverCall('umBroadcastNameChange', {
    'object': object
  });
}

/**
 * @function getRoles
 * @param {type} object
 * @param {type} user
 * @param {Function} callback
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
/**
 * @function loadDefaultRoles
 * @param {type} object
 * @param {Function} callback
 */
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
/**
 * @function removeAllRoles
 * @param {type} object
 * @param {Function} callback
 */
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
 * @function addUser
 * @param {type} object
 * @param {type} role
 * @param {type} user
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
 * @function removeUser
 * @param {type} object
 * @param {type} role
 * @param {type} user
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
 * @function getUsers
 * @param {type} object
 * @param {type} role
 * @param {type} user
 * @param {Function} callback
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
 * @function isManager
 * @param {type} object
 * @param {Function} callback
 */
 UserManager.isManager = function(object, callback) {

  Dispatcher.registerCall("umIsManager" + object.id, function(data) {
    // call the callback
    callback(true);

    // deregister
    Dispatcher.removeCall("umIsManager" + object.id);
  });

  Dispatcher.registerCall("umIsNotManager" + object.id, function(data) {
    // call the callback
    callback(false);

    // deregister
    Dispatcher.removeCall("umIsNotManager" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umIsManager', {
    'object': object
  });
};

/**
 * @function getMissingUsers
 * @param {type} object
 * @param {type} role
 * @param {type} callback
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
