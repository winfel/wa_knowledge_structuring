/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
* @class EtherpadLauncher
* @classdesc This checks if Etherpad is running if not then etherpad is launched
* @requires ./Server/config.default
* @requires ./Server/controllers/EtherpadController
* @requires child_process
* @requires underscore
* @requires os
*/

var os = require('os');
var _ = require('underscore');
var exec = require('child_process').spawn;

var ETHP_ERROR_CODE = -1;

var EtherpadLauncher = {};
var modules = false;

EtherpadLauncher.init = function(theModules) {
    modules = theModules;
    return this;
};

EtherpadLauncher.launch = function() {
    
    if (global.config.etherpadlite.startFilePath != '') {
    
        // First if Etherpad is already running 
        this.isRunning(function (running) {
            if (running) {
                console.log("Etherpad is running");
            } else {
                EtherpadLauncher.launchEtherPad(null);
            }
        });
    } else {
        console.error('\x1B[31;1meetherpadlite.startFilePath is not defined in config.local.js.\n' +
                'Copy the appropriate settings from config.default.js.\x1B[39m');
    }
}

EtherpadLauncher.isRunning = function(callback) {
    var running = false; 
    
    modules['EtherpadController'].pad.listPads({groupID: '1111'}, function(error, data) {
        if (error.code != ETHP_ERROR_CODE) {
            running = true; 
        }
        
        callback(running);
    });
}

// on windows 
if(os.type().indexOf("Windows") > -1) {
    
    EtherpadLauncher.launchEtherPad = function(callback) {
        
      var path = modules.Helper.addTrailingSlash(global.config.etherpadlite.startFilePath);   
      var cmd = path + global.config.etherpadlite.startFile; 
      //var cmd = "node";
      //var parm = "node_modules\\ep_etherpad-lite\\node\\server.js";
      
      console.log("running " + cmd );
    
      var child = exec(cmd, [], { cwd: path, detached: true });
      
        child.on('error', function(data) {
            console.warn("error" + data.toString());
        });
        
        //delegate the processing of stdout to another function
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        child.stderr.on('data', function (data) {
            console.error("error" + data.toString());
        });

        child.on('exit', function (code) {
            console.warn(">>> Etherpad-lite died with exit code " + code + ", maybe it's already running? <<<");
        });
        
       child.unref();
       
       // console.log("Etherpad-lite has been initialized");
       
       if (!(_.isNull(callback) || _.isUndefined(callback))) {
           callback();
       }
    }
    
} 

else if(os.type().indexOf("MAC") > 0) {
	EtherpadLauncher.launchEtherPad = function(callback) {
        
	      var path = modules.Helper.addTrailingSlash(global.config.etherpadlite.startFiePath);   
	      var cmd = path + global.config.etherpadlite.startFile; 
	      //var cmd = "node";
	      //var parm = "node_modules\\ep_etherpad-lite\\node\\server.js";
	      
	      console.log("running " + cmd );
	    
	      var child = exec(cmd, [], { cwd: path, detached: true });
	      
	        child.on('error', function(data) {
	            console.warn("error" + data.toString());
	        });
	        
	        //delegate the processing of stdout to another function
	        child.stdout.on('data', function (data) {
	            console.log(data.toString());
	        });

	        child.stderr.on('data', function (data) {
	            console.error("error" + data.toString());
	        });

	        child.on('exit', function (code) {
	            console.warn(">>> Etherpad-lite died with exit code " + code + ", maybe it's already running? <<<");
	        });
	        
	       child.unref();
	       
	       // console.log("Etherpad-lite has been initialized");
	       
	       if (!(_.isNull(callback) || _.isUndefined(callback))) {
	           callback();
	       }
	    }
	    
}

else {
   // On any other OS 
    EtherpadLauncher.launchEtherPad = function(callback) {
        console.warn("Etherpad-lite auto-run is not yet supported for your OS, do it manually!!");
        
        if (!(_.isNull(callback) || _.isUndefined(callback))) {
          callback();
        }
    }
}

module.exports = EtherpadLauncher;