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
   * Returns all existing main tags in format ["id", "name"]
   * (without corresponding secondary tags)
   * 
   * @param {type} callback
   * @return {undefined}
   */
  this.getMainTags = function(callback) {

    Dispatcher.registerCall("getMainTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getMainTags");
    });

    Modules.SocketClient.serverCall('getMainTags');
  };
  
  /**
   * Returns all existing main tags
   * with corresponding secondary tags
   * 
   * @param {type} callback
   * @return {type} data All main tags
   */
  this.getMainTagsAndSecTags = function(callback) {

    Dispatcher.registerCall("getMainTagsAndSecTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getMainTagsAndSecTags");
    });

    Modules.SocketClient.serverCall('getMainTagsAndSecTags');
  };
  
  /**
   * Creates a new Main Tag with the specified name and id
   * 
   * @param {type} mainTag The name of the new main tag.
   * @param {type} newId The ID of the new main tag.
   * @return {undefined}
   */
  this.updMainTags = function(mainTag, newId) {

    Modules.SocketClient.serverCall('updMainTags', {
		'mainTag': mainTag,
		'newId': newId,
	});
  }
  
  /**
   * Updates the name of the specified main tag
   * 
   * @param {type} oldName The old name of the main tag.
   * @param {type} newName The new name of the main tag.
   * @param {type} tagID The ID of the main tag.
   * @return {undefined}
   */  
  this.updMainTagName = function(oldName, newName, tagID) {

    Modules.SocketClient.serverCall('updMainTagName', {
		'oldName': oldName,
		'newName': newName,
		'tagID': tagID
	});
  };
  
  /**
   * Deletes the specified main tag
   * 
   * @param {type} mainTagID The id of the main tag.
   * @param {type} callback callback function
   * @return {type} result Result which says whether action was successful or not
   */
  this.deleteMainTag = function(mainTagID, callback) {

	Dispatcher.registerCall("deleteMainTag", function(result) {
	    callback(result);
	    Dispatcher.removeCall("deleteMainTag");
	});
	  
    Modules.SocketClient.serverCall('deleteMainTag', {
        'mainTagID': mainTagID,
    });
  };
  
  /**
   * Updates name of the specified secondary tag
   * 
   * @param {type} mainTag The name of the main tag.
   * @param {type} oldName The old name of the secondary tag.
   * @param {type} newName The new name of the secondary tag.
   * @return {undefined}
   */
  this.updSecTagName = function(mainTag, oldName, newName) {

    Modules.SocketClient.serverCall('updSecTagName', {
    	'mainTag': mainTag,
		'oldName': oldName,
		'newName': newName,
	});
  };
  
  
  /**
   * Moves the specified secondary tag from one main tag to another one
   * 
   * @param {type} oldMainTag The name of old main tag.
   * @param {type} newMainTag The name of new main tag.
   * @param {type} secTag The name of the secondary tag.
   * @return {undefined}
   */
  this.moveSecTag = function(oldMainTag, newMainTag, secTag) {

    Modules.SocketClient.serverCall('moveSecTag', {
    	'oldMainTag': oldMainTag,
		'newMainTag': newMainTag,
		'secTag': secTag,
	});
  };
  
  /**
   * Add new secondary tag in the list of secondary tags 
   * of the specified main tag
   * 
   * @param {type} mainTag The main tag.
   * @param {type} secTag The name of the newly added secondary tag.
   * @return {undefined}
   */
  this.updSecTags = function(mainTag, secTag) {

    Modules.SocketClient.serverCall('updSecTags', {
        'mainTag': mainTag,
        'secTag': secTag
    });
  };
  
  /**
   * Deletes the specified secondary tag from the list of 
   * secondary tags of the specified main tag 
   * In case that some files tagged with this file exist,
   * deletion is not performed
   * 
   * @param {type} mainTag The main tag.
   * @param {type} secTag The secondary tag to be deleted.
   * @param {type} callback callback function
   * @return {type} result Result which says whether action was successful or not
   */
  this.deleteSecTags = function(mainTag, secTag, callback) {

	Dispatcher.registerCall("deleteSecTags", function(result) {
	    callback(result);
	    Dispatcher.removeCall("deleteSecTags");
	});
	  
    Modules.SocketClient.serverCall('deleteSecTags', {
        'mainTag': mainTag,
        'secTag': secTag
    });
  };
  

  /**
   * Returns all secondary tags for a specified main tag 
   * 
   * @param {type} mainTag The main tag for which secondary tags are returned.
   * @param {type} callback callback function 
   * @return {type} data All secondary tags
   */
    this.getSecTags = function(mainTag, callback) {

        Dispatcher.registerCall("getSecTags", function(data) {
            callback(data);
            Dispatcher.removeCall("getSecTags");
        });

        Modules.SocketClient.serverCall('getSecTags', {
            'mainTag' : mainTag
        });
    };
  
};