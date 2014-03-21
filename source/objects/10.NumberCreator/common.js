/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

var Modules = require('../../server.js');

var NumberCreator = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

NumberCreator.init = function(id) {
  GeneralObject.init.call(this, id);
};

NumberCreator.register = function(type) {
  // Registering the object
  var that = this;
  var generalObject = Modules.ObjectManager.getPrototype('GeneralObject');
  generalObject.register.call(this, type);


  this.makeSensitive();

  this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Selection'});
  this.registerAttribute('value', {type: 'number', standard: 0, category: 'Selection'});


  this.registerAction("createNumericObject", function(object) {
    var dummy = {id: "1"};
    Modules.RightManager.hasAccess("create", dummy, GUI.username, function(result) {
      var theValue = object.getAttribute("value");
      if (result) {
        ObjectManager.createObject("NumericObject", {value: theValue});
        object.setAttribute("value", 0);
        updateLog(object, theValue + " created");
      }
    });
  });

  // Reset default width and height for the calculator.
  this.standardData.width = 150;
  this.standardData.height = 75;
};

NumberCreator.isCreatable = true;
NumberCreator.category = 'Active';

module.exports = NumberCreator;


function updateLog(object, appendText) {
  console.log('updateLog ' + object);

  var loggingObject = false;

  if (!loggingObject) {
    var inventory = object.getRoom().getInventory();

    for (var i in inventory) {
      var candidate = inventory[i];
      if (candidate.getAttribute('name') === 'logger')
        loggingObject = candidate;
    }
  }

  var insertText = function(logger, newText) {
    console.log('insertText ' + logger + ' ' + object);
    var text = logger.getContentAsString();
    var newLine = newText;
    text = newLine + String.fromCharCode(10) + text;
    logger.setContent(text);
  };

  if (loggingObject) {
    insertText(loggingObject, appendText);
  } else {
    console.log('Creating logger');
    object.getRoom().createObject('Textarea', function(err, obj) {
      obj.setAttribute('name', 'logger');
      insertText("logger created");
      insertText(obj, appendText);
    });
  }
}