
/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
* @class MongoDBLauncher
* @classdesc This checks if MongoDB is running if not then MongoDB is launched
* @requires ./Server/config.default
* @requires child_process
* @requires underscore
* @requires mongoose
* @requires os
*/

var os = require('os');
var _ = require('underscore');
var mongoose = require('mongoose');
var exec = require('child_process').exec;

var MongoDBLauncher = {};
var modules = false;

MongoDBLauncher.init = function(theModules) {
    modules = theModules;
    return this;
};

MongoDBLauncher.launch = function() {
    
    if (global.config.mongodb.host != '') {
    
        // First check if MongoDB is already running 
        this.isRunning(function (running) {
            if (running) {
                console.log("Mongo is running...");
            } else {
                MongoDBLauncher.launchMongo(null);
            }
        });
    }
}

MongoDBLauncher.isRunning = function(callback) {
    var running = false; 
    var uri = modules.MongoDBConfig.getURI();
    
    mongoose.connect(uri);
    var db = mongoose.connection;
    
    db.on('error', function() {
        if (!(_.isNull(callback) || _.isUndefined(callback))) {
            callback(running);
        }   
    });
    
    db.once('open', function() {
        running = true; 
        if (!(_.isNull(callback) || _.isUndefined(callback))) {
            callback(running);
        }   
        
        // closes the connection since we just opened it to check if mongoDB
        // is currently running 
        this.close();
    });
    
    db.on('close', function() {
        //console.log("XP");
    });
}

// on windows 
if (os.type().indexOf("Windows") > -1) {
    
    MongoDBLauncher.launchMongo = function(callback) {
        var cmd = "mongod";
        
        var child = exec(cmd, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            
            if (error !== null) {
              console.warn('exec error: ' + error);
              console.warn('MongoDB could not be initialized');
            } else {
                console.log("Mongo is now running...");
            }
        });
          
         child.unref();
         
         if (!(_.isNull(callback) || _.isUndefined(callback))) {
             callback();
         }   
    }
    
} else {

    // On any other OS 
    MongoDBLauncher.launchMongo = function(callback) {
        console.warn("MongoDB auto-run is not yet supported for your OS, do it manually!!");

        if (!(_.isNull(callback) || _.isUndefined(callback))) {
            callback();
        }
    }
}

module.exports = MongoDBLauncher;