// This is the CLIENT side TagManager

"use strict";

/**
 * Object providing functions for object management
 */
var TagManager = new function() {

  var that = this;
  var Dispatcher = null;

  /**
   * This function initializes the TagManager.
   * 
   * @param {type} theModules   All available modules...
   */
  this.init = function(theModules) {
    Dispatcher = theModules.Dispatcher;
  };

  
  /**
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.getMainTags = function(callback) {

    Dispatcher.registerCall("getMainTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getMainTags");
    });

    Modules.SocketClient.serverCall('getMainTags');
  };
  
  
    /**
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.getSecTags = function(mainTag, callback) {

    Dispatcher.registerCall("getSecTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getSecTags");
    });

    Modules.SocketClient.serverCall('getSecTags', {
		'mainTag': mainTag
	});
  };

};