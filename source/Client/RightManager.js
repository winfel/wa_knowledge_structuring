// This is the CLIENT side RightManager

"use strict";

var Modules = false;

/**
 * Object providing functions for object management
 */
var RightManager = new function() {

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {type} command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type} object    The object that should be checked	
   */
  this.hasAccess = function(command, object) {

//    Modules.SocketClient.serverCall('hasAccess',{
//                                    'command':command,
//                                    'object':object.toJSON()
//                                    });

    return true;
  };

  /**
   *	The function can be used to grant access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this:  grantAccess("read","AB","reviewer");
   */
  this.grantAccess = function(command, object, role) {

  };

  /**
   *	The function can be used to revoke access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this: revokeAccess("read","AB","reviewer");
   */
  this.revokeAccess = function(command, object, role) {

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
    // do nothing

  };
};

