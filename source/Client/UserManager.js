// This is the client side ObjectManager

"use strict";

var Modules=false;

/**
 * Object providing functions for object management
 */
var UserManager={};

UserManager.addRole = function(role, object) {
    this.modifyRole(role, object, true);
};

UserManager.removeRole = function(role, object) {
    this.modifyRole(role, object, false);
};

UserManager.modifyRole = function(role, object, grant) {
    // do nothing
};

UserManager.addUser = function(role, object, user) {
    // do nothing
};

UserManager.removeUser = function(role, object, user) {
    // do nothing
};

UserManager.getRoles = function(object, user, callback) {
    
    Dispatcher.registerCall( "umGetRoles"+object.id, function(data){
                            // call the callback
                            callback(data);
                            
                            // deregister
                            Dispatcher.removeCall("umGetRoles"+object.id);
                            });
    
    Modules.SocketClient.serverCall('umGetRoles', {
                                    'object': object,
                                    'username': user
                                    });
    
};

