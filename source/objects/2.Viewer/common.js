/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 */

var Modules = require('../../server.js');

var Viewer = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Viewer.register = function(type) {
  var that = this;

  // Registering the object
  GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
  GeneralObject.register.call(this, type);


  // Registers the available rights ...
//  this.registerRight("create", "You may create new content within this viewer.");
//  this.registerRight("read",   "You may access the content within this viewer.");
//  this.registerRight("update", "You may change the content within this viewer.");
//  this.registerRight("delete", "You may delete the content within this viewer.");
  // ... and default roles for this object.
//  this.registerDefaultRole("Reader", ["read"]);
//  this.registerDefaultRole("Coworker", ["create", "read"]);

  this.makeSensitive();
	this.registerAttribute('file', {type: 'text', changedFunction: function(object, value) {
			object.reloadDocument(value);
		},
		setFunction: function(object, value) {
			if(object.ObjectManager.isServer) {
				Modules.ObjectManager.getObject(
					object.getAttribute('inRoom'),
					value,
					true,
					function(obj){
						var highlights = obj.getAttribute('highlights');
						// set the value nontheless
						object.set('file', value);
						object.set('highlights', highlights);
					}
				);
			}
			else {
				object.set('highlights', ObjectManager.getObject(value).getAttribute('highlights'));
				// set the value nontheless
				object.set('file', value);
			}
		},
	});

	this.registerAttribute('highlights', {type: 'text', standard: '', changedFunction: function(object, value) {
console.log('Viewer.highlights changed');
			object.loadHighlights();
		},
		setFunction: function(object, value) {
			if(object.ObjectManager.isServer) {
				object.set('highlights', value);
				Modules.ObjectManager.getObject(
					object.getAttribute('inRoom'),
					object.getAttribute('file'),
					true,
					function(obj){
						obj.setAttribute('highlights', value);
					}
				);
			}
console.log('Viewer.highlights set');
		},
    });

  Modules.Dispatcher.registerCall("dbDocument_comments", function(data) {
    that.addComment(data.user, data.id || data._id, data.data);
  });

  Modules.Dispatcher.registerCall("dbDocument_comments_audio", function(data) {
    that.addComment(data.user, data.id || data._id, data.data);
  });

  Modules.Dispatcher.registerCall("dbDocumentAdded_comments", function(data) {
    that.addComment(data.user, data.id || data._id, data.data);
  });

  Modules.Dispatcher.registerCall("dbDocumentAdded_comments_audio", function(data) {
    that.addComment(data.user, data.id || data._id, data.data);
  });

  Modules.Dispatcher.registerCall("dbDocumentRemoved_comments", function(data) {
    that.removeComment(data.id || data._id, "comment", "commented");
  });

  Modules.Dispatcher.registerCall("dbDocumentRemoved_comments_audio", function(data) {
    that.removeComment(data.id || data._id, "audioobject", "audio");
  });

  Modules.Dispatcher.registerCall("dbAllDocumentsSend_comments", function(data) {
    that.updateStatus();
  });

  Modules.Dispatcher.registerCall("dbAllDocumentsSend_comments_audio", function(data) {
    that.updateStatus();
  });

  this.standardData.width = 210 * 3;
  this.standardData.height = 297 * 2;
};

Viewer.alwaysOnTop = function() {
  // if( documentShown )
  return true;
};

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

Viewer.restrictedMovingArea = true;
Viewer.isCreatable = true;
Viewer.category = 'Texts';

Viewer.register('Viewer');

module.exports = Viewer;