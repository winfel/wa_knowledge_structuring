/**
 * Launches etherpad-lite 
 */


var os = require('os');
var _ = require('underscore');
var exec = require('child_process').spawn;

var EtherpadLauncher = {};
var modules = false;

EtherpadLauncher.init = function(theModules) {
    modules = theModules;
    return this;
};

// on windows 
if(os.type().indexOf("Windows") > -1) {
    
    EtherpadLauncher.launch = function(callback) {
        
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
            if (!(_.isNull(callback) || _.isUndefined(callback))) {
                console.warn(">>> Etherpad-lite died with exit code " + code + ", maybe it's already running? <<<");
            }
        });
        
       child.unref();
       
       // console.log("Etherpad-lite has been initialized");
       
       if (!(_.isNull(callback) || _.isUndefined(callback))) {
           callback();
       }
    }
    
} else {
   // On any other OS 
    EtherpadLauncher.launch = function(callback) {
        console.warn("Etherpad-lite auto-run is not yet supported for your OS, do it manually!!");
        
        if (!(_.isNull(callback) || _.isUndefined(callback))) {
          callback();
        }
    }
}

module.exports = EtherpadLauncher;