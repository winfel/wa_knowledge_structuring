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
     *	@param {type} grant   The grant paramter is set to true, if the access right should be
     *					 granted. Set false, to revoke access.
     *	A call could look like this: modifyAccess(ReviewRole.create(),"AB", true);
     */
    this.modifyRole = function(role, object, grant) {
        var collection = db.get('roles');
        
        var modRole = role;
        
        console.log("currently not supported");
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
                                     collection.update({_id : item._id},{ $addToSet : {users : user}});
                                     }else{
                                     collection.update({_id : item._id},{ $pull : {users : user}});
                                     }
                                     
                                     });
                        });
    };

    
};

module.exports = new UserManager2;