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
				inRoom: that.getAttribute('inRoom'),
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
						inRoom: that.getAttribute('inRoom'), // the hidden file should be created in same room as viewer
						callback: function(newObjectId) {
							that.set("file", newObjectId);
							that.set('highlights', '');
							that.persist();
						}
					});
				}
			});
		}
		if(data) { // if data is not present, it wasn't a real object from this room
			object.setAttribute("x", object.getAttribute("xPrev"));
			object.setAttribute("y", object.getAttribute("yPrev"));
		}
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

/**
 * referenceDropped is called, when a reference is dropped from reference container. The document might be in a different room and we get only the fileId.
 */
theObject.referenceDropped = function(fileId, callback) {
	var that = this;
	// if we set the roomId to current room, the returned object appears to be in this room - but this is bad, as we now steal the objects, if anything is changed (setAttribute('progress') also changes the room - unintentionally)
	// TODO: get real room of object - or get it another way (I have an idea)
	Modules.ObjectManager.getObject(false, fileId, that.context, function(object){
		//object.fireEvent('enter', that); // doesn't work/not implemented
		that.onEnter(object, false);
	});
};
theObject.referenceDropped.public = true;

module.exports=theObject;