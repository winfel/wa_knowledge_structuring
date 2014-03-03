var RightManager = function(){
	
	var possibleAccessRights = ["create","read","update","delete","..."];
	
	/**
	*	The function returns a boolean value that 
	*	represents if the current user has the right 
	*	to perform a specific command.
	*	
	*	@param command: The used command (access right), e.g., read, write (CRUD)
	*	@param the object that should be checked	
	*/
	var hasAccess = function(command,object){
		return true;
	}
	
	/**
	*	The function can be used to grant access rights
	*	@param 	command: The used command (access right), e.g., read, write (CRUD)
	*	@param 	object:  The object that should be used to change the access right
	*	@param	role:    The role that should be changed
	*	A call could look like this:  grantAccess("read","AB","reviewer");
	*/
	var grantAccess = function(command,object,role){
		this.modifyAccess(command,object,role,true);
	}
	
	/**
	*	The function can be used to revoke access rights
	*	@param 	command: The used command (access right), e.g., read, write (CRUD)
	*	@param 	object:  The object that should be used to change the access right
	*	@param	role:    The role that should be changed
	*	A call could look like this: revokeAccess("read","AB","reviewer");
	*/
	var revokeAccess = function(command,object,role){
		this.modifyAccess(command,object,role,false);
	}
	
	/**
	*	The function can be used to modify access rights
	*	@param 	command: The used command (access right), e.g., read, write (CRUD)
	*	@param 	object:  The object that should be used to change the access right
	*	@param	role:    The role that should be changed
	*	@param  grant:   The grant paramter is set to true, if the access right should be
	*					 granted. Set false, to revoke access.
	*	A call could look like this: modifyAccess("read","AB","reviewer", true);
	*/
	var modifyAccess = function(command,object,role,grant){
		// do nothing
	}
	
}

module.exports = RightManager;