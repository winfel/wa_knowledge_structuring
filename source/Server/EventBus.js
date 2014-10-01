

"use strict";

var EventEmmiter2 = require('eventemitter2').EventEmitter2;
var Modules = false;

/**
*   @class EventBus
*   @classdesc Creates a Event emmiter
*   @requires eventemitter2
*/
var myEmmiter = new EventEmmiter2({
	wildcard: true,
	delimiter: '::'
});

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
myEmmiter.init = function(theModules){
    Modules = theModules;
}

module.exports = myEmmiter;