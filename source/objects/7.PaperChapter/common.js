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

var PaperChapter = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperChapter.register = function(type) {

  // Registering the object
  IconObject = Modules.ObjectManager.getPrototype('IconObject');
  IconObject.register.call(this, type);

  var self = this;

  this.registerAction('to front', function() {

  /* set a very high layer for all selected objects (keeping their order) */
  var selected = ObjectManager.getSelected();

  for (var i in selected) {
    var obj = selected[i];

    obj.setAttribute("layer", obj.getAttribute("layer") + 999999);

  }

  ObjectManager.renumberLayers();

}, false);

this.registerAction('to back', function() {

  /* set a very high layer for all selected objects (keeping their order) */
  var selected = ObjectManager.getSelected();

  for (var i in selected) {
    var obj = selected[i];

    obj.setAttribute("layer", obj.getAttribute("layer") - 999999);

  }

  ObjectManager.renumberLayers();

}, false);

  this.registerAttribute('x', {type: 'number', min: 0, category: 'Dimensions', changedFunction: function(object, value) {
      
    //console.log("change x");

    }});

  this.registerAttribute('isMain', {type: 'boolean', hidden: true});
  this.registerAttribute('bigIcon', {hidden: true});

     this.registerAttribute('writer', {type: 'text'});

  var random = new Date().getTime() - 1296055327011;
  this.registerAttribute('chapterID', {type: 'text', standard:random});
  this.registerAttribute('order', {type: 'text', standard:1});



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
PaperChapter.execute = function(openInNewWindow) {
  var tempIDs = [];

  /* set writer id */
  var inv = ObjectManager.getCurrentRoom().getInventory();

        for (var i in inv) {
            if(inv[i].type == "Writer"){

                this.setAttribute('writer',inv[i].id);
            }
        } 

            /* === set order === */
    /* find lengths */
    var len = [];
    for (var i in inv) {
      if(inv[i].type == "PaperChapter"){
        len.push(parseInt(inv[i].getAttribute('x')));      
      }
    }

    len.sort(function(a,b){return a - b});

    for (var i in inv) {
      if(inv[i].type == "PaperChapter"){
      // whats the position in the array
      var pos = len.indexOf(inv[i].getAttribute('x')) + 1;
      inv[i].setAttribute("order",pos);
      tempIDs[pos-1] = inv[i].getAttribute('chapterID');
    }
  }
  UserManager.setDataOfSpaceWithDest(this.getCurrentRoom(),"paperIDs",tempIDs);   
};

PaperChapter.register('PaperChapter');
PaperChapter.isCreatable = true;

PaperChapter.menuItemLabel = 'paper.chapter';
PaperChapter.category = 'Paper Space';

module.exports = PaperChapter;