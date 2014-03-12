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
    // TODO
    var p = new PaperEntity();
    p.createNew(null);
}

theObject.createReview = function() {
    // TODO
}

theObject.exportFile = function() {
    // TODO
}

theObject.open = function() {
    // TODO
}

theObject.deleteIt = function() {
    // TODO
}

theObject.addChild = function() {
    // TODO
}

theObject.deleteChild = function() {
    // TODO
}

theObject.publish = function() {
    // TODO
}

theObject.commonRegister = theObject.register;

module.exports = theObject;