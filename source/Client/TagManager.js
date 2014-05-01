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

  /**
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.updSecTags = function(mainTag, secTag) {

    Modules.SocketClient.serverCall('updSecTags', {
		'mainTag': mainTag,
		'secTag': secTag
	});
  };
  
   /**
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.deleteSecTags = function(mainTag, secTag) {

    Modules.SocketClient.serverCall('deleteSecTags', {
		'mainTag': mainTag,
		'secTag': secTag
	});
  };
  
    /**
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.updMainTags = function(mainTag, newId) {

    Modules.SocketClient.serverCall('updMainTags', {
		'mainTag': mainTag,
		'newId': newId,
	});
  };
  
  
};