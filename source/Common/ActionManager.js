"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2010
*
*/

/**
* @class ActionManager
* @classdesc This is the Actionmanager
*
*/


var ActionManager=Object.create(Object);

ActionManager.proto=false;
ActionManager.actions=false;

/**
* @function init
* @param proto
*/
ActionManager.init=function(proto){
	
	this.proto=proto;
	this.actions={};
}

/**
* @function toString
* @return {String}
*/
ActionManager.toString=function(){
	return 'ActionManager for '+this.proto;
}


/**
* @function registerAction
* @param name
* @param func
* @param single
* @param visibilityFunc
* @return {ActionManager}
*/
ActionManager.registerAction=function(name,func,single,visibilityFunc){
	
	this.actions[name] = {
		"func": func,
		"single": single,
		"visibilityFunc": visibilityFunc,
	};
	
	return this;
	
}

/**
* @function unregisterAction
* @param name
* @return {ActionManager}
*/
ActionManager.unregisterAction=function(name){
	delete(this.actions[name]);
	return this;
}

/**
* @function performAction
* @param name
* param clickedObject
* @return {ActionManager}
*/
ActionManager.performAction=function(name, clickedObject){
	
	if (!this.actions[name]) {
		debug(this + ' has no action ' + name);
		return;
	}
	
	this.actions[name]["func"](clickedObject);
	
	return this;

}

/**
* @function getActions
* @return {ActionManager}
*/
ActionManager.getActions=function(){
	return this.actions;
}

module.exports=ActionManager;