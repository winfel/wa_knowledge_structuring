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
    
      var child = exec(cmd, [], { cwd: path, detached: true });
        
        //delegate the processing of stdout to another function
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        child.stderr.on('data', function (data) {
            console.error("error" + data.toString());
        });

        child.on('exit', function (code) {
            if (!(_.isNull(callback) || _.isUndefined(callback))) {
                return callback(true, ">>> Etherpad-lite died with exit code " + code + ", maybe it's already running? <<<");
            }
        });
        
       child.unref();
       
       if (!(_.isNull(callback) || _.isUndefined(callback))) {
           callback(false, "Etherpad-lite has been initialized");
       }
    }
    
} else {
   // On any other OS 
    EtherpadLauncher.launch = function(callback) {
        if (!(_.isNull(callback) || _.isUndefined(callback))) {
            callback(true, "Etherpad-lite auto-run is not yet supported for your OS, do it manually!!");
        }
    }
}

module.exports = EtherpadLauncher;