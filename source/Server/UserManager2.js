var db = require('monk')('localhost/WebArena')
var DEBUG_OF_USERMANAGEMENT = false;

var UserManager2 = function() {

    var possibleAccessRights = [];
    
    this.init = function(){
        /* get all exiting access rights from the database */
        var collection = db.get('rights');
        collection.find({},{},function(e,docs){
                        if(docs != undefined){
                        docs.forEach(function(entry){
                                     
                                     if(DEBUG_OF_USERMANAGEMENT){
                                     console.log("adding right: "+String(entry.name));
                                     }
                                     
                                     possibleAccessRights.push(entry.name);
                                     });
                        }
                        
                        });
        if(DEBUG_OF_USERMANAGEMENT){
            console.log("UserManager has been initialized");
        }
    };
    
    /**
     *	The function can be used to add a role
     *
     * @param {type} role   The used role passed as a RoleObject
     * @param {type} object The object that should be used to change the access right
     *
     *	A call could look like this: modifyAccess(ReviewRole.create(),"AB");
     */
    this.addRole = function(role, object) {
        this.modifyRole(role, object, true);
    };
    
    /**
     *	The function can be used to remove a role
     *
     * @param {type} role   The used role passed as a RoleObject
     * @param {type} object The object that should be used to change the access right
     * @returns {undefined}
     */
    this.removeRole = function(role, object) {
        this.modifyRole(role, object, false);
    };
    
    /**
     *	The function can be used to modify a role
     *	@param {type}	role    The used role passed as a RoleObject
     *	@param {type}	object  The object that should be used to change the access right
     *	@param {type}   add   The grant paramter is set to true, if the access right should be
     *			granted. Set false, to revoke access.
     *	A call could look like this: modifyAccess(ReviewRole.create(),"AB", true);
     */
    this.modifyRole = function(role, object, add) {
        var collection = db.get('roles');
        
        /* create empty arrays if the arrays are not exisiting */
        if(role.rights == null){
            role.rights = [];
        }
        
        if(role.users == null){
            role.users = [];
        }
        
        /* default mode = overwrite */
        if(role.mode == null){
            role.mode = "overwrite";
        }
        
        /* add resp. remove the role */
        if(add == true){
            collection.insert({id:role.id,
                              contextID:object.id,
                              mode:role.mode,
                              name:role.name,
                              rights:role.rights,
                              users:role.users});
            
        }else{
            console.log("trying to remove : " + object.id + " | " + role.name);
            collection.remove({contextID:String(object.id),
                            name:String(role.name)});
        }
    };
    
    /**
     *	The function can be used to add a user to a specific role
     *	@param {type}	role    The used role passed as a RoleObject
     *	@param {type}	object  The object that should be used to get the specfic role
     *	@param {type}   user    The user object that should be added
     */
    this.addUser = function(role, object, user) {
        this.modifyUser(role,object,user,true);
    };
    
    /**
     *	The function can be used to remove a user to a specific role
     *	@param {type}	role    The used role passed as a RoleObject
     *	@param {type}	object  The object that should be used to get the specfic role
     *	@param {type}   user    The user object that should be added
     */
    this.removeUser = function(role, object, user) {
        this.modifyUser(role,object,user,false);
    };
    
    /**
     *	The function can be used to remove a user to a specific role
     *	@param {type}	role    The used role passed as a RoleObject
     *	@param {type}	object  The object that should be used to get the specfic role
     *	@param {type}   user    The user object that should be added
     */
    this.modifyUser = function(role, object, user, add) {
        /* (1) get the current users */
        var collection = db.get('roles');
        collection.find({contextID:String(object.id),name:String(role)},{},function(e,docs){
                        docs.forEach(function(item){
                                     /* (2) update role */
                                     if(add == true){
                                     /* store to database */
                                        collection.update({_id : item._id},{ $addToSet : {users : user.name}});
                                     }else{
                                        collection.update({_id : item._id},{ $pull : {users : user.name}});
                                     }
                                     
                                     });
                        });
    };

    
};

module.exports = new UserManager2;