/**
*    Webarena - A web application for responsive graphical knowledge work
*    
*    @class FileConnector
*    @classdesc Connects to the database
*    
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*/
"use strict";

var mongoConnector = {};
var Modules = false;

/**
* @function init
* @param theModules
*/
mongoConnector.init = function(theModules){
    this.Modules = theModules;
}

/**
 * @function listRooms
 * @param callback
 */
mongoConnector.listRooms = function(callback) {
    console.log("ALEX mongoConnector.listRooms");
    
}

/**
* returns all objects in a room (no actual objects, just their attributeset)
* @function getInventory
* @param roomID
* @param context
* @param callback
*   
*
*/
mongoConnector.getInventory = function(roomID, context, callback) {
    console.log("ALEX fileConnector.getInventory");
}

/**
 *  Get room data or create room, if doesn't exist yet.
 *  @function getRoomData
 *
 * @param roomID
 * @param context
 * @param callback
 * @param oldRoomId - id of the parent room
 * @returns {*}
 */
mongoConnector.getRoomData = function(roomID, context, callback, oldRoomId) {
    console.log("ALEX mongoConnector.getRoomData");
}

/**
* returns the room hierarchy starting by given roomID as root
*   @function getRoomHierarchy
*   @param roomID
*   @param context
*   @param callback
*
*/
mongoConnector.getRoomHierarchy = function(roomID, context, callback) {
    console.log("ALEX mongoConnector.getRoomHierarchy");
}

/**
*   save the object (by given data)
*   if an "after" function is specified, it is called after saving
*   @function saveObjectData
*   @param roomID
*   @param objectID
*   @param data
*   @param after
*   @param context
*   @param {boolean} createIfNotExists
*
*/
mongoConnector.saveObjectData = function(roomID, objectID, data, after, context, createIfNotExists) {
    console.log("ALEX mongoConnector.saveObjectData");
}

/**
 * save the object's content if an "after" function is specified, it is called
 * after saving
 * 
 * @function saveContent
 * @param roomID
 * @param objectID
 * @param content
 * @param after
 * @param context
 * @param inputIsStream
 * 
 */
mongoConnector.saveContent = function(roomID, objectID, content, after, context, inputIsStream) {
    console.log("ALEX mongoConnector.saveContent");
}

/**
*   save a users painting
*   if an "after" function is specified, it is called after saving
*   @function savePainting
*   @param roomID
*   @param content
*   @param after
*   @param context
*/
mongoConnector.savePainting = function(roomID, content, after, context) {
    console.log("ALEX mongoConnector.savePainting");
}

/**
 * deletePainting delete a users Painting
 * 
 * @function deletePainting
 * @param roomID
 * @param callback
 * @param context
 */
mongoConnector.deletePainting = function(roomID, callback, context) {
    console.log("ALEX mongoConnector.deletePainting");
}

/**
*   getPaintings
*   returns all paintings in a room (no actual objects, just a number of users with paintings)
*   @function getPaintings
*   @param roomID
*   @param context
*   @param callback
*/
mongoConnector.getPaintings = function(roomID, context, callback) {
    console.log("ALEX mongoConnector.getPaintings");
}

/**
 * get an object's content as an array of bytes
 * 
 * @function getContent
 * @param roomID
 * @param objectID
 * @param context
 * @param callback
 * 
 */
mongoConnector.getContent = function(roomID, objectID, context, callback) {
    console.log("ALEX mongoConnector.getContent");
}

/**
*   @function getContentStream
*   @param roomID
*   @param objectID
*   @param context
*   
*/
mongoConnector.getContentStream = function(roomID, objectID, context) {
    console.log("ALEX mongoConnector.getContentStream");
}

/**
*   @function getPaintingStream
*   @param roomID
*   @param users
*   @param context
*   
*/
mongoConnector.getPaintingStream = function(roomID, user, context) {
    console.log("ALEX mongoConnector.getPaintingStream");
}

/**
 * @function getTrashRoom
 * @param context
 * @param callback
 * @returns {*}
 */
mongoConnector.getTrashRoom = function(context, callback) {
    console.log("ALEX mongoConnector.getTrashRoom");
    
    return this.getRoomData("trash", context, callback);
}

/**
 * remove an object from the persistence layer
 * 
 * @function remove
 * @param roomID
 * @param objectID
 * @param context
 * @param callback
 * 
 */
mongoConnector.remove = function(roomID, objectID, context, callback) {
    console.log("ALEX mongoConnector.remove");
}

module.exports = mongoConnector;