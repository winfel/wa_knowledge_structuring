var UserManager2 = function(){
	
	/**
	*	The function can be used to add a role
	*	@param 	role:    The used role passed as a RoleObject 
	*	@param 	object:  The object that should be used to change the access right
	*	A call could look like this: modifyAccess(ReviewRole.create(),"AB");
	*/
	var addRole = function(role,object){
		this.modifyRole(role,object,true);
	}
	
	/**
	*	The function can be used to remove a role
	*	@param 	role:    The used role passed as a RoleObject 
	*	@param 	object:  The object that should be used to change the access right
	*	A call could look like this: modifyAccess(ReviewRole.create(),"AB");
	*/
	var removeRole = function(role,object){
		this.modifyRole(role,object,false);
	}
	
	/**
	*	The function can be used to modify a role
	*	@param 	role:    The used role passed as a RoleObject 
	*	@param 	object:  The object that should be used to change the access right
	*	@param  grant:   The grant paramter is set to true, if the access right should be
	*					 granted. Set false, to revoke access.
	*	A call could look like this: modifyAccess(ReviewRole.create(),"AB", true);
	*/
	var modifyRole = function(role,object,grant){
		// do nothing
	}
	
	/**
	*	The function can be used to add a user to a specific role
	*	@param 	role:    The used role passed as a RoleObject 
	*	@param 	object:  The object that should be used to get the specfic role
	*	@param  user:    The user object that should be added
	*/
	var addUser = function(role,object,user){
		// do nothing
	}
	
	/**
	*	The function can be used to remove a user to a specific role
	*	@param 	role:    The used role passed as a RoleObject 
	*	@param 	object:  The object that should be used to get the specfic role
	*	@param  user:    The user object that should be added
	*/
	var removeUser = function(role,object,user){
		// do nothing
	}
}

module.exports=UserManager2;