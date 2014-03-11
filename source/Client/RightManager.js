// This is the client side ObjectManager

"use strict";

var Modules=false;

/**
 * Object providing functions for object management
 */
var RightManager={};

RightManager.hasAccess = function(command, object) {
    
    Modules.SocketClient.serverCall('hasAccess',{
                                    'command':command,
                                    'object':object.toJSON()
                                    });

    return true;
};

RightManager.grantAccess = function(command, object, role) {

};

RightManager.revokeAccess = function(command, object, role) {

};

RightManager.modifyAccess = function(command, object, role, grant) {
    // do nothing
};

