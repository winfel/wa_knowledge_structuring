// This is the CLIENT side RightManager

"use strict";

/**
 * Object providing functions for object management
 */
var RightManager = new function() {

  var that = this;
  var Dispatcher = null;

  /**
   * This function initializes the RightManager object.
   * 
   * @param {type} theModules   All available modules...
   */
  this.init = function(theModules) {
    Dispatcher = theModules.Dispatcher;
  };

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {String}   command   The used command (access right), e.g., read, write (CRUD)
   *	@param {Object}   object    The object that should be checked	
   *	@param {function} callback  The callback function
   */
  this.hasAccess = function(command, object, callback) {
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
      'object': object
    });

    //callback(true);
  };

  /**
   * Returns the rights for a particular object and role.
   * 
   * @param {type} object   The object
   * @param {type} user     The current user
   * @param {type} callback
   * @returns {undefined}
   */
  this.getRights = function(object, role, callback) {
    Dispatcher.registerCall("rmObjectRights" + object.id, function(data) {
      callback(data.availableRights, data.checkedRights);
      Dispatcher.removeCall("rmObjectRights" + object.id);
    });

    Modules.SocketClient.serverCall('rmGetObjectRights', {
      'object': object,
      'role': role
    });
  };

  /**
   * 
   * 
   * @param {type} object   The object
   * @param {type} callback
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
   * 
   * 
   * @param {type} object   The object
   * @param {type} callback
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
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this:  grantAccess("read","AB","reviewer");
   */
  this.grantAccess = function(command, object, role) {
    this.modifyAccess(command,object,role,true);
  };

  /**
   *	The function can be used to revoke access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this: revokeAccess("read","AB","reviewer");
   */
  this.revokeAccess = function(command, object, role) {
    this.modifyAccess(command,object,role,false);
  };

  /**
   *	The function can be used to modify access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	@param {type} grant     The grant paramter is set to true, if the access right should be
   *					 granted. Set false, to revoke access.
   *	A call could look like this: modifyAccess("read","AB","reviewer", true);
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

