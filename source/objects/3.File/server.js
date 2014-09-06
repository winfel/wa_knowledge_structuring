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
 * @param {type} object
 * @param {type} oldData
 * @param {type} newData
 */
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

  this.fireEvent('enter', object);
};

module.exports = theObject;