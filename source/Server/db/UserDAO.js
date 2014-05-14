/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 @class UserDAO
*    @classdesc DAO Access the User collection
*/

"use strict";

var db = null;
var Modules = false;
var UserDAO = {};

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
UserDAO.init = function(theModules) {
    Modules = theModules;
    db = require('monk')(Modules.MongoDBConfig.getURI());
}

UserDAO.usersByUserName = function(username, callback) {
    var users = db.get('users');
    users.find({username: username}, {}, callback);
}

UserDAO.usersById = function(id, callback) {
    var users = db.get('users');
    users.findById(id, callback);
}

UserDAO.createUsers = function(newUserAttr, callback) {
    var users = db.get('users');
    users.insert({username: newUserAttr.login, password: newUserAttr.password, e_mail: newUserAttr.e_mail }, callback);
}

module.exports = UserDAO;