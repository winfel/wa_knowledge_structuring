/**
*	@class KokoaConnector
*	@requires FileConnector
*	@requires bcrypt
*	@requires lodash
*	@requires Log 
*	@requires config
*/


"use strict";

var kokoaConnector = require('./FileConnector.js');
var bcrypt = require('bcrypt');
var _ = require('lodash');

/**
*	@function login
*	@param username
*	@param password
*	@param externalSession
*	@param context
*	@param {Function} callback The callback function for correct and false login data
*/
kokoaConnector.login = function (username, password, externalSession, context, callback) {
    var self = this;
    var config = this.Modules.config;

    if (!config.kokoa) this.Modules.Log.debug("Kokoa configuration is missing!");
    if (!config.kokoa.logins) this.Modules.log.debug("Kokoa: no logins are configured.");

    var logins = config.kokoa.logins;

    var checkLogin = function (username, password) {
        var hash = logins[username];
        bcrypt.compare(password, hash, function (err, res) {
            if (err || res === false) {
                callback(false)
            } else {
                callback({
                    username: username,
                    password: password
                });
            }
        });
    }

    checkLogin(username, password);
}


/**
*	@function mayAnything
*	@param roomID
*	@param connection
*	@param {Function} callback The callback function
*/

kokoaConnector.mayAnything = function (roomID, connection, callback) {
    var config = this.Modules.config;
    var username = connection.user.username;

    if (!config.kokoa) this.Modules.Log.debug("Kokoa configuration is missing!");
    if (!config.kokoa.access) this.Modules.Log.debug("Kokoa access configuration is missing!");

    var mayAccess = _.contains(config.kokoa.access[roomID], username);

    callback(null, mayAccess);
}

kokoaConnector.mayEnter = kokoaConnector.mayAnything;

module.exports = kokoaConnector;