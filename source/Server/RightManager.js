var db = require('monk')('localhost/WebArena')

var RightManager = function() {
  var possibleAccessRights = [];
    
  /**
  *		The function is needed to initialize the RightManager
  *
  */	
  this.init = function(){
      /* get all exiting access rights from the database */
      var collection = db.get('rights');
      collection.find({},{},function(e,docs){
                      docs.forEach(function(entry){
                                   console.log("adding right: "+String(entry.name));
                                   possibleAccessRights.push(docs.name);
                                   });
                      });

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
      /* check if command is feasible */
      var commandIsInPossibleAccessRights = (possibleAccessRights.indexOf(String(command)) != -1);
      if(commandIsInPossibleAccessRights || true /*  FIXME true is for debugging purpose */){
      
          /* (1) get the roles that include the current command within the context of
           the given object */
          
          /* (2) check if current user is inside of one of these roles */
          
          /* (3) if (2) is fulfilled return true */
          
          /* DEMO TEST */
          var collection = db.get('users');
          collection.findOne({username:String(command)},{},function(e,docs){
                            console.log(command+"'s password is:" + docs.password);
                          });
      }else{
         
         console.log("<<DEBUG INFORMATION>> The given command was not valid");
      }
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