/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

var Modules = require('../../server.js');

var NumericObject = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

NumericObject.register = function(type) {
  // Registering the object
  var CalculatorButtonBase = Modules.ObjectManager.getPrototype('GeneralObject');
  CalculatorButtonBase.register.call(this, type);
  
  this.makeSensitive();

  this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Selection'});
  this.registerAttribute('value', {type: 'number', standard: 0, category: 'Selection'});

  // Reset default width and height for the calculator.
  this.standardData.width = 40;
  this.standardData.height = 40;
};

NumericObject.isCreatable = true;
NumericObject.category = 'Active';

module.exports = NumericObject;