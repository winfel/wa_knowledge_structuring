/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');

/**
 * onMoveOutside is called when an object was move to a certain position. Therefor
 * the mouse button must not be released. It is enough if the mouse cursor stands
 * still for a short amount of time.
 * 
 * @param {type} object
 * @param {type} data
 * @returns {undefined}
 */
theObject.onMoveOutside = function(object, data) {

  if (object.getAttribute("type") == "Viewer") {
    this.setAttribute("xPrev", this.getAttribute("x"));
    this.setAttribute("yPrev", this.getAttribute("y"));
  }
};

theObject.onMoveWithin = function(object, data) {
  // Do nothing...
};

theObject.onEnter = function(object, oldData, newData) {
  /*method to set secondaryTags by dragging a text object onto the file--->Maybe we use it in the future
   var name = object.getAttribute('name');
   if(this.getAttribute('secondaryTags')==0){
   var values = new Array();
   console.log(values);
   values.push(name);
   this.setAttribute('secondaryTags', values);
   console.log(values);
   }
   else{
   var value = this.getAttribute('secondaryTags');
   console.log(value);
   value.push(name);
   this.setAttribute('secondaryTags', value);
   console.log(value);
   }
   */
  
  // console.log("File.onEnter: " + object.getAttribute("type") + " " + object.getAttribute("id"));
  if (object.getAttribute("type") == "Viewer") {
    object.setAttribute("file", this.getAttribute("id"));

    this.setAttribute("x", this.getAttribute("xPrev"));
    this.setAttribute("y", this.getAttribute("yPrev"));
  }

  this.fireEvent('enter', object);
};

module.exports = theObject;