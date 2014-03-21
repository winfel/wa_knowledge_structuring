/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

var Modules = require('../../server.js');

var PrimeFactorization = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

PrimeFactorization.init = function(id) {
  GeneralObject.init.call(this, id);
};

PrimeFactorization.register = function(type) {
  // Registering the object
  var generalObject = Modules.ObjectManager.getPrototype('GeneralObject');
  generalObject.register.call(this, type);

  this.makeSensitive();

  this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Selection'});
  this.registerAttribute('value', {type: 'number', standard: 0, category: 'Selection'});

  this.registerAction("createNumericObject", function(object) {
    var theValue = object.getAttribute("value");
    ObjectManager.createObject("NumericObject", {value: theValue});
    object.setAttribute("value", 0);
  });

  // Reset default width and height for the calculator.
  this.standardData.width = 200;
  this.standardData.height = 50;
};

PrimeFactorization.isCreatable = true;
PrimeFactorization.category = 'Active';

module.exports = PrimeFactorization;