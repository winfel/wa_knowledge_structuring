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

