/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var theObject = Object.create(require('./common.js'));

var Modules = require('../../server.js');
module.exports = theObject;

theObject.onLeave = function(object, oldData, newData) {

};

theObject.onEnter = function(object, oldData, newData) {

  if (object.getAttribute("type") == "NumberCreator") {
    // numeric object entered a number creator
    var newNumber = object.getAttribute("value") * 10 + this.getAttribute("value");
    object.setAttribute("value", newNumber);

  } else if (object.getAttribute("type") == "OperatorObject") {
    // numeric object entered an operator object
    var value1 = object.getAttribute("value1");
    var value2 = object.getAttribute("value2");
    var operator = object.getAttribute("operator");

    console.log("log: " + value1 + " " + operator + " " + value2);

    if (isNaN(value1)) {
      value1 = this.getAttribute("value");
      object.setAttribute("value1", value1);

    } else if (isNaN(value2)) {
      value2 = this.getAttribute("value");

      var result = eval(value1 + "" + operator + "" + value2);

      updateLog(this, value1 + " " + operator + " " + value2 + " = " + result);

      object.getRoom().createObject('NumericObject', function(err, obj) {
        obj.setAttribute('name', 'NumericObject');
        obj.setAttribute("value", result);
        
        obj.setPosition(object.getAttribute("x") + 75, object.getAttribute("y") + 5);
      });

      // Reset value1 and value2      
      object.setAttribute("value1", Number.NaN);
      object.setAttribute("value2", Number.NaN);
    }
  } else if (object.getAttribute("type") == "PrimeFactorization") {
    // Prime Factorization
    updateLog(object, "Prime Factorization of " + PrimeFactorization(object, this.getAttribute("value")));
  }
};

theObject.onMoveWithin = function(object, oldData, newData) {

};

theObject.onMoveOutside = function(object, oldData, newData) {

};

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

function PrimeFactorization(object, x) {
  var i = 2;
  var step_size = 45;
  var offset_x = object.getAttribute("x") + object.getAttribute("width") + step_size;
  var offset_y = object.getAttribute("y");

  var output = x + " = ";

  while (true) {
    while (x / i == Math.floor(x / i)) {

      object.getRoom().createObject('NumericObject', function(err, obj) {
        obj.setAttribute('name', 'NumericObject');
        obj.setAttribute("value", i);
        obj.setPosition(offset_x, offset_y);
      });

      output += i + " * ";
      offset_x += step_size;

      x = x / i;
      if (x == i) {

        object.getRoom().createObject('NumericObject', function(err, obj) {
          obj.setAttribute('name', 'NumericObject');
          obj.setAttribute("value", x);
          obj.setPosition(offset_x, offset_y);
        });

        offset_x += step_size;
        output += x;

        x = 1;
      }
    }
    if (x == 1)
      break;
    if (i > Math.sqrt(x)) {

      object.getRoom().createObject('NumericObject', function(err, obj) {
        obj.setAttribute('name', 'NumericObject');
        obj.setAttribute("value", x);
        obj.setPosition(offset_x, offset_y);
      });

      offset_x += step_size;
      output += x;

      break;
    }
    ++i;
  }

  return output;
}