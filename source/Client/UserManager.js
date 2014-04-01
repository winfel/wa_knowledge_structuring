// This is the client side ObjectManager

"use strict";

var Modules = false;

/**
 * Object providing functions for object management
 */
var UserManager = {};

UserManager.addRole = function(role, object) {
  this.modifyRole(role, object, true);
};

/**
 * 
 * @param {type} role
 * @param {type} object
 * @returns {undefined}
 */
UserManager.removeRole = function(role, object) {
  this.modifyRole(role, object, false);
};

/**
 * 
 * @param {type} role
 * @param {type} object
 * @param {type} grant
 * @returns {undefined}
 */
UserManager.modifyRole = function(role, object, grant) {
  // do nothing
  var serverCall = (grant ? "umAddRole" : "umRemoveRole");

  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall(serverCall, {
    'role': role,
    'object': object
  });
};

/**
 * 
 * @param {type} role
 * @param {type} object
 * @param {type} user
 * @returns {undefined}
 */
UserManager.addUser = function(role, object, user) {
  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('umAddUser', {
    'role': role,
    'object': object,
    'username': user
  });
};

/**
 * 
 * @param {type} role
 * @param {type} object
 * @param {type} user
 * @returns {undefined}
 */
UserManager.removeUser = function(role, object, user) {
  // The responce should be some sort of broadcast to users with a manager role...
  Modules.SocketClient.serverCall('umRemoveUser', {
    'role': role,
    'object': object,
    'username': user
  });
};

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

