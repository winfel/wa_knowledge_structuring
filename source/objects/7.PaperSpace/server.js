/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');


theObject.createNew = function() {
    
}

theObject.commonRegister = theObject.register;

module.exports = theObject;