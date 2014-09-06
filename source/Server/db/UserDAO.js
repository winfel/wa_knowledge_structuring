/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author University of Paderborn, 2014
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

/**
* @param username
* @param callback
*/
UserDAO.usersByUserName = function(username, callback) {
    var users = db.get('users');
    users.find({username: username.toLowerCase()}, {}, callback);
}

/**
* @param id
* @param callback
*/
UserDAO.usersById = function(id, callback) {
    var users = db.get('users');
    users.findById(id, callback);
}

/**
* @param newUserArrt
* @param callback
*/
UserDAO.createUsers = function(newUserAttr, callback) {
    var users = db.get('users');
    users.insert({username: newUserAttr.login.toLowerCase(), password: newUserAttr.password, e_mail: newUserAttr.e_mail }, callback);
}

/**
* @param id
* @param newUserAttr
*/
UserDAO.updateUsersById = function(id, newUserAttr) {
    var users = db.get('users');
    users.update({_id:id}, {$set:newUserAttr});
}

module.exports = UserDAO;