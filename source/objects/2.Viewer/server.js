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

  if (object.getAttribute("type") == "File") {
		if(object.getAttribute('mimeType').match(/.*\/pdf$/)) {
			this.setAttribute("file", object.getAttribute("id"));
		}

    object.setAttribute("x", object.getAttribute("xPrev"));
    object.setAttribute("y", object.getAttribute("yPrev"));
  }

  this.fireEvent('enter', object);
};

/**
 * onMoveOutside is called when an object was move to a certain position. Therefor
 * the mouse button must not be released. It is enough if the mouse cursor stands
 * still for a short amount of time.
 * 
 * @param {type} object
 * @param {type} data
 * @return {undefined}
 */
theObject.onMoveOutside = function(object, data) {

  if (object.getAttribute("type") == "File") {
    object.setAttribute("xPrev", object.getAttribute("x"));
    object.setAttribute("yPrev", object.getAttribute("y"));
  }
};

module.exports=theObject;