var db = require('monk')('localhost/WebArena')

var RightManager = function() {
  var possibleAccessRights = ["create", "read", "update", "delete", "..."];
    
  /**
  *		The function is needed to initialize the RightManager
  *
  */	
  this.init = function(){
	  console.log("RightManager has been initialized");
  }
  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {type} command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type} object    The object that should be checked	
   */
  this.hasAccess = function(command, object) {
      
      /* mongoose stuff for creating models
      var userModel     = mongoose.model('Users', Modules.Schema.userSchema);
      var roleModel     = mongoose.model('Roles', Modules.Schema.roleSchema);
      var rightModel    = mongoose.model('Rights',Modules.Schema.rightSchema);
      
       debug: print all users
      userModel.find(function (err, user) {
                  if (err) return console.error(err);
                  console.log(user)
                  });
      */
      
      /* (1) get the roles that include the current command within the context of 
       the given object */
      
      /* (2) check if current user is inside of one of these roles */
      
      /* (3) if (2) is fulfilled return true */
      
      /* DEMO TEST */
      var collection = db.get('users');
      collection.findOne({username:String(command)},{},function(e,docs){
                        console.log(docs);
                        console.log(command+"'s password is:" + docs.password);
                      });
      
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
    this.modifyAccess(command, object, role, true);
  };

  /**
   *	The function can be used to revoke access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this: revokeAccess("read","AB","reviewer");
   */
  this.revokeAccess = function(command, object, role) {
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
  this.modifyAccess = function(command, object, role, grant) {
    // do nothing
  };
};

module.exports = new RightManager();