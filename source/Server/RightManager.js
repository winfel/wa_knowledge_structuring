var db = require('monk')('localhost/WebArena')

var DEBUG_OF_RIGHTMANAGEMENT = false;

var fillCurrentDbWithTestData = function(){
    
    if(DEBUG_OF_RIGHTMANAGEMENT){
        console.log("filling testdata");
    }
    
    var pushRights  = ['1#create','2#read','3#update','4#delete'];
    var pushUsers   = ['joerg#12345','Vanessa#xyz'];
    var pushRoles   = ['1#1#RandomGuys#create,read#overwrite#joerg,vanessa',
                       '2#1#Boss#read#overwrite#vanessa'];

    /* clear tables */
    db.get('rights').drop();
    db.get('users').drop();
    db.get('roles').drop();
    
    /* push test rights */
    var collection = db.get('rights');
    pushRights.forEach(function(item){
                        var token = item.split("#");
                        collection.insert({id:String(token[0]),name:String(token[1])})
                       
                        if(DEBUG_OF_RIGHTMANAGEMENT){
                            console.log("pushing testright: "+String(token[1]));
                        }
                       });
    
    /* push test users */
    collection = db.get('users');
    pushUsers.forEach(function(item){
                        var token = item.split("#");
                        collection.insert({username:String(token[0]),password:String(token[1])});
                      
                        if(DEBUG_OF_RIGHTMANAGEMENT){
                            console.log("pushing testuser: "+String(token[0]));
                        }
                       });
    
    /* push test roles */
    collection = db.get('roles');
    pushRoles.forEach(function(item){
                      var token = item.split("#");
                      
                      var aID        = String(token[0]);
                      var aContextID = String(token[1]);
                      var aName      = String(token[2]);
                      var someRights = String(token[3]).split("#");
                      var aMode      = String(token[4]);
                      var someUser   = String(token[5]).split("#");
                      
                      collection.insert({id:aID,
                                        contextID:aContextID,
                                        name:aName,
                                        rights:someRights,
                                        mode:aMode,
                                        users:someUser});
                      
                      if(DEBUG_OF_RIGHTMANAGEMENT){
                        console.log("pushing testrole: "+aName);
                      }
                      });
};

var RightManager = function() {
    fillCurrentDbWithTestData();
    
    var possibleAccessRights = [];
    
    /**
     *		The function is needed to initialize the RightManager
     *
     */
    this.init = function(){
      /* get all exiting access rights from the database */
      var collection = db.get('rights');
      collection.find({},{},function(e,docs){
                      if(docs != undefined){
                        docs.forEach(function(entry){
                                   
                                   if(DEBUG_OF_RIGHTMANAGEMENT){
                                   console.log("adding right: "+String(entry.name));
                                   }
                                   
                                   possibleAccessRights.push(entry.name);
                                   });
                      }

                      });

	  console.log("RightManager has been initialized");
  };
    
  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {type}       command     The used command (access right), e.g., read, write (CRUD)
   *	@param {type}       object      The object that should be checked
   *    @param {type}       user        The username of the user
   *    @param {function}   callback    The callback function with one boolean parameter (the answer)
   */
  this.hasAccess = function(command, object, user, callback) {
      /* check if command is feasible */
      var commandIsInPossibleAccessRights = (possibleAccessRights.indexOf(String(command)) != -1);
      if(commandIsInPossibleAccessRights){
      
          /* (1) get the roles that include the current command within the context of
           the given object */
          var collection = db.get('roles');
          collection.find({contextID:String(object.id)},{},function(e,docs){
                          var found = false;
                            docs.forEach(function(item){
                                         var commandIsInRights = (String(item.rights).split(",").indexOf(String(command)) != -1);
                                         
                                         if(commandIsInRights){
                                            if(DEBUG_OF_RIGHTMANAGEMENT){
                                                console.log("Command is used in Role "+item.name)
                                            }
                                         
                                            /* (2) check if current user is inside of one of these roles */
                                            var userIsInUserList = (String(item.users).split(",").indexOf(String(user)) != -1)

                                            if(userIsInUserList){
                                                 /* (3) if (2) is fulfilled return true */
                                                found = true;
                                            }
                                         }
                                       });
                          
                          if(found){
                            callback(true);
                          }else{
                            callback(false);
                          }
                          
                          });
          
      }else{
         console.log("<<DEBUG INFORMATION>> The given command was not valid");
      }
    //return true;
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
   *	@param {type}   role      The role that should be changed
   *	@param {type}   grant     The grant paramter is set to true, if the access right should be
   *        granted. Set false, to revoke access.
   *	A call could look like this: modifyAccess("read","AB","reviewer", true);
   */
  this.modifyAccess = function(command, object, role, grant) {
      /* check if command is feasible */
      var commandIsInPossibleAccessRights = (possibleAccessRights.indexOf(String(command)) != -1);
      if(commandIsInPossibleAccessRights){
          
          /* (1) get the current role */
          var collection = db.get('roles');
          collection.find({contextID:String(object.id),name:String(role)},{},function(e,docs){
                          docs.forEach(function(item){
                                       /* (2) update role */
                                       if(grant == true){
                                        console.log("command = "+command);
                                       
                                        /* store to database */
                                        collection.update({_id : item._id},{ $addToSet : {rights : command}});
                                       }else{
                                         collection.update({_id : item._id},{ $pull : {rights : command}});
                                        }
                                       
                                       });
                          });
          
      }else{
          console.log("<<DEBUG INFORMATION>> The given command was not valid");
      }
  };
};

module.exports = new RightManager();