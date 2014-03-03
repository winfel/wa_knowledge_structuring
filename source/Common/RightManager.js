var RightManager = {};

RightManager.possibleAccessRights = ["create", "read", "update", "delete", "..."];

/**
 *	The function returns a boolean value that 
 *	represents if the current user has the right 
 *	to perform a specific command.
 *	
 *	@param {type} command   The used command (access right), e.g., read, write (CRUD)
 *	@param {type} object    The object that should be checked	
 */
RightManager.hasAccess = function(command, object) {

  return false;
};

/**
 *	The function can be used to grant access rights
 *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
 *	@param {type}	object    The object that should be used to change the access right
 *	@param {type} role      The role that should be changed
 *	A call could look like this:  grantAccess("read","AB","reviewer");
 */
RightManager.grantAccess = function(command, object, role) {
  this.modifyAccess(command, object, role, true);
};

/**
 *	The function can be used to revoke access rights
 *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
 *	@param {type}	object    The object that should be used to change the access right
 *	@param {type} role      The role that should be changed
 *	A call could look like this: revokeAccess("read","AB","reviewer");
 */
RightManager.revokeAccess = function(command, object, role) {
  this.modifyAccess(command, object, role, false);
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
RightManager.modifyAccess = function(command, object, role, grant) {
  // do nothing
};

module.exports = RightManager;