/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

/**
* @class Log
* @classdesc This is the Log
*
*/


"use strict";


var Log={};
var Modules = false;

Log.colors = {
	"info" 	: '\u001b[0m',
	"error" : '\u001b[31m',
	"warn" 	: '\u001b[33m',
	"debug" : '\u001b[34m',
	"reset" : '\u001b[0m',
}

Log.linebreak = '\n';

/**
* @function init
* @param theModules
*/
Log.init=function(theModules){
	Modules=theModules;
}

/**
* @function getTime
* @return proto
*/
Log.getTime=function() {
	var date = new Date();
	return date.toLocaleString();
}

/**
* @function getLogString
* @param message
* @param color
* @return {String}
*/
Log.getLogString=function(message,color) {
	return color+""+Log.getTime()+"   "+message+""+Log.colors.reset+"\n";
}

/**
* @function info
* @param message
*/
Log.info=function(message) {
	if (!Modules.Config.logLevels.info) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.info));
	
}

/**
* @function error
* @param message
*/
Log.error=function(message) {

	if (message.stack === undefined) {
		//Log.error was directly called --> create real error (to get stack)
		throw new Error(message);
	}

	var msg = message.stack;
	
	//var lines = msg.match(/^.*((\r\n|\n|\r)|$)/gm);
	//lines.splice(1,1);
	//msg = lines.join("");

	console.error(Log.getLogString(msg,Log.colors.error));

}

/**
* @function warn
* @param message
*/
Log.warn=function(message) {
	if (!Modules.Config.logLevels.warn) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.warn));
	
}

/**
* @function debug
* @param message
*/
Log.debug=function(message) {
	if (!Modules.Config.logLevels.debug) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.debug));
	
}

/**
* @function getUserFromContext
* @param context
* @return {String} username
*/
Log.getUserFromContext=function(context) {
	if (context === true) {
 		return "root";
	} else {
		return context.user.username;
	}
}


module.exports=Log;