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

var PaperSelector = Object.create(Modules.ObjectManager.getPrototype('IconObject'));
PaperSelector.isCreatable = false;
/**
 * Registers the object (actions).
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperSelector.register = function(type) {

  // Registering the object
  IconObject = Modules.ObjectManager.getPrototype('IconObject');
  IconObject.register.call(this, type);

  var self = this;

  this.makeSensitive();

  this.registerAttribute('width',{type: 'number', min: 128, standard: 128, hidden: true});
  this.registerAttribute('height',{type: 'number', min: 128, standard: 128, hidden: true});
  
  this.registerAttribute('isMain', {type: 'boolean', hidden: true});
  this.registerAttribute('bigIcon', {hidden: true});
  this.registerAttribute('verybigIcon', {hidden: true,standard:true});
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
PaperSelector.execute = function(openInNewWindow) {

}

PaperSelector.register('PaperSelector');
PaperSelector.isCreatable = true;

PaperSelector.category = 'Paper Space';
PaperSelector.menuItemLabel = 'paper.selector';

module.exports = PaperSelector;