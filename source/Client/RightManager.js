// This is the client side ObjectManager

"use strict";

var Modules=false;

/**
 * Object providing functions for object management
 */
var RightManager={};

RightManager.hasAccess = function(command, object) {
    
    return true;
};

RightManager.grantAccess = function(command, object, role) {

};

RightManager.revokeAccess = function(command, object, role) {

};

RightManager.modifyAccess = function(command, object, role, grant) {
    // do nothing
};

