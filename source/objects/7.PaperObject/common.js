/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

var Modules = require('../../server.js');

/**
 * PaperObject
 * 
 * @class
 * @classdesc Common elements for view and server
 */

var PaperObject = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperObject.register = function(type) {

  // Registering the object
  IconObject = Modules.ObjectManager.getPrototype('IconObject');
  IconObject.register.call(this, type);

  var self = this;

  this.registerAction('Follow', function(object) {

    object.execute();

  }, true);

  this.registerAction('Open in new window', function(object) {

    object.execute(true);

  }, true);

  this.registerAction('Store in Tab-List', function(object) {
    var destination = object.getAttribute('destination');

    if (!destination) {
      var random = new Date().getTime() - 1296055327011;

      object.setAttribute('destination', random);
      destination = random;
    }
    
    GUI.tabs.addTab(object.getAttribute('name')+" (PaperObject)",object.getAttribute('destination'),object.id);
    GUI.tabs.redrawTabContent();

  }, true);

  this.registerAttribute('isMain', {type: 'boolean', hidden: true});
  this.registerAttribute('bigIcon', {hidden: true});
}

/**
 * Opens the paper object with the help of the attribute 'destination'. If the
 * destination is not set the destination will choose randomly.
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {boolean} openInNewWindow
 */
PaperObject.execute = function(openInNewWindow) {
  var destination = this.getAttribute('destination');

  if (!destination) {
    var random = new Date().getTime() - 1296055327011;

    this.setAttribute('destination', random);
    destination = random;
  }

  // open
  if (openInNewWindow) {
    window.open(destination);
  } else {
    ObjectManager.loadPaperWriter(destination, false, 'left');
  }
}

PaperObject.register('PaperObject');
PaperObject.isCreatable = true;

PaperObject.category = 'Files';

module.exports = PaperObject;