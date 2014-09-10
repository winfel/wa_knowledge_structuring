// This is the CLIENT side RightManager

"use strict";

/**
 * Object providing functions for object management
 * @class RightManager
 * 
 */
 var RightManager = new function() {

  var that = this;
  var Dispatcher = null;

  /**
   * @function init
   * @desc This function initializes the RightManager object.
   * @param {type} theModules   All available modules...
   */
   this.init = function(theModules) {
    Dispatcher = theModules.Dispatcher;

    Dispatcher.registerCall("umBroadcastDeleteObjectFromTabs", function(data){
      GUI.tabs.removeTab(data.objectID);
    });

    Dispatcher.registerCall("umBroadcastNameChange", function(data){
      GUI.tabs.updateNameOfTabWithID(data.object.id, data.object.name);
    });
  };

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	@function hasAccess
   *	@param {type} command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type} object    The object that should be checked	
   */
   this.hasAccess = function(command, object, user, callback) {
    Dispatcher.registerCall("rmAccessGranted" + object.id, function() {
      // call the callback
      callback(true);
      // deregister
      Dispatcher.removeCall("rmAccessGranted" + object.id);
    });

    Dispatcher.registerCall("rmAccessDenied" + object.id, function() {
      // call the callback
      callback(false);
      // deregister
      Dispatcher.removeCall("rmAccessDenied" + object.id);
    });

    Modules.SocketClient.serverCall('rmHasAccess', {
      'command': command,
      'object': object,
      'username': user
    });

    //callback(true);
  };

  /**
   * @function getRights
   * @param {type} object   The object
   * @param {type} user     The current user
   * @param {Function} callback
   */
   this.getRights = function(object, role, user, callback) {
    Dispatcher.registerCall("rmObjectRights" + object.id, function(data) {
      callback(data.availableRights, data.checkedRights);
      Dispatcher.removeCall("rmObjectRights" + object.id);
    });

    Modules.SocketClient.serverCall('rmGetObjectRights', {
      'object': object,
      'role': role,
      'username': user
    });
  };

  /**
   * 
   * @function getRolesForObject
   * @param {type} object   The object
   * @param {Function} callback
   */
   this.getRolesForObject = function(object, callback) {
    Dispatcher.registerCall("rmObjectRoles" + object.id, function(data) {
      callback(data);
      Dispatcher.removeCall("rmObjectRoles" + object.id);
    });

    Modules.SocketClient.serverCall('rmGetObjectRoles', {
      'object': object
    });
  };

  /**
   * @function getAllUsers
   * @param {type} object   The object
   * @param {Function} callback
   */
   this.getAllUsers = function(callback) {
    Dispatcher.registerCall("rmUsers", function(data) {
      callback(data);
      Dispatcher.removeCall("rmUsers");
    });

    Modules.SocketClient.serverCall('rmGetAllUsers', {});
  };

  /**
   *	The function can be used to grant access rights
   *  A call could look like this:  grantAccess("read","AB","reviewer");
   *  @function grantAccess
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   */
   this.grantAccess = function(command, object, role) {
    this.modifyAccess(command,object,role,true);
  };

  /**
   *	The function can be used to revoke access rights
   *  A call could look like this: revokeAccess("read","AB","reviewer");
   *  @function revokeAccess
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   */
   this.revokeAccess = function(command, object, role) {
    this.modifyAccess(command,object,role,false);
  };

  /**
   *	The function can be used to modify access rights
   *  A call could look like this: modifyAccess("read","AB","reviewer", true);
   *  @function modifyAccess
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	@param {type} grant     The grant paramter is set to true, if the access right should be
   *					 granted. Set false, to revoke access.
   */
   this.modifyAccess = function(command, object, role, grant) {
    if(grant === true){
      Modules.SocketClient.serverCall('rmGrantAccess', {
        'command': command,
        'object': object,
        'role': role
      });
    }else{
      Modules.SocketClient.serverCall('rmRevokeAccess', {
        'command': command,
        'object': object,
        'role': role
      });
    }
  };
  
};

