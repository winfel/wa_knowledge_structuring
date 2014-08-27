/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

var Modules = require('../../server.js');

/**
 * PaperSpace
 * 
 * @class
 * @classdesc Common elements for view and server
 */

var PaperSpace = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 * 
 * @this {PaperSpace}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperSpace.register = function(type) {

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
    
    GUI.tabs.addTab(object.getAttribute('name')+" (PaperSpace)",object.getAttribute('destination'),object.id);
    GUI.tabs.redrawTabContent();

  }, true);

  this.registerAttribute('Project name', {type: 'text',standard:'Type your name here' ,hidden: false, changedFunction: function(object, value) {

      UserManager.getDataOfSpaceWithDest("ProjectNames", "name" , function(d){
      
        var arr = new Array();
                
        if(d != "error"){
          var key;
          for(key in d[0].value){
            arr.push(d[0].value[key]);
          }
          UserManager.removeDataOfSpaceWithDest("ProjectNames","name");
        }
        
        if(arr.indexOf(value) == -1){
          arr.push(value);
        }
            
        setTimeout(function(){ UserManager.setDataOfSpaceWithDest("ProjectNames", "name", arr) }, 500);
      
      });


      // store id of the corresponding project
    UserManager.getDataOfSpaceWithDest("ProjectNames", "name" , function(d){
      
        var arr = new Array();
                
        if(d != "error"){
          var key;
          for(key in d[0].value){
            arr.push(d[0].value[key]);
          }
          UserManager.removeDataOfSpaceWithDest("ProjectNames","name");
        }
        
        if(arr.indexOf(object.id+"#"+value) == -1){
          arr.push(object.id+"#"+value);
        }
            
        setTimeout(function(){UserManager.setDataOfSpaceWithDest("ProjectNames","ID#Name",arr) }, 500);
      
      });
  }});

  this.registerAttribute('isMain', {type: 'boolean', hidden: true});
  this.registerAttribute('bigIcon', {hidden: true});
}

/**
 * Opens the paper object with the help of the attribute 'destination'. If the
 * destination is not set the destination will choose randomly.
 * 
 * @this {PaperSpace}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {boolean} openInNewWindow
 */
PaperSpace.execute = function(openInNewWindow) {
  var destination = this.getAttribute('destination');

  if (!destination) {
    var random = new Date().getTime() - 1296055327011;

    this.setAttribute('destination', random);
    destination = random;

    GUI.tabs.addTab(this.getAttribute('name')+" (Room)",this.getAttribute('destination'),this.id);
    GUI.tabs.redrawTabContent();
  }

  // open
  if (openInNewWindow) {
    GUI.tabs.addTab(this.getAttribute('name')+" (Room)",this.getAttribute('destination'),this.id);
    GUI.tabs.redrawTabContent();
    window.open(destination);
  } else {
    GUI.tabs.addTab(this.getAttribute('name')+" (Room)",this.getAttribute('destination'),this.id);
    GUI.tabs.redrawTabContent();
    Modules.RightManager.hasAccess("read", { id: this.id, type: this.type}, GUI.username, function(result) {
      if(result) {
        ObjectManager.loadPaperWriter(destination, false, 'left');
      }else{
        var audio = new Audio('/guis.common/sounds/cant_touch_this.mp3');
        audio.play();
      }
    });
  }
};

PaperSpace.register('PaperSpace');
PaperSpace.isCreatable = true;

PaperSpace.category = 'Files';
PaperSpace.menuItemLabel = 'paper.space';

module.exports = PaperSpace;