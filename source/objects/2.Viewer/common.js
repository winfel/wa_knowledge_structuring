/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

var Modules = require('../../server.js');

var Viewer = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Viewer.register = function(type) {
  var that = this;
  
  // Registering the object
  GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
  GeneralObject.register.call(this, type);

  this.registerAttribute('file', {type: 'text', changedFunction: function(object, value) {
      object.reloadDocument(value);
    }});
  this.registerAttribute('highlights', {type: 'text', standard: '', changedFunction: function(object, value) {
      object.loadHighlights();
    }});
  this.registerAttribute('twopage', {type: 'boolean', standard: false, changedFunction: function(object, value) {
      object.adjustPaper();
    }});
  
  Modules.Dispatcher.registerCall("dbDocumentAdded_comments", function(data) {
    that.addComment(data.user, data.id, data.data);
  });
  
  Modules.Dispatcher.registerCall("dbDocumentRemoved_comments", function(data) {
    that.removeComment(data.id, "comment", "commented");
  });
  
  Modules.Dispatcher.registerCall("dbDocumentAdded_comments_audio", function(data) {
    that.addComment(data.user, data.id, data.data);
  });
  
  Modules.Dispatcher.registerCall("dbDocumentRemoved_comments_audio", function(data) {
    that.removeComment(data.id, "audioobject", "audio");
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