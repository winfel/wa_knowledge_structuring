/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *	 GeneralObject common elements for view and server
 *
 */

// functions and properties defined here are the same on the server and client side

var Modules = require('../../server.js');

/**
 * GeneralObject
 * @class
 * @classdesc Common elements for view and server
 */
var GeneralObject = Object.create(Object);

GeneralObject.attributeManager = false;
GeneralObject.translationManager = false;
GeneralObject.actionManager = false;
GeneralObject.isCreatable = false;
GeneralObject.isGraphical = true;
GeneralObject.selected = false;
GeneralObject.category = 'Paint Objects';
GeneralObject.ObjectManager = Modules.ObjectManager;

// The label that will appear in the menuItem of the toolbar
// If left blank then the label will be the type of the Object
GeneralObject.menuItemLabel = '';

/**
 * Returns always false.
 *
 * @return {boolean} false 
 */
GeneralObject.alwaysOnTop = function () {
  return false;
};

/**
 * Sets the object property 'isSensitiveFlag' to true.
 *
 * @this {GeneralObject}
 */
GeneralObject.makeSensitive = function () {
  this.isSensitiveFlag = true;
};

/**
 * Sets the object property 'isStructuringFlag' to true.
 *
 * @this {GeneralObject}
 */
GeneralObject.makeStructuring = function () {
  this.isStructuringFlag = true;
};

/**
 * Returns the value of the property 'isSensitiveFlag'.
 *
 * @this {GeneralObject}
 * @return {boolean} True if 'isSensitiveFlag' is true, otherwise false.
 */
GeneralObject.isSensitive = function () {
  return this.isSensitiveFlag || false;
};

/**
 * Returns the value of the property 'isStructuringFlag'.
 *
 * @this {GeneralObject}
 * @return {boolean} True if 'isStructuringFlag' is true, otherwise false.
 */
GeneralObject.isStructuring = function () {
  return this.isStructuringFlag || false;
};


GeneralObject.utf8 = {};

/**
 *  Decomposes a string/URI into unicode.
 *
 * @param {string} str The string which should be converted into unicode.
 * @return {array} The Array which contains the unicodes of the string.
 */
GeneralObject.utf8.toByteArray = function (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }
  return byteArray;
};

/**
 *  Converts an unicode array into a string/URI.
 *
 * @param {array} byteArray The unicode array which should be converted.
 * @return {string} Contains the decoded URI or an empty string (exception).
 */
GeneralObject.utf8.parse = function (byteArray) {
  var str = '';
  for (var i = 0; i < byteArray.length; i++)
    str += byteArray[i] <= 0x7F ?
            byteArray[i] === 0x25 ? "%25" : // %
            String.fromCharCode(byteArray[i]) :
            "%" + byteArray[i].toString(16).toUpperCase();
  try {
    return decodeURIComponent(str);
  } catch (e) {
  }
  return '';
};

/**
 * Returns always false.
 *
 * @return {boolean} false 
 */
GeneralObject.moveByTransform = function () {
  return false;
};

/**
 * True if the object has a special area where it can be moved
 */
GeneralObject.restrictedMovingArea = false;

/**
 * duplicate this object if a linked object gets duplicated
 */
GeneralObject.duplicateWithLinkedObjects = false;

/**
 * duplicate linked objects if this object gets duplicated
 */
GeneralObject.duplicateLinkedObjects = false;

/**
 * content is only accessible via URL
 */
GeneralObject.contentURLOnly = true;

/**
 * The current language
 */
GeneralObject.currentLanguage = Modules.Config.language;

/**
 * Registers the object (attributes, actions).
 *
 * @this {GeneralObject}
 * @see Client/ObjectManager.js
 * @see Common/AttributeManager.js
 * @see Common/ActionManager.js
 * @see Common/DataSet.js
 * @see Common/TranslationManager.js
 * @see Client/Helper.js
 * @see Client/guis.common/javascript/1.svg.js
 * @see objects/1.GeneralObject/view.js
 * @param {string} type The type of the object
 */
GeneralObject.register = function (type) {

  var that = this;
  var ObjectManager = this.ObjectManager;
  var AttributeManager = this.attributeManager;

  this.type = type;
  this.standardData = new Modules.DataSet;
  ObjectManager.registerType(type, this);
  this.attributeManager = Object.create(Modules.AttributeManager);
  this.actionManager = Object.create(Modules.ActionManager);
  this.attributeManager.init(this);
  this.translationManager = Object.create(Modules.TranslationManager);
  this.translationManager.init(this);
  this.actionManager.init(this);


  this.registerAttribute('id', {type: 'text', readonly: true});
  this.registerAttribute('type', {type: 'text', readonly: true});
  this.registerAttribute('name', {type: 'text', changedFunction: function (object, value) {
      var obj = {id: object.id, name: value};
      Modules.UserManager.broadcastNameChange(obj);

      GUI.tabs.updateCache(object);
      GUI.tabs.redrawTabContent();
    }});

  this.registerAttribute('hasContent', {type: 'boolean', hidden: true, standard: false});
  this.registerAttribute('layer', {type: 'layer', readonly: false, category: 'Dimensions', changedFunction: function (object, value) {
      GUI.updateLayers();
    }});

  this.registerAttribute('x', {type: 'number', min: 0, category: 'Dimensions'});
  this.registerAttribute('y', {type: 'number', min: 0, category: 'Dimensions'});
  this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function (object, value) {

      if (object.resizeProportional()) {
        object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
      }

      return true;

    }});

  this.registerAttribute('height', {type: 'number', min: 5, standard: 200, unit: 'px', category: 'Dimensions', checkFunction: function (object, value) {

      if (object.resizeProportional()) {
        object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
      }

      return true;

    }});


  this.registerAttribute('fillcolor', {type: 'color', standard: 'transparent', category: 'Appearance', checkFunction: function (object, value) {

      if (object.checkTransparency('fillcolor', value)) {
        return true;
      } else
        return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

    }});
  this.registerAttribute('linecolor', {type: 'color', standard: 'transparent', category: 'Appearance', checkFunction: function (object, value) {

      if (object.checkTransparency('linecolor', value)) {
        return true;
      } else
        return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

    }});
  this.registerAttribute('linesize', {type: 'number', min: 1, standard: 1, max: 30, category: 'Appearance'});

  this.registerAttribute('locked', {type: 'boolean', standard: false, category: 'Basic', checkFunction: function (object, value) {

      window.setTimeout(function () {
        object.deselect();
        object.select();
      }, 10);

      return true;

    }});

  this.registerAttribute('visible', {type: 'boolean', standard: true, category: 'Basic', checkFunction: function (object, value) {

      if (value != false) {
        return true;
      }

      var linkedVisibleObjectsCounter = 0;

      var linkedObjects = object.getLinkedObjects();

      for (var i in linkedObjects) {
        var linkedObject = linkedObjects[i];

        if (linkedObject.object.getAttribute("visible") == true) {
          linkedVisibleObjectsCounter++;
        }
      }

      if (linkedVisibleObjectsCounter == 0) {
        return object.translate(GUI.currentLanguage, "you need at least one link from or to this object to hide it");
      } else {
        return true;
      }

    }});

  this.registerAttribute('link', {type: 'object_id', multiple: true, hidden: true, standard: [], category: 'Functionality', changedFunction: function (object, value) {

      var objects = ObjectManager.getObjects();

      for (var index in objects) {
        var object = objects[index];

        if (!object.hasLinkedObjects() && object.getAttribute("visible") != true) {
          object.setAttribute("visible", true);
        }

      }

      return true;

    }});

  this.registerAttribute('group', {type: 'group', readonly: false, category: 'Basic', standard: 0});


  // Registers the available rights ...
  //this.registerRight("create", "You may create new content within this viewer.");
  //this.registerRight("read",   "You may access the content within this viewer.");
  //this.registerRight("update", "You may change the content within this viewer.");
  this.registerRight("delete", "You may delete this " + type + ".");
  // ... and default roles for this object.
  //this.registerDefaultRole("Reader", ["read"]);
  //this.registerDefaultRole("Coworker", ["create", "read"]);

  this.registerAction('Delete', function () {

    var selected = ObjectManager.getSelected();

    for (var i in selected) {
      var object = selected[i];
      object.hasAccess("delete", function (result) {
        if (result) {
          object.deleteIt();
        } else {
          GUI.notifyError("No access", "You cannot delete this " + object.type + ".");
        }
      });
    }

  }, false);

  this.registerAction('Duplicate', function () {

    ObjectManager.duplicateObjects(ObjectManager.getSelected());

  }, false);

  this.registerAction('Copy', function () {

    ObjectManager.copyObjects(ObjectManager.getSelected());

  }, false);

  this.registerAction('Cut', function () {

    ObjectManager.cutObjects(ObjectManager.getSelected());

  }, false);

  this.registerAction(
          'Link',
          function (lastClicked) {
            var selected = ObjectManager.getSelected();
            var lastSelectedId = lastClicked.getId();

            var newLinks = [];
            var oldLinks = lastClicked.getAttribute('link');

            //check if there already existing links
            //	if yes - reinsert them
            if (_.isArray(oldLinks)) {
              newLinks = newLinks.concat(oldLinks);
            } else if (oldLinks) {
              newLinks.push(oldLinks);
            }

            //check if selected object already is a link of the object
            //	if no - add it
            _.each(selected, function (current) {
              var selectedId = current.getId();
              if (selectedId !== lastSelectedId && !_.contains(newLinks, current.getId()))
                newLinks.push(current.getId());
            });

            lastClicked.setAttribute("link", newLinks);
            _.each(selected, function (current) {
              current.deselect();
              //current.select()
            });
            lastClicked.select();
          },
          false,
          function () {
            return (ObjectManager.getSelected().length > 1);
          }
  );


  this.registerAction('Group', function () {

    var selected = ObjectManager.getSelected();

    var date = new Date();
    var groupID = date.getTime();

    for (var i in selected) {
      var obj = selected[i];

      obj.setAttribute("group", groupID);

    }

  }, false, function () {

    var selected = ObjectManager.getSelected();

    /* only one object --> no group */
    if (selected.length == 1)
      return false;

    /* prevent creating a group if all objects are in the same group */
    var group = undefined;

    for (var i in selected) {
      var obj = selected[i];

      if (group == undefined) {
        group = obj.getAttribute("group");
      } else {

        if (group != obj.getAttribute("group")) {
          return true;
        }

      }

    }

    /* if the common group is 0 there is no group */
    if (group == 0)
      return true;

    return false;

  });



  this.registerAction('Ungroup', function () {

    var selected = ObjectManager.getSelected();

    for (var i in selected) {
      var obj = selected[i];

      obj.setAttribute("group", 0);

    }

  }, false, function () {

    var selected = ObjectManager.getSelected();

    /* prevent ungrouping if no selected element is in a group */
    var hasGroups = false;

    for (var i in selected) {
      var obj = selected[i];

      if (obj.getAttribute("group") != 0) {
        hasGroups = true;
      }

    }

    return hasGroups;

  });



  var r = Modules.Helper.getRandom(0, 200);
  var g = Modules.Helper.getRandom(0, 200);
  var b = Modules.Helper.getRandom(0, 200);
  var width = 100;

  this.standardData.fillcolor = 'rgb(' + r + ',' + g + ',' + b + ')';
  this.standardData.width = width;
  this.standardData.height = width;


  this.registerAction('to front', function () {

    /* set a very high layer for all selected objects (keeping their order) */
    var selected = ObjectManager.getSelected();

    for (var i in selected) {
      var obj = selected[i];

      obj.setAttribute("layer", obj.getAttribute("layer") + 999999);

    }

    ObjectManager.renumberLayers();

  }, false);

  this.registerAction('to back', function () {

    /* set a very high layer for all selected objects (keeping their order) */
    var selected = ObjectManager.getSelected();

    for (var i in selected) {
      var obj = selected[i];

      obj.setAttribute("layer", obj.getAttribute("layer") - 999999);

    }

    ObjectManager.renumberLayers();

  }, false);


};

/**
 * Returns the result of the function 'attributeManager.get' (Common, AttributeManager) with the help of the object-id and the forwarded key parameter.
 *
 * @this {GeneralObject}
 * @param {string} key 
 * @see Common/AttributeManager.js
 * @return {?} desired value
 */
GeneralObject.get = function (key) {
  return this.attributeManager.get(this.id, key);
};

/**
 * Sets a given value with the help of the forwarded object-id/key by calling the function 'attributeManager.set' (Common, AttributeManager).
 *
 * @this {GeneralObject}
 * @param {string} key 
 * @param {?} value
 * @see Common/AttributeManager.js
 */
GeneralObject.set = function (key, value) {
  return this.attributeManager.set(this.id, key, value);
};

/**
 * Sets given data with the help of the object-id by calling the function 'attributeManager.setAll' (Common, AttributeManager).
 *
 * @this {GeneralObject}
 * @param {?} data 
 * @see Common/AttributeManager.js
 */
GeneralObject.setAll = function (data) {
  return this.attributeManager.setAll(this.id, data);
};

/**
 * Sets the object-id and the type of the object.
 *
 * @this {GeneralObject}
 * @param {number} id 
 */
GeneralObject.init = function (id) {
  if (!id)
    return;
  this.id = id;
  if (this.get(id, 'id'))
    return;

  this.set('id', id);
  this.set('type', this.type);
};

/**
 * Returns a string with the type and the object-id.
 *
 * @this {GeneralObject}
 * @return {string}
 */
GeneralObject.toString = function () {
  if (!this.get('id')) {
    return 'type ' + this.type;
  }
  return this.type + ' #' + this.get('id');
};

/**
 * Returns the category of the object.
 *
 * @this {GeneralObject}
 * @return {string}
 */
GeneralObject.getCategory = function () {
  return this.category;
};

/**
 * Calls the function 'attributeManager.registerAttribute' (Common, AttributeManager) by forwarding the parameters.
 *
 * @param {string} attribute
 * @param {function} setter
 * @param {string} type
 * @param {number} min
 * @param {number} max
 * @this {GeneralObject}
 * @see Common/AttributeManager.js
 * @return {object} 
 */
GeneralObject.registerAttribute = function (attribute, setter, type, min, max) {
  return this.attributeManager.registerAttribute(attribute, setter, type, min, max);
};

/**
 * Call the function 'attributeManager.setAttribute' (Common, AttributeManager) by forwarding the parameters.
 *
 * @param {string} attribute
 * @param {?} value
 * @param {boolean} forced
 * @param {number} transactionId
 * @this {GeneralObject}
 * @see Common/AttributeManager.js
 * @see Client/guis.common/javascript/0.GUI.js
 * @return {boolean} 
 */
GeneralObject.setAttribute = function (attribute, value, forced, transactionId) {
  if (this.mayChangeAttributes()) {

    // rights could also be checked in the attribute manager but HAVE to
    // be checked on the server side.

    var ret = this.attributeManager.setAttribute(this, attribute, value, forced);

    if (this.afterSetAttribute) {
      this.afterSetAttribute();
    }

    return ret;

  } else {
    GUI.error('Missing rights', 'No right to change ' + attribute + ' on ' + this, this);
    return false;
  }
};

GeneralObject.setAttribute.public = true;

GeneralObject.setAttribute.neededRights = {
  write: true
};

/**
 * Call the function 'attributeManager.getAttribute' (Common, AttributeManager) by forwarding the parameters.
 *
 * @param {string} attribute
 * @param {number} noevaluation
 * @this {GeneralObject}
 * @see Common/AttributeManager.js
 * @return {?} value of the desired attribute
 */
GeneralObject.getAttribute = function (attribute, noevaluation) {
  return this.attributeManager.getAttribute(this, attribute, noevaluation);
};

/**
 * Call the function 'attributeManager.hasAttribute' (Common, AttributeManager) by forwarding the parameters.
 *
 * @param {string} attribute
 * @this {GeneralObject}
 * @see Common/AttributeManager.js
 * @return {boolean} True, if the attribute is set, otherwise false.
 */
GeneralObject.hasAttribute = function (attribute) {
  return this.attributeManager.hasAttribute(this, attribute);
};

/**
 * Call the function 'attributeManager.getAttributes' (Common, AttributeManager) by forwarding the parameters.
 *
 * @this {GeneralObject}
 * @see Common/AttributeManager.js
 * @see Client/Helper.js
 * @return {object} object which contains all values.
 */
GeneralObject.getAttributes = function () {

  var attInfo = this.attributeManager.getAttributes();

  if (!Helper) {
    var Helper = Modules.Helper;
  }
  attInfo = Helper.getCloneOfObject(attInfo);

  for (var i in attInfo) {
    var info = attInfo[i];
    info.value = this.getAttribute(i);
    attInfo[i] = info;
  }
  return attInfo;
};

/**
 * Call the function 'actionManager.registerAction' (Common, ActionManager) by forwarding the parameters.
 *
 * @param {string} name
 * @param {function} func
 * @param {boolean} single
 * @param {boolean} visibilityFunc
 * @this {GeneralObject}
 * @see Common/ActionManager.js
 * @return {object} object which won the new action
 */
GeneralObject.registerAction = function (name, func, single, visibilityFunc) {
  return this.actionManager.registerAction(name, func, single, visibilityFunc);
};

/**
 * Call the function 'actionManager.unregisterAction' (Common, ActionManager) by forwarding the parameter.
 *
 * @param {string} name
 * @this {GeneralObject}
 * @see Common/ActionManager.js
 * @return {object} object which lost the action
 */
GeneralObject.unregisterAction = function (name) {
  return this.actionManager.unregisterAction(name);
};

/**
 * Call the function 'actionManager.performAction' (Common, ActionManager) by forwarding the parameter.
 *
 * @param {string} name
 * @param {object} clickedObject
 * @this {GeneralObject}
 * @see Common/ActionManager.js
 * @return {object} object which performed the action
 */
GeneralObject.performAction = function (name, clickedObject) {
  return this.actionManager.performAction(name, clickedObject);
};

/**
 * Call the function 'actionManager.getAction' (Common, ActionManager).
 *
 * @this {GeneralObject}
 * @see Common/ActionManager.js
 * @return {object} object which contains the actions.
 */
GeneralObject.getActions = function () {
  return this.actionManager.getActions();
};

/**
 * Call the function 'translationManager.get' (Common, translationManager).
 *
 * @param {string} language
 * @param {string} text
 * @this {GeneralObject}
 * @see Common/TranslationManager.js
 * @return {string} translated text in the desired language.
 */
GeneralObject.translate = function (language, text) {
  if (!this.translationManager)
    return text;
  return this.translationManager.get(language, text);
};

/**
 * Set a new current language.
 *
 * @param {string} currentLanguage
 * @this {GeneralObject}
 */
GeneralObject.setLanguage = function (currentLanguage) {
  this.currentLanguage = currentLanguage;
};

/**
 * Call the function 'translationManager.addTranslations' (Common, translationManager).
 *
 * @param {string} language
 * @param {object} data
 * @this {GeneralObject}
 * @see Common/TranslationManager.js
 * @return {object} object which receives the new translations.
 */
GeneralObject.setTranslations = function (language, data) {
  return this.translationManager.addTranslations(language, data);
};

GeneralObject.setTranslation = GeneralObject.setTranslations;

/**
 * Returns the type of the object by calling the function 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {string} 
 */
GeneralObject.getType = function () {
  return this.getAttribute('type');
};

/**
 * Returns the name of the object by calling the function 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {string} 
 */
GeneralObject.getName = function () {
  return this.getAttribute('name');
};

/**
 * Returns the id of the object by calling the function 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {number} 
 */
GeneralObject.getId = function () {
  return this.getAttribute('id');
};

/**
 * Returns the id of the current room of the object by calling the function 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {number} 
 */
GeneralObject.getCurrentRoom = function () {
  return this.getAttribute("inRoom");
};

GeneralObject.stopOperation = function () {
};

/*
 * rights
 */

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
GeneralObject.mayReadContent = function () {
  return true; //TODO
};

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
GeneralObject.mayChangeAttributes = function () {
  return true; //TODO
};

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
GeneralObject.mayChangeContent = function () {
  return true; //TODO
};

/**
 * Hides an object by calling 'setAttribute'.
 *
 * @this {GeneralObject} 
 */
GeneralObject.hide = function () {
  this.setAttribute('visible', true);
};

/**
 * Unhides an object by calling 'setAttribute'.
 *
 * @this {GeneralObject} 
 */
GeneralObject.unHide = function () {
  this.setAttribute('visible', false);
};

GeneralObject.unhide = GeneralObject.unHide;

/**
 * Puts the top left edge of the bounding box to x,y by calling 'setAttribute'.
 * @param {number} x
 * @param {number} y
 * @this {GeneralObject}
 */
GeneralObject.setPosition = function (x, y) {

  this.setAttribute('position', {'x': x, 'y': y});
};

/**
 * Updates the object's width and height by calling 'setAttribute'.
 * @param {number} width
 * @param {number} height
 * @this {GeneralObject}
 */
GeneralObject.setDimensions = function (width, height) {
  if (height === undefined)
    height = width;
  this.setAttribute('width', width);
  this.setAttribute('height', height);
};

/**
 * Moves the object to the front by calling 'ObjectManager.performAction' (Client, ObjectManager).
 *
 * @see Client/ObjectManager.js
 */
GeneralObject.toFront = function () {
  ObjectManager.performAction("toFront");
};

/**
 * Moves the object to the back by calling 'ObjectManager.performAction' (Client, ObjectManager).
 *
 * @see Client/ObjectManager.js
 */
GeneralObject.toBack = function () {
  ObjectManager.performAction("toBack");
};

/**
 * Checks if the object is movable by calling 'mayChangeAttributes'.
 *
 * @return {boolean}
 */
GeneralObject.isMovable = function () {
  return this.mayChangeAttributes();
};

/**
 * Checks if the object is resizeable by calling 'isMovable'.
 *
 * @return {boolean}
 */
GeneralObject.isResizable = function () {
  return this.isMovable();
};

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
GeneralObject.resizeProportional = function () {
  return false;
};


/* following functions are used by the GUI. (because the three functions above will be overwritten) */

/**
 * Checks if the object can be moved by calling 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {boolean} 
 */
GeneralObject.mayMove = function () {
  if (this.getAttribute('locked')) {
    return false;
  } else {
    return this.isMovable();
  }
};

/**
 * Checks if the object can be resized by calling 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {boolean} 
 */
GeneralObject.mayResize = function () {
  if (this.getAttribute('locked')) {
    return false;
  } else {
    return this.isResizable();
  }
};

/**
 * Checks if the object can be resized proportional by calling 'get.Attribute'.
 *
 * @this {GeneralObject}
 * @return {boolean} 
 */
GeneralObject.mayResizeProportional = function () {
  if (this.getAttribute('locked')) {
    return false;
  } else {
    return this.resizeProportional();
  }
};

/**
 * If the object was clicked it is selected by calling 'select' (GeneralObject, View). The click itself is handled by calling 'selectedClickHandler' (GeneralObject, View).
 *
 * @this {GeneralObject}
 * @see objects/1.GeneralObject/view.js
 */
GeneralObject.execute = function () {
  this.select();
  this.selectedClickHandler();
};

/**
 * Checks if the object is selected.
 *
 * @this {GeneralObject}
 * @return {boolean}
 */
GeneralObject.isSelected = function () {
  return this.selected;
};

GeneralObject.refresh = function () {
  //This should be overwritten for GUI updates and object repainting
};

/**
 * Refreshed the GUI delayed by using a timeout and calling 'refresh' (GeneralObject, Client).
 *
 * @this {GeneralObject}
 * @see Client/ObjectManager.js
 */
GeneralObject.refreshDelayed = function () {
  if (this.refreshDelay) {
    clearTimeout(this.refreshDelay);
  }

  var that = this;

  //this timer is the time in which changes on the same object are discarded
  var theTimer = 400;

  this.refreshDelay = setTimeout(function () {
    //If the current room has changed in the meantime, do not refresh at all
    if (GUI.couplingModeActive) {
      if (that.getAttribute('inRoom') != ObjectManager.getRoomID('left') && that.getAttribute('inRoom') != ObjectManager.getRoomID('right')) {
        return;
      }
    } else {
      if (that.getAttribute('inRoom') != ObjectManager.getRoomID()) {
        return;
      }
    }

    that.refresh();
  }, theTimer);
};

/**
 * Returns the roomId of the room which contains the object.
 *
 * @this {GeneralObject}
 * @return {number}
 */
GeneralObject.getRoomID = function () {
  return this.get('inRoom');
};

/**
 * Returns the Id of the object. 
 *
 * @this {GeneralObject}
 * @return {number}
 */
GeneralObject.getID = function () {
  return this.id;
};

/**
 * Removes the object by calling 'Modules.ObjectManager.remove' (Client, ObjectManager).
 *
 * @this {GeneralObject}
 * @see Client/ObjectManager.js
 */
GeneralObject.remove = function () {
  Modules.ObjectManager.remove(this);
};

/**
 * Removes linked objects by calling 'set.Attribute'.
 *
 * @param {number} removeId
 * @this {GeneralObject}
 */
GeneralObject.removeLinkedObjectById = function (removeId) {
  var filteredIds = _.filter(this.get('link'), function (elem) {
    return elem != removeId;
  });

  this.setAttribute("link", filteredIds);

};

/**
 * Checks if the objects has linked objects by calling 'getLinkedObjects'.
 *
 * @this {GeneralObject}
 * @return {boolean} 
 */
GeneralObject.hasLinkedObjects = function () {

  var counter = 0;

  var linkedObjects = this.getLinkedObjects();

  for (var id in linkedObjects) {
    var object = linkedObjects[id];

    counter++;

  }

  if (counter > 0) {
    return true;
  } else {
    return false;
  }

};

/**
 * Returns the linked objects associated with the invoking object.
 *
 * @this {GeneralObject}
 * @see Client/ObjectManager.js
 * @return {object} object which contains the linked objects.
 */
GeneralObject.getLinkedObjects = function () {
  var self = this;

  /* getObject (this is different on server and client) */
  if (self.ObjectManager.isServer) {
    /* server */
    var getObject = function (id) {
      return Modules.ObjectManager.getObject(self.get('inRoom'), id, self.context);
    };
    var getObjects = function () {
      return Modules.ObjectManager.getObjects(self.get('inRoom'), self.context);
    };
  } else {
    /* client */
    var getObject = function (id) {
      return ObjectManager.getObject(id);
    };
    var getObjects = function () {
      return ObjectManager.getObjects(ObjectManager.getIndexOfObject(self.getId()));
    };
  }

  /* get objects linked by this object */
  var ownLinkedObjectsIds = [];


  if (this.get('link') instanceof Array) {
    ownLinkedObjectsIds = ownLinkedObjectsIds.concat(this.get('link'));
  } else {
    ownLinkedObjectsIds.push(this.get('link'));
  }

  /* get objects which link to this object */
  var linkingObjectsIds = [];


  var objects = getObjects();

  for (var index in objects) {
    var object = objects[index];

    if (object.get('link')) {

      if (object.get('link') instanceof Array) {

        for (var index in object.get('link')) {
          var objectId = object.get('link')[index];

          if (objectId == self.get('id')) {
            linkingObjectsIds.push(object.get('id'));
          }

        }

      } else {

        if (object.get('link') == self.get('id')) {
          linkingObjectsIds.push(object.get('id'));
        }

      }

    }

  }

  var links = {};

  if (ownLinkedObjectsIds) {

    for (var index in ownLinkedObjectsIds) {
      var objectId = ownLinkedObjectsIds[index];

      if (!objectId)
        break;

      var webarenaObject = getObject(objectId);

      links[objectId] = {
        object: webarenaObject,
        direction: "out"
      };

    }
  }


  if (linkingObjectsIds) {

    for (var index in linkingObjectsIds) {
      var objectId = linkingObjectsIds[index];

      if (!objectId)
        break;

      var webarenaObject = getObject(objectId);

      links[objectId] = {
        object: webarenaObject,
        direction: "in"
      };

    }
  }

  return links;
};

/**
 * Returns the group members associated with the invoking object.
 *
 * @this {GeneralObject}
 * @see Client/ObjectManager.js
 * @return {array} array which contains the group members.
 */
GeneralObject.getGroupMembers = function () {

  var list = [];

  var objects = ObjectManager.getObjects();

  for (var i in objects) {
    var obj = objects[i];

    if (obj.get('id') != this.get('id') && obj.getAttribute("group") == this.getAttribute("group")) {
      list.push(obj);
    }

  }

  return list;

};

/**
 * Duplicates the objects which are on the list.
 *
 * @param {object} list
 * @this {GeneralObject}
 * @return {array} array which contains the ids of the duplicated objects.
 */
GeneralObject.getObjectsToDuplicate = function (list) {

  var self = this;

  if (list == undefined) {
    /* init new list */

    /* list of objects which will be duplicated */
    var list = {};

  }

  list[self.get('id')] = true; //add this object to list

  var linkedObjects = this.getLinkedObjects();

  for (var id in linkedObjects) {
    var target = linkedObjects[id];
    var targetObject = target.object;

    if (targetObject && targetObject && !list[targetObject.get('id')]) {
      targetObject.getObjectsToDuplicate(list);
    }

  }


  var arrList = [];

  for (var objectId in list) {

    arrList.push(objectId);

  }

  return arrList;

};

/**
 * Updates the links between objects with the help of idTranslationList and by calling 'setAttribute'.
 *
 * @param {object} idTranslationList
 * @this {GeneralObject}
 */
GeneralObject.updateLinkIds = function (idTranslationList) {

  if (!this.get('link') || this.get('link') == "") {
    return;
  }

  var update = function (id) {

    if (idTranslationList[id] != undefined) {
      id = idTranslationList[id];
    }
    return id;
  };

  if (this.get('link') instanceof Array) {

    for (var i in this.get('link')) {
      this.setAttribute("link", update(this.get('link')[i]));
    }

  } else {
    this.setAttribute("link", update(this.get('link')));
  }

};

GeneralObject.deleteIt = GeneralObject.remove;

/**
 * Registers a right used within this object.
 * 
 * @function registerRight
 * @param {type} name
 * @param {type} comment
 * @param {type} mask     Masks the object type to another one.
 * @returns {undefined}
 */
GeneralObject.registerRight = function (name, comment, mask) {
  try {
    Modules.RightManager.registerRight(this, name, comment, mask);
  } catch (e) {
    // Do nothing if registerRight is not available on the client side.
  }
};

/**
 * Registers a default role.
 * 
 * @function registerDefaultRole
 * @param {type} name
 * @param {type} rights
 * @returns {undefined}
 */
GeneralObject.registerDefaultRole = function (name, rights) {
  try {
    Modules.RightManager.registerDefaultRole(this, name, rights);
  } catch (e) {
    // Do nothing if registerDefaultRole is not available on the client side.
  }
};

module.exports = GeneralObject;

