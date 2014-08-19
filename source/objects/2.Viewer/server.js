/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

theObject.onEnter = function(object, data) {
  //console.log("Viewer.onEnter: " + object.getAttribute("type") + " " + object.getAttribute("id"));
  
};

module.exports=theObject;