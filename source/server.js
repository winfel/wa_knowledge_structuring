/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
* @class Server
* @classdesc This is the description of the main server file and the required modules
* @requires ./Server/config.default
* @requires ./Server/config.local
* @requires ./Common/Log
* @requires ./Server/ObjectManager
* @requires ./Server/Dispatcher
* @requires ./Server/WebServer
* @requires ./Server/SocketServer
* @requires ./Server/UserManager
* @requires ./Server/Helper
* @requires ./Server/EventBus
* @requires ./Server/BuildTool
* @requires ./Common/DataSet
* @requires ./Common/AttributeManager
* @requires ./Common/TranslationManager
* @requires ./Common/ActionManager
* @requires ./Server/TcpSocketServer
* @requires ./Server/controllers/RoomController
* @requires ./Server/controllers/ObjectController
* @requires ./Server/controllers/ServerController
* @requires ./Server/controllers/EtherpadController
* @requires ./Server/apihandler/InternalDispatcher
* @requires ./Server/PluginManager
*
*/

/**
* Prints the logo of the WebArena Server
* @function printLogo 
*
*/
var printLogo = function(){
   var logo = ['##########################################',
            	'#    W E B A R E N A   S E R V E R       #',
            	'#                                        #',
            	'#    (c) 2012-13 Contextual Informatics, #',
            	'#                Universität Paderborn   #',
            	'#                                        #',
            	'#    Main contributors:                  #',
            	'#                                        #',
            	'#        Felix Winkelnkemper             #',
            	'#        Tobias Kempkensteffen           #',
            	'#        Viktor Koop                     #',
            	'#        Jan Petertonkoker               #',
            	'#                                        #',
            	'##########################################'];

	logo.forEach(function(l) {
        console.log(l);
    });
}();

"use strict";

// Loading the configuration. Entires in config.local.js overlap those in config.default.js
var config = require('./Server/config.default.js');
try {
	var localconfig = require('./Server/config.local.js');
	for (var key in localconfig) {
		var value = localconfig[key];
		config[key] = value;
	}
} catch (e) {
	console.log('Attention: No local config: ' + e);
}

//make config available for modules
global.config = config;  

// General error handling. Let the server try to continue
// if an error occured and log the error
if (!config.debugMode) {
	process.on('uncaughtException', function (err) {
		console.log('##### UNCAUGHT EXCEPTION ' + new Date());
		console.log(err.stack);
	});
}

var Modules = {};

Modules.Log = require('./Common/Log.js');

// These modules are accessible everywhere by accessing the global variable Modules
// They shall exist only once for the whole server
Modules.config = config;
Modules.Config = config;

Modules.MongoDBConfig   = require('./Server/db/MongoDBConfig.js');
Modules.ObjectManager   = require('./Server/ObjectManager.js');
Modules.Dispatcher      = require('./Server/Dispatcher.js');
Modules.WebServer       = require('./Server/WebServerE.js');
Modules.SocketServer    = require('./Server/SocketServer.js');
Modules.UserManager     = require('./Server/UserManager.js');
Modules.DBManager       = require('./Server/DBManager.js');
Modules.Helper          = require('./Server/Helper.js');
Modules.EventBus        = require("./Server/EventBus.js");
Modules.BuildTool       = require('./Server/BuildTool.js');
//Modules.TokenChecker  = require("./Server/TokenChecker");
Modules.PdfEdit         = require('./Server/PdfEdit.js');

// These object exist for every object type or every single object. They shall not be
// modified directly but inherited (e.g. this.attributeManager=Object.create(AttributeManager));
Modules.DataSet             = require('./Common/DataSet.js');
Modules.AttributeManager    = require('./Common/AttributeManager.js');
Modules.TranslationManager  = require('./Common/TranslationManager.js');
Modules.ActionManager       = require('./Common/ActionManager.js');
Modules.RightManager        = require('./Server/RightManager.js');
//Modules.UserManager2      = require('./Server/UserManager2.js'); 
Modules.TagManager          = require('./Server/TagManager.js');

if (Modules.config.tcpApiServer) {
	Modules['TcpEventServer']  = require("./Server/TcpSocketServer.js").create();
}

Modules.Connector = Modules.config.connector; //shortcut

// Controllers
Modules.RoomController      = require('./Server/controllers/RoomController.js');
Modules.ObjectController    = require('./Server/controllers/ObjectController.js');
Modules.ServerController    = require('./Server/controllers/ServerController.js');
Modules.EtherpadController  = require('./Server/controllers/EtherpadController.js');

Modules.InternalDispatcher = require('./Server/apihandler/InternalDispatcher.js');

//DAO (Data Access Object) 
Modules.UserDAO  = require('./Server/db/UserDAO.js');

// Objects can gain access to the Modules (on the server side) by requiring this file
module.exports = Modules;

// Initialize all Modules if there is a init-function
for (var name in Modules) {
	var module = Modules[name];
	if (module.init) {
		module.init(Modules);
	}
}

//load plugins
if (Modules.config.plugins) {
	Modules.PluginManager = require('./Server/PluginManager.js').create();
	Modules.PluginManager.init(Modules, Modules.config.plugins);
}

// launchers
var mongoDBLauncher = require('./Server/launchers/MongoDBLauncher.js').init(Modules).launch();
var etherPadLauncher = require('./Server/launchers/EtherpadLauncher.js').init(Modules).launch(); 

