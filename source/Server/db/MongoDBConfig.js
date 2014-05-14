/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 @class MongoDBConfig
*    @classdesc manages the configuration data of mongodb
*/

"use strict";

var MongoDBConfig = {},
    uri;

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
MongoDBConfig.init = function() {
    uri = createURI();
}

MongoDBConfig.getURI = function() {
    return uri; 
}

//URI Format: http://docs.mongodb.org/manual/reference/connection-string/
// example 'mongodb://username:password@host:port/database?options...';
var createURI = function() {
    var uri = 'mongodb://';
    
    uri += ((global.config.mongodb.user != '') && (global.config.mongodb.password != '')) ? 
            global.config.mongodb.user + ":" + global.config.mongodb.password + "@" : "";
    
    uri += global.config.mongodb.host;
    uri += (global.config.mongodb.port != '') ? ":" + global.config.mongodb.port : "";
    uri += (global.config.mongodb.dbname != '') ? "/" + global.config.mongodb.dbname : "";
    
    return uri;
};

module.exports = MongoDBConfig;