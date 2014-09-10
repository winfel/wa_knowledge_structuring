// This is the CLIENT side TagManager

"use strict";

/**
* Object providing functions for object management
* @class TagManager
*/
var TagManager = new function() {

  var that = this;
  var Dispatcher = null;

  /**
  * This function initializes the TagManager.
   * @function init
   * @param {type} theModules   All available modules...
   * 
   */
   this.init = function(theModules) {
    Dispatcher = theModules.Dispatcher;
  };

  
  /**
   * @function getMainTags
   * @param {Function} callback
   * @return {Object} Returns all existing main tags in format ["id", "name"] (without corresponding secondary tags)
   */
   this.getMainTags = function(callback) {

    Dispatcher.registerCall("getMainTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getMainTags");
    });

    Modules.SocketClient.serverCall('getMainTags');
  };
  
  /**
   * @function getMainTagsAndSecTags
   * @param {Function} callback
   * @return {type} Returns all existing main tags with corresponding secondary tags
   */
   this.getMainTagsAndSecTags = function(callback) {

    Dispatcher.registerCall("getMainTagsAndSecTags", function(data) {
      callback(data);
      Dispatcher.removeCall("getMainTagsAndSecTags");
    });

    Modules.SocketClient.serverCall('getMainTagsAndSecTags');
  };
  
  /**
   * @function updMainTags
   * @param {type} mainTag The name of the new main tag.
   * @param {type} newId The ID of the new main tag.
   * @param {Function} callback 
   * @desc Creates a new Main Tag with the specified name and id
   */
   this.updMainTags = function(mainTag, newId, callback) {

    Dispatcher.registerCall("updMainTags", function(result) {
      callback(result);
      Dispatcher.removeCall("updMainTags");
    });

    Modules.SocketClient.serverCall('updMainTags', {
      'mainTag' : mainTag,
      'newId' : newId,
    });
  }
  
  /**
   * @function updMainTagName
   * @param {String} oldName The old name of the main tag.
   * @param {String} newName The new name of the main tag.
   * @param {type} tagID The ID of the main tag.
   * @desc Updates the name of the specified main tag
   */  
   this.updMainTagName = function(oldName, newName, tagID) {

     Dispatcher.registerCall("updMainTagName", function(result) {
      callback(result);
      Dispatcher.removeCall("updMainTagName");
    });
     Modules.SocketClient.serverCall('updMainTagName', {
      'oldName': oldName,
      'newName': newName,
      'tagID': tagID
    });
   };

  /**
   * @function deleteMainTag
   * @param {type} mainTagID The id of the main tag.
   * @param {Function} callback callback function
   * @return {type} result Result which says whether action was successful or not
   * @desc Deletes the specified main tag
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
   * @function updSecTagName
   * @param {type} mainTagID The id of the main tag.
   * @param {type} oldName The old name of the secondary tag.
   * @param {type} newName The new name of the secondary tag.
   * @desc Updates name of the specified secondary tag
   */
   this.updSecTagName = function(mainTagID, oldName, newName, callback) {

     Dispatcher.registerCall("updSecTagName", function(result) {
      callback(result);
      Dispatcher.removeCall("updSecTagName");
    });
     Modules.SocketClient.serverCall('updSecTagName', {
       'mainTagID': mainTagID,
       'oldName': oldName,
       'newName': newName,
     });
   };


  /**
   * @function moveSecTag
   * @param {type} oldMainTagID The ID of old main tag.
   * @param {type} newMainTagID The ID of new main tag.
   * @param {type} secTag The name of the secondary tag.
   * @desc Moves the specified secondary tag from one main tag to another one
   */
   this.moveSecTag = function(oldMainTagID, newMainTagID, secTag, callback) {

    Dispatcher.registerCall("moveSecTag", function(result) {
     callback(result);
     Dispatcher.removeCall("moveSecTag");
   });
    Modules.SocketClient.serverCall('moveSecTag', {
     'oldMainTagID': oldMainTagID,
     'newMainTagID': newMainTagID,
     'secTag': secTag,
   });
  };
  
  /**
   * @function updSecTags
   * @param {type} mainTag The main tag.
   * @param {type} secTag The name of the newly added secondary tag.
   * @param {type} callback callback function
   * @desc Add new secondary tag in the list of secondary tags of the specified main tag
   */
   this.updSecTags = function(mainTag, secTag, callback) {
    Dispatcher.registerCall("updSecTags", function(result) {
      callback(result);
      Dispatcher.removeCall("updSecTags");
    });

    Modules.SocketClient.serverCall('updSecTags', {
      'mainTag' : mainTag,
      'secTag' : secTag
    });
  };
  
  /**
   * @function deleteSecTags
   * @desc Deletes the specified secondary tag from the list of secondary tags of the specified main tag. In case that some files tagged with this file exist, deletion is not performed
   * @param {type} mainTag The main tag.
   * @param {type} secTag The secondary tag to be deleted.
   * @param {Function} callback callback function
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
   * @function getSecTags
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