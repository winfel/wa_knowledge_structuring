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

  // Registers the available rights ...
  this.supportsRightmanager = true; // We use this variable to make sure that not every simple object has a right manager
  this.registerRight("read", "A user may read the content of this paper space.", "Room");

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

    GUI.tabs.addTab(object.getAttribute('name') + " (PaperSpace)", object.getAttribute('destination'), object.id);
    GUI.tabs.redrawTabContent();

  }, true);

  this.registerAttribute('Project name', {type: 'text', standard: 'Type your name here', hidden: false, changedFunction: function(object, value) {
      // ---------------
      // update ProjectNameDestinationLink
      // ----------------
      var destination = object.getAttribute('destination');

      if (!destination) {
        var random = new Date().getTime() - 1296055327011;

        object.setAttribute('destination', random);
        destination = random;

        // store destination in database to link it to the project name
        UserManager.setDataOfSpaceWithDest(random, 'ProjectNameLink', value);
      } else {
        // remove old link
        UserManager.removeDataOfSpaceWithDest(object.getAttribute('destination'), 'ProjectNameLink');

        // set new link
        UserManager.setDataOfSpaceWithDest(object.getAttribute('destination'), 'ProjectNameLink', value);
      }

      // -----------------
      // updating remaining storage space
      // -----------------
      var oldNames = [];

      // store id of the corresponding project
      UserManager.getDataOfSpaceWithDest("ProjectNames", "ID#Name", function(d) {

        var arr = new Array();

        if (d != "error") {
          var key;
          for (key in d[0].value) {

            // store old names of this paperspace (via id)
            if (d[0].value[key].indexOf(object.id) > -1) {
              oldNames.push(d[0].value[key].split("#")[1]);

              // copy reference array which is needed for the reference container
              UserManager.getDataOfSpaceWithDest(d[0].value[key].split("#")[1], "references", function(d2) {
                setTimeout(function() {
                  UserManager.setDataOfSpaceWithDest(value, "references", d2[0].value)
                }, 750);

                // remove old reference
                UserManager.removeDataOfSpaceWithDest(d[0].value[key].split("#")[1], "references");

                // => Done with copying the reference array
              });
            } else {
              arr.push(d[0].value[key]);
            }
          }
          UserManager.removeDataOfSpaceWithDest("ProjectNames", "ID#Name");
        }

        if (arr.indexOf(object.id + "#" + value) == -1) {
          arr.push(object.id + "#" + value);
        }

        // store data
        setTimeout(function() {
          UserManager.setDataOfSpaceWithDest("ProjectNames", "ID#Name", arr)
        }, 500);

        // -------
        // done with part 1
        // -------

        // store name
        UserManager.getDataOfSpaceWithDest("ProjectNames", "name", function(d) {

          var arr = new Array();

          if (d != "error") {
            var key;
            for (key in d[0].value) {

              // if name is not an old name of this paperpspace -> store it
              if (oldNames.indexOf(d[0].value[key]) == -1) {
                arr.push(d[0].value[key]);
              }
            }
            UserManager.removeDataOfSpaceWithDest("ProjectNames", "name");
          }

          if (arr.indexOf(value) == -1) {
            arr.push(value);
          }

          setTimeout(function() {
            UserManager.setDataOfSpaceWithDest("ProjectNames", "name", arr)
          }, 500);

        });

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

    // store destination in database to link it to the project name
    UserManager.setDataOfSpaceWithDest(random, 'ProjectNameLink', this.getAttribute('Project name'));

    // add destination to tabs
    GUI.tabs.addTab(this.getAttribute('name') + " (Room)", this.getAttribute('destination'), this.id);
    GUI.tabs.redrawTabContent();
  }

  // open
  if (openInNewWindow) {
    GUI.tabs.addTab(this.getAttribute('name') + " (Room)", this.getAttribute('destination'), this.id);
    GUI.tabs.redrawTabContent();
    window.open(destination);
  } else {
    GUI.tabs.addTab(this.getAttribute('name') + " (Room)", this.getAttribute('destination'), this.id);
    GUI.tabs.redrawTabContent();
    this.hasAccess("read", function(result) {
      if (result) {
        ObjectManager.loadPaperWriter(destination, false, 'left');
      } else {
        var audio = new Audio('/guis.common/sounds/cant_touch_this.mp3');
        audio.play();
      }
    });
  }
};

PaperSpace.register('PaperSpace');
PaperSpace.isCreatable = true;

PaperSpace.category = 'Paper Space';
PaperSpace.menuItemLabel = 'paper.space';

module.exports = PaperSpace;