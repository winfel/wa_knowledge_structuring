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

/**
 * 
 * @param {type} object
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getRoles = function(object, callback) {

  Dispatcher.registerCall("umGetRoles" + object.id, function(roles) {
    roles = prepareRoles(roles);
    callback(roles);

    // deregister
    Dispatcher.removeCall("umGetRoles" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umGetRoles', {
    'object': object
  });
};

UserManager.isManager = function(object, user, callback) {

   Dispatcher.registerCall("umIsManager" + object.id, function() {
      // call the callback
      callback(true);
      // deregister
      Dispatcher.removeCall("umIsManager" + object.id);
    });

    Dispatcher.registerCall("umIsNotManager" + object.id, function() {
      // call the callback
      callback(false);
      // deregister
      Dispatcher.removeCall("umIsNotManager" + object.id);
    });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umIsManager', {
    'object': object,
    'username': user
  });
};

UserManager.loadDefaultRoles = function(object, callback) {

  Dispatcher.registerCall("umDefaultRoles" + object.id, function(roles) {
    roles = prepareRoles(roles);
    callback(roles);

    // deregister
    Dispatcher.removeCall("umDefaultRoles" + object.id);
  });

  Modules.SocketClient.serverCall("umLoadDefaultRoles", {
    'object': object
  });
};

/**
 * Prepares the given roles for the user interface.
 * 
 * @param {type} roles
 * @returns {Array}
 */
function prepareRoles(roles) {
  var username = GUI.username;
  var rolesOfUser = new Array();
  var isManager = false;

  // Check if the user is a manager of this object
  roles.forEach(function(role) {
    if (role.name.toLowerCase() == "manager"
            && role.users.indexOf(username) > -1) {
      isManager = true;
    }
  });


  roles.forEach(function(role) {
    role.readonly = !isManager;
    
    if(role.name.toLowerCase() == "manager")
      role.readonly = true;

    if (role.users.indexOf(username) > -1) {
      rolesOfUser.push(role);
    }
  });

  if (isManager)
    return roles;
  else
    return rolesOfUser;
}

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
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getUsers = function(object, role, callback) {

  Dispatcher.registerCall("umUsers" + object.id, function(data) {
    // call the callback
    callback(data);

    // deregister
    Dispatcher.removeCall("umUsers" + object.id);
  });

  // The responce should be some sort of broadcast... Instead of

  Modules.SocketClient.serverCall('umGetUsers', {
    'object': object,
    'role': role
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
      if (data.alreadyAddedUsers.indexOf(user.username) < 0)
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
