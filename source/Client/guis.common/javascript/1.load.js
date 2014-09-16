"use strict";
/**
 * @file 1.load.js
 */

var GLOBAL_SPACE_NAME = 'public';

/**
 * Indicates if the GUI is fully loaded
 */
GUI.loaded = false;

/**
 * Called when a room is entered
 * @function entered
 */
GUI.entered = function () {
  //if entering the Global Space, Toolbar and Sidebar shouldn't be shown 
  if (ObjectManager.getRoomID() == GLOBAL_SPACE_NAME) {
    GUI.hideToolbar();
    GUI.sidebar.hide();
  } else {
    GUI.showToolbar();
    GUI.sidebar.show();
  }
  if (GUI.loaded) {
    // GUI was loaded before --> this is a room change
    GUI.progressBarManager.addProgress(GUI.translate('changing room'), "login");
  }

  GUI.loadGUI(2);
};

/**
 * Load of GUI (seperated in different steps to ensure working dependencies).
 * Step 1 indicates
 * @function loadGUI
 * @param {int} step Loading step which should be performed
 */
GUI.loadGUI = function (step) {

  // Not logged in?
  if (!GUI.username) {
    // Setup svg area
    GUI.initSVG(); //build svg area using div #content //needs: nothing
    GUI.showLogin();
    return;
  }

  switch (step) {
    case undefined:
    case 1:
      // Login

      GUI.progressBarManager.updateProgress("login", 20);

      // We aren't logged in yet and yet we are initializing the chat?
      if (!GUI.loaded) {
        GUI.chat.init();
      }

      GUI.chat.clear(); //clear chats messages

      if (!GUI.loaded) {
        GUI.sidebar.init(); //init sidebar
      }

      // Login to the server
      ObjectManager.login(GUI.username, GUI.password, GUI.externalSession);
      GUI.externalSession = false;
      break;

    case 2:
      // Called 

      GUI.progressBarManager.updateProgress("login", 40);

      if (!GUI.loaded)
        GUI.loadListOfPreviewableMimeTypes();

      // Wait 200 ms before executing step 3
      window.setTimeout(function () {
        GUI.loadGUI(3);
      }, 200);

      break;

    case 3:
      // Loading the GUI: Initialize the inspector, input event handlers, the toolbar,
      // a resize handler and finally setup the inspector.

      GUI.progressBarManager.updateProgress("login", 60, GUI.translate('loading GUI'));
      GUI.startNoAnimationTimer(); //timer to prevent "flying" objects when getting the new list of objects for the room

      if (!GUI.loaded) {
        // Init updating of attributes in inspector
        GUI.initInspectorAttributeUpdate();

        // Key handling
        // Handle delete key events to delete selected objects //needs: ObjectManager.getSelected on keydown
        GUI.initObjectDeletionByKeyboard();

        // Handle shift key events //needs: nothing
        GUI.initUndoByKeyboard();

        GUI.initShiftKeyHandling();

        // Handle arrow key events to move objects //needs: ObjectManager.getSelected on keydown
        GUI.initMoveByKeyboard();

        // Handle ctrl+c, ctrl+x, ctrl+v for copy, cut and paste objects
        // Needs: ObjectManager.cutObjects, ObjectManager.copyObjects, ObjectManager.pasteObjets, ObjectManager.getSelected on keydown
        GUI.initObjectCopyCutPasteHandlingByKeyboard();

        // Toolbar. Needs: ObjectManager
        GUI.initToolbar();

        GUI.rightmanager.init();
        GUI.rightmanagerDialog.init();
        GUI.tabs.init();
        GUI.search.init();

      }

      // Adjust svg area
      GUI.adjustContent(); //first scaling of svg area (>= viewport) //needs: ObjectManager.getCurrentRoom

      // Window resizing
      if (!GUI.loaded) {
        // Scale up room if it's too small
        // Needs: ObjectManager.getCurrentRoom on document resize
        GUI.initResizeHandler();

        // Inspector (add inspector buttons, ...)
        GUI.setupInspector();
      }

      // Wait 200 ms before executing step 4
      window.setTimeout(function () {
        GUI.loadGUI(4);
      }, 200);

      break;

    case 4:
      // Rendering objects?? Nothing happens here...
      GUI.progressBarManager.updateProgress("login", 80, GUI.translate('rendering objects'));

      if (!GUI.loaded) {
        // Add mouse input event handlers.
        GUI.initMouseHandler();
      }

      // Wait 200 ms before executing step 5
      window.setTimeout(function () {
        GUI.loadGUI(5);
      }, 200);
      break;

    case 5:
      // Aligning objects
      GUI.progressBarManager.updateProgress("login", 90, GUI.translate('aligning objects'));
      GUI.updateLayers(); //update z-order by layer-attribute
      GUI.updateInspector();
      // Initially the public room is selected...
      GUI.rightmanager.update();
      
      GUI.loaded = true;
      GUI.hideLogin();

      //ObjectManager.paintingUpdate();
      break;

    default:
      console.error("unknown load step");
      break;
  }
};

/**
 * Start loading with step 1 when the document is ready (DOMReady)
 */
$(function () {
  GUI.loadGUI(1);
});
