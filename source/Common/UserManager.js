var UserManager2 = {};

/**
 *	The function can be used to add a role
 *	
 * @param {type} role   The used role passed as a RoleObject 
 * @param {type} object The object that should be used to change the access right
 * 
 *	A call could look like this: modifyAccess(ReviewRole.create(),"AB");
 */
UserManager2.addRole = function(role, object) {
  this.modifyRole(role, object, true);
};

/**
 *	The function can be used to remove a role
 * 
 * @param {type} role   The used role passed as a RoleObject 
 * @param {type} object The object that should be used to change the access right
 * @returns {undefined}
 */
UserManager2.removeRole = function(role, object) {
  this.modifyRole(role, object, false);
};

/**
 *	The function can be used to modify a role
 *	@param {type}	role    The used role passed as a RoleObject 
 *	@param {type}	object  The object that should be used to change the access right
 *	@param {type} grant   The grant paramter is set to true, if the access right should be
 *					 granted. Set false, to revoke access.
 *	A call could look like this: modifyAccess(ReviewRole.create(),"AB", true);
 */
UserManager2.modifyRole = function(role, object, grant) {
  // do nothing
};

/**
 *	The function can be used to add a user to a specific role
 *	@param {type}	role    The used role passed as a RoleObject 
 *	@param {type}	object  The object that should be used to get the specfic role
 *	@param {type} user    The user object that should be added
 */
UserManager2.addUser = function(role, object, user) {
  // do nothing
};

/**
 *	The function can be used to remove a user to a specific role
 *	@param {type}	role    The used role passed as a RoleObject 
 *	@param {type}	object  The object that should be used to get the specfic role
 *	@param {type} user    The user object that should be added
 */
UserManager2.removeUser = function(role, object, user) {
  // do nothing
};

module.exports = UserManager2;