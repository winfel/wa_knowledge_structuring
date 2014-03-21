/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

var Modules = require('../../server.js');

var OperatorObject = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

OperatorObject.init = function(id) {
  GeneralObject.init.call(this, id);
};

OperatorObject.register = function(type) {
  // Registering the object
  var generalObject = Modules.ObjectManager.getPrototype('GeneralObject');
  generalObject.register.call(this, type);

  this.makeSensitive();

  this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Selection'});
  this.registerAttribute('operator', {type: 'text', standard: "+", category: 'Selection'});
  this.registerAttribute('value1', {type: 'number', standard: Number.NaN, category: 'Selection'});
  this.registerAttribute('value2', {type: 'number', standard: Number.NaN, category: 'Selection'});

  // Reset default width and height for the calculator.
  this.standardData.width = 50;
  this.standardData.height = 50;
};

OperatorObject.isCreatable = true;
OperatorObject.category = 'Active';

module.exports = OperatorObject;