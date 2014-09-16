"use strict";

/**
 * holds methods and variables for GUI
 * @class GUI
 */
var GUI = {};

/**
 * Language of the client (used by translate function)
 * 
 * @default de
 */
GUI.currentLanguage = Modules.Config.language;

/**
 * This is called then forward or backwards-buttons are used in the browser.
 * See ObjectManager.onload for pushState.
 * @function onpopstate
 * @param {type} event
 * @returns {undefined}
 */
window.onpopstate = function(event) {
  if (!event.state)
    return;
  var room = event.state.room;
  if (!room)
    return;

  if (GUI.isLoggedIn) {
    ObjectManager.loadRoom(room, true);
  }
};

GUI.translationManager = Object.create(TranslationManager);

/**
*@function init
* @param undefined
*/
GUI.translationManager.init(undefined);

/**
 * @function setTranslations
 * @param {type} language
 * @param {type} data
 */
GUI.setTranslations = function(language, data) {
  return this.translationManager.addTranslations(language, data);
};

/**
 * @function translate
 * @param {type} text
 */
GUI.translate = function(text) {
  return this.translationManager.get(this.currentLanguage, text);
};


/**
 * Variable to check if client is a touch device (to add suitable event handlers)
 */
GUI.isTouchDevice = false;

/**
 * @function updateGUI
 * @param {webarenaObject} webarenaObject
 * @deprecated still needed?
 */
GUI.updateGUI = function(webarenaObject) {

};

/**
 * Check room size on browser window resize
 * @function initResizeHandler
 * @returns {undefined}
 */
GUI.initResizeHandler = function() {
  $(document).bind("resize", function() {
    GUI.adjustContent();
  });
};

/**
 * Set room width and height depending on objects in room
 * @function adjustContent
 * @param  {webarenaObject} [webarenaObject] concrete object to check for
 */
GUI.adjustContent = function(webarenaObject) {

  if (webarenaObject != undefined) {

    if (!webarenaObject.isGraphical)
      return;

    /* check if new position of webarenaObject needs a new room width/height */

    var currentRoom = ObjectManager.getCurrentRoom();

    var maxX = Math.round(webarenaObject.getViewBoundingBoxX() + webarenaObject.getViewBoundingBoxWidth()) + 300;
    var maxY = Math.round(webarenaObject.getViewBoundingBoxY() + webarenaObject.getViewBoundingBoxHeight()) + 300;

    if (maxX > currentRoom.getAttribute("width")) {
      GUI.setRoomWidth(maxX);
    }

    if (maxY > currentRoom.getAttribute("height")) {
      GUI.setRoomHeight(maxY);
    }


  } else {
    /* set room width/height */
    var currentRoom = ObjectManager.getCurrentRoom();
    if (!currentRoom)
      return;

    var width = currentRoom.getAttribute("width");
    var height = currentRoom.getAttribute("height");

    var maxX = 0;
    var maxY = 0;

    $.each(ObjectManager.getObjects(), function(key, object) {

      var mx = Math.round(object.getAttribute("x") + object.getAttribute("width"));
      var my = Math.round(object.getAttribute("y") + object.getAttribute("height"));

      if (mx > maxX) {
        maxX = mx;
      }

      if (my > maxY) {
        maxY = my;
      }

    });

    maxX += 300;
    maxY += 300;

    if (maxX < width) {
      width = maxX;
    }

    if (maxY < height) {
      height = maxY;
    }

    GUI.setRoomWidth(width);
    GUI.setRoomHeight(height);
  }
};

/**
 * Set width of room / svg area
 * @function setRoomWidth
 * @param {int} width new width of the room
 */
GUI.setRoomWidth = function(width) {

  var currentRoom = ObjectManager.getCurrentRoom();
  if (!currentRoom)
    return;

  currentRoom.setAttribute("width", width);

  if (width < $(window).width()) {
    width = $(window).width();
  }

  $("#content").css("width", width);
  $("#content > svg").css("width", width);
};

/**
 * Set height of room / svg area
 * @function setRoomHeight
 * @param {int} height new height of the room
 */
GUI.setRoomHeight = function(height) {

  var currentRoom = ObjectManager.getCurrentRoom();
  if (!currentRoom)
    return;

  currentRoom.setAttribute("height", height);

  if (height < $(window).height()) {
    height = $(window).height();
  }

  $("#content").css("height", height);
  $("#content > svg").css("height", height);
};

/**
  * Deselects all objects in the current room
  * @function deselectAllObjects
 */
GUI.deselectAllObjects = function() {
  $.each(ObjectManager.getSelected(), function(index, object) {
    object.deselect();
  });
};

/* Multi selection */

/**
 * set to true if the clients shift key is pressed (used for multiple selection)
 */
GUI.shiftKeyDown = false;

/**
 * Add event handlers for shift key
 * @function initShiftKeyHandling
 * @returns {undefined}
 */
GUI.initShiftKeyHandling = function() {

  $(document).click(function(e) {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  $(document).bind("keydown", function(event) {
    if (event.keyCode == 16) {
      GUI.shiftKeyDown = true;
    }
  });

  $(document).bind("keyup", function(event) {
    if (event.keyCode == 16) {
      GUI.shiftKeyDown = false;
    }
  });
};

/* Move by keyboard */

/**
 * @deprecated ?
 */
GUI.blockKeyEvents = false;

/**
 * Add event handlers for object movement by arrow-keys.
 * @function initMoveByKeyboard
 * @returns {undefined}
 */
GUI.initMoveByKeyboard = function() {

  $(document).bind("keydown", function(event) {

    if ($("input:focus,textarea:focus").get(0) != undefined)
      return;

    if (GUI.shiftKeyDown) {
      var d = 10;
    } else {
      var d = 1;
    }

    $.each(ObjectManager.getSelected(), function(index, object) {

      // If left, right, up, down arrow, then prevent the default behavior of the browser.
      // In other words: Tell the browser, leave this event alone, I take care of it!
      if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
        event.preventDefault();
      } else {
        return;
      }

      GUI.hideActionsheet();

      // Left arrow
      if (event.keyCode == 37) {
        object.moveBy(d * (-1), 0);
      }

      // Right arrow
      if (event.keyCode == 39) {
        object.moveBy(d, 0);
      }

      // Up arrow
      if (event.keyCode == 38) {
        object.moveBy(0, d * (-1));
      }

      // Down arrow
      if (event.keyCode == 40) {
        object.moveBy(0, d);
      }
    });
  });
};

/**
 * @function initUndoByKeyboard
 * @returns {undefined}
 */
GUI.initUndoByKeyboard = function() {
  $(document).bind("keydown", function(event) {
    var ctrlDown = event.ctrlKey || event.metaKey;
    if (ctrlDown && event.which == 90) {
      event.preventDefault();

      Modules.Dispatcher.query("undo", {"userID": GUI.userid});
    }
  });
};

/**
 * Add event handler for removing selected objects by pressing delete-key
 * @function initObjectDeletionByKeyboard
 * @returns {undefined}
 */
GUI.initObjectDeletionByKeyboard = function() {

  $(document).bind("keydown", function(event) {

    if ($("input:focus,textarea:focus").get(0) == undefined) {

      if (event.which == 8 || event.which == 46) {

        event.preventDefault();

        var result = confirm(GUI.translate('Do you really want to delete the selected objects?'));

        if (result) {
          /* delete selected objects */
          $.each(ObjectManager.getSelected(), function(key, object) {

            if ($(object.getRepresentation()).data("jActionsheet")) {
              $(object.getRepresentation()).data("jActionsheet").remove();
            }

            object.deleteIt();

          });
        }
      }
    }
  });
};

/**
 * Add event handler for copy, cut and paste by ctrl + c, ctrl + x, ctrl + v
 * @function initObjectCopyCutPasteHandlingByKeyboard
 * @returns {undefined}
 */
GUI.initObjectCopyCutPasteHandlingByKeyboard = function() {

  $(document).bind("keydown", function(event) {

    if ($("input:focus,textarea:focus").get(0) == undefined) {

      var ctrlDown = event.ctrlKey || event.metaKey; // Mac support

      if (ctrlDown && event.which == 67) {
        event.preventDefault();
        ObjectManager.copyObjects(ObjectManager.getSelected());
      }

      if (ctrlDown && event.which == 88) {
        event.preventDefault();
        ObjectManager.cutObjects(ObjectManager.getSelected());
      }

      if (ctrlDown && event.which == 86) {
        event.preventDefault();
        ObjectManager.pasteObjects();
      }
    }
  });
};


/**
 * Add event handler for object selection (based on clicked position and layers)
 * @function initMouseHandler
 * @returns {undefined}
 */
GUI.initMouseHandler = function() {

  if (GUI.isTouchDevice) {

    var touchHandler = function(event) {

      jPopoverManager.hideAll();

      var contentPosition = $("#content").offset();

      var x = event.pageX - contentPosition.left;
      var y = event.pageY - contentPosition.top;

      if (event.touches.length >= 1) {
        // Get the coordinates of the last placed finger!
        x = event.touches[event.touches.length - 1].pageX - contentPosition.left;
        y = event.touches[event.touches.length - 1].pageY - contentPosition.top;
      }

      // Get the objects at this position
      var clickedObject = GUI.getObjectAt(x, y);

      if (clickedObject && event.target != $("#content>svg").get(0)) {
        event.preventDefault();
        event.stopPropagation();
        clickedObject.click(event);
      } else {
        GUI.deselectAllObjects();
        GUI.updateInspector();
      }
    };

    $("#content>svg").get(0).addEventListener("touchstart", touchHandler, false);

  } else {

    var mousedown = function(event) {
      jPopoverManager.hideAll();
	  
	  $("div.addremove-menu").remove();
	  $("div.global-menu").remove();

      var contentPosition = $("#content").offset();

      var temp = event.target;

      while (temp && !temp.dataObject) {
        temp = $(temp).parent()[0];
      }

      var clickedObject = (temp) ? temp.dataObject : false;

      //TODO check if this can be done similarly for touch devices

      if (GUI.couplingModeActive) {
        if (event.pageX > $('#couplingBar').attr('x1') && $('#couplingBar:hover').length == 0) {
          if ($('#rightCouplingControl:hover').length == 0) {
            if (GUI.defaultZoomPanState('right', false, event))
              return;
          }
        } else {
          if ($('#leftCouplingControl:hover').length == 0) {
            if (GUI.defaultZoomPanState('left', false, event))
              return;
          }
        }
      }

      if (clickedObject) {
        // Objects with restricted moving areas should get the "native" events
        // Only if clicked on the moving area, e.g. actionbar the default event handling
        // should be prevented
        if (!clickedObject.restrictedMovingArea || $(event.target).hasClass("moveArea")) {
          event.preventDefault();
          event.stopPropagation();
        }

        clickedObject.click(event);
      } else {
        /* clicked on background */
        event.preventDefault();
        event.stopPropagation();
        GUI.rubberbandStart(event);
        GUI.updateInspector(true);
        //GUI.rightmanager.update(); // We use the deselectHandler of the GeneralObject. Perhaps we do not need this...
      }

    };

    var mousemove = function(event) {

      var x = event.clientX;
      var y = event.clientY;

      var images = $('image');

      $.each(images, function(index, image) {

        var parent = $(image).parent();

        if (!image.hasPixelAtMousePosition) {
          //console.log('Missing hasPixelAtMousePosition for ',parent);
          return;
        }

        if (image.hasPixelAtMousePosition(x, y)) {
          parent.attr('pointer-events', 'visiblePainted');
        } else {
          parent.attr('pointer-events', 'none');
        }
      });
      
    };

    $("#content>svg").bind("mousedown", mousedown);
    $("#content>svg").bind("mousemove", mousemove);
  }
};


/**
 * Get the topmost object at point x,y which is visible
 *@function getObjectAt
 * @param {int} x x position
 * @param {int} y y position * 
 * @returns {type} description
 */
GUI.getObjectAt = function(x, y) {

  var clickedObject = false;

  $.each(ObjectManager.getObjectsByLayer(), function(key, object) {

    var rep = object.getRepresentation();

    if (!object.getAttribute("visible") && !$(rep).hasClass("webarena_ghost"))
      return;

    if (object.hasPixelAt(x, y)) {
      clickedObject = object;
      return;
    }
  });

  return clickedObject;
};

/**
 * List of object mime types which can be represented by a preview image
 */
GUI.previewableMimeTypes = undefined;

/**
 * Load list of mime types for GUI.previewableMimeTypes
 * @function loadListOfPreviewableMimeTypes
 */
GUI.loadListOfPreviewableMimeTypes = function() {
  /* get list of inline displayable mime types */

  Modules.Dispatcher.query('getPreviewableMimeTypes', {}, function(list) {
    GUI.previewableMimeTypes = list;
  });

};

/**
 * Check if a preview image can be generated for an object with the given mime type.
 * @function mimeTypeIsPreviewable
 * @param {String} mimeType mime type to check for
 */
GUI.mimeTypeIsPreviewable = function(mimeType) {

  if (GUI.previewableMimeTypes == undefined) {
    GUI.loadListOfPreviewableMimeTypes();
    return false;
  } else {
    if (GUI.previewableMimeTypes[mimeType]) {
      return true;
    } else {
      return false;
    }
  }
};

/**
 * GUI specific display of general messages (and complex control dialogs)
 * @function dialog
 * @param {String} heading A title for the dialog
 * @param {String|DOMObject} content A message or DOM object that will be used as the body of the dialog
 * @param {Object} [buttons] The Buttons of the dialog (e.g. close, save, ...)
 * @param {int} [dialogWidth=auto] The width of the dialog
 * @param {bool} [passThrough] Additional options for the dialog
 * @returns {jQueryDialogObject} The created jQuery dialog object
 *
 * Form of buttons param:
 *
 * {
 * 		"title of this button" : function() {
 * 			//button callback
 * 		},
 * 		...
 * }
 *
 */
GUI.dialog = function(heading, content, buttons, dialogWidth, passThrough) {

  GUI.blockKeyEvents = true;

  if (buttons == undefined) {

    var buttons = {};

    buttons[GUI.translate("close")] = function() {
      //nothing
    };

  }

  var dialogContent = document.createElement("div");
  $(dialogContent).attr("title", heading);
  $(dialogContent).append(content);

  var buttons2 = {};

  $.each(buttons, function(title, callback) {
    buttons2[title] = function() {
      var result = callback(dialogContent);
      if(result == undefined || result == true){
    	  $(this).dialog("close");
      }
    };
  });

  if (dialogWidth == undefined) {
    dialogWidth = "auto";
  }

  var dialogOptions = {
    modal: true,
    resizable: false,
    buttons: buttons2,
    zIndex: 100000,
    width: dialogWidth,
    close: function() {
      $(this).remove();
      GUI.blockKeyEvents = false;
    }
  };

  if (typeof passThrough === "object") {
    $.extend(dialogOptions, passThrough);
  }


  return $(dialogContent).dialog(dialogOptions);
};

/**
 * GUI specific display of errors
 * @function error
 * @param {String} heading A title for the upload dialog
 * @param {String} message A message including the errors message
 * @param {webarenaObject} [webarenaObject] An optional webarena object the error is related to
 * @param {bool} fatal True if the error is fatal and the webpage has to be reloaded after displaying the error
 */
GUI.error = function(heading, message, webarenaObject, fatal) {

  var translate = function(text) {
    if (!webarenaObject) {
      return GUI.translate(text);
    } else {
      return webarenaObject.translate(GUI.currentLanguage, text);
    }
  };

  var errorButtons = {};

  if (fatal) {
    errorButtons[GUI.translate("Reload")] = function() {
      window.location.reload();
    };
  } else {
    errorButtons[GUI.translate("Close Dialog")] = function() {
      $(this).dialog("close");
    };
  }

  var heading = translate(heading);
  var message = '<p>' + translate(message) + '</p>';

  GUI.dialog(heading, message, errorButtons);

};

/**
 * called when the socket is disconnected
 * @function disconnected
 */
GUI.disconnected = function() {
  GUI.showDisconnected();
  GUI.isLoggedIn = false;
};


/**
 * Called when the socket is connected
 * @function connected
 */
GUI.connected = function() {
  if (GUI.relogin === true) {
    if (GUI.couplingModeActive) {
      GUI.closeCouplingMode();
    }

    GUI.relogin = false;
    GUI.login();
  }
};

/**
 * Display a error message on disconnect
 * @function showDisconnected
 */
GUI.showDisconnected = function() {

  if ($("#disconnected_message").length == 0)
    $("body").append('<div id="disconnected_message"><div>Die Verbindung wurde getrennt.</div></div>');

  GUI.isLoggedIn = false;
  GUI.relogin = true;
};


/**
 * Timer to prevent objects "flying in" when getting a bunch of new objects (room load)
 * @function startNoAnimationTimer
 */
GUI.startNoAnimationTimer = function() {
  GUI.noAnimation = window.setTimeout(function() {
    GUI.noAnimation = undefined;
  }, 2000);
};

/**
 * Ask user to confirm the question in the message
 * @function confirm
 * @param {String}  message   The question that the user has to confirm.
 * @return {String} .
 */
GUI.confirm = function(message) {
  return confirm(message);
};
