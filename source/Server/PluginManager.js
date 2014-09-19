/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 * @class PluginManager
 * @classdesc Imports all chosen Plugins. However, at the present point in time, no plugins are used within the WebArena.
 */
"use strict";

var PluginManager = {};

/**
 *  This functinn gets a list of Plugins and loads them
 *
 * @param moduleRegistry - server modules
 * @param {Object} modulesToLoad - a list of module-names of module locations that should be loaded
 *        {
 *          "pluginName" : "moduleName"
 *          ......OR......
 *          "pluginName" : "moduleLocation"
 *        }
 * @return {object} An instance of the PluginManager
 */
PluginManager.init = function (moduleRegistry, modulesToLoad) {
	this.loadedPlugins = {};
	for(var moduleName in modulesToLoad){
		try{
			this.loadedPlugins[moduleName] = require(modulesToLoad[moduleName]).create();

			//TODO - perhaps use wrapper around EventBus if need to filter messages that shouldn't be available to plugins like login credentials
			this.loadedPlugins[moduleName].init(moduleRegistry);
		} catch(e){
			console.log("error loading: " + moduleName);
			//TODO - do some error handling....
		}
	}
	return this.loadedPlugins;
};

/**
 * Create a PluginManager instance. Normally there should be only one.
 *
 * @return {PluginManager|*}
 */
function create() {
	return Object.create(PluginManager);
}

module.exports = {create: create};