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
	var that = this;

	if(object.getAttribute("type") == "File") {
		if(object.getAttribute('mimeType').match(/.*\/pdf$/)) {
			// search for hidden file, connected to this pdf (by attribute belongsTo or by name)
			Modules.Connector.getObjectDataByQuery({
				// TODO: maybe add room??
				mimeType:'text/html',
				type:'HiddenFile',
				$or: [
					{belongsTo: object.getAttribute("id")}, // new style
					{name: object.getAttribute("id") + '.html'} // old style
				]
			},
			function(obj){
				if(obj.length) {
					// currently, we are only interested in the first converted document, but maybe we have a better plan?
					that.set("file", obj[0].id);
					that.set('highlights', obj[0].attributes.highlights || '');
					that.persist();
				}
				else {
					// convert pdf on demand
					console.log('convert pdf on demand');
					Modules.EventBus.emit('pdfAdded', {
						object: object,
						callback: function(newObjectId) {
							that.set("file", newObjectId);
							that.set('highlights', '');
							that.persist();
						}
					});
				}
			});
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