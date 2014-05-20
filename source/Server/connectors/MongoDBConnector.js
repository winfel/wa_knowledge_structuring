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

/**
*	create a new object on the persistence layer
*	to direcly work on the new object, specify a callback function
*	after(objectID)
*	@function createObject
*	@param roomID
*	@param type
*	@param data
*	@param context
*	@param callback
*
*/
fileConnector.createObject = function(roomID, type, data, context, callback) {
	 console.log("ALEX mongoConnector.createObject");
}

/**
*	duplicate an object on the persistence layer
*	to directly work on the new object, specify an after function
*	after(objectID)
* 	@function duplicateObject
*	@param roomID
*	@param toRoom
*	@param objectID
*	@param context
*	@param callback
*
*/
fileConnector.duplicateObject = function(roomID, toRoom, objectID, context, callback) {
	console.log("ALEX mongoConnector.duplicateObject");
}

/**
*	returns the attribute set of an object
* 	@function getObjectData
*	@param roomID
*	@param objectID
*	@param context
*/
fileConnector.getObjectData = function(roomID, objectID, context) {
	console.log("ALEX mongoConnector.getObjectData");
}

/**
*	internal
*	read an object file and return the attribute set
*	@function getObjectDataByFile
*	@param roomID
*	@param objectID
*/
fileConnector.getObjectDataByFile = function(roomID, objectID) {
	console.log("ALEX mongoConnector.getObjectDataByFile");
}

/**
*	@function trimImage
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.trimImage = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.trimImage");
};

/**
*	@function isInlineDisplayable
*	@param mimeType
*/
fileConnector.isInlineDisplayable = function(mimeType) {
	console.log("ALEX mongoConnector.isInlineDisplayable");
}

/**
*	@function getMimeTyp
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.getMimeType = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.getMimeType");
}

/**
* SYNC
*	@function getInlinePreviewProviderName
*	@param mimeType
*/
fileConnector.getInlinePreviewProviderName = function(mimeType) {
	console.log("ALEX mongoConnector.getInlinePreviewProviderName");
}

/**
* SYNC
*	@function getInlinePreviewMimeTypes
*/
fileConnector.getInlinePreviewMimeTypes = function() {
	console.log("ALEX mongoConnector.getInlinePreviewMimeTypes");
}

/**
* SYNC
*	@function getInlinePreviewProviders
*/
fileConnector.getInlinePreviewProviders = function() {
	console.log("ALEX mongoConnector.getInlinePreviewProviders");
	return {
		//"application/pdf" : "pdf",
		"image/jpeg" : "image",
		"image/jpg" : "image",
		"image/png" : "image",
		"image/gif" : "image",
		"image/bmp" : "image",
		"image/x-bmp" : "image",
		"image/x-ms-bmp" : "image"
	}
}

/**
*	@function getInlinePreviewDimensions
*	@param roomID
*	@param objectID
*	@param mimeType
*	@param context
*	@param callback
*/
fileConnector.getInlinePreviewDimensions = function(roomID, objectID, mimeType, context, callback) {
	console.log("ALEX mongoConnector.getInlinePreviewDimensions");
}

/**
*	@function getInlinePreview
*	@param roomID
*	@param objectID
*	@param mimeType
*	@param context
*	@param callback
*/
fileConnector.getInlinePreview = function(roomID, objectID, mimeType, context, callback) {
	console.log("ALEX mongoConnector.getInlinePreview");
}

/**
*	@function getInlinePreviewMimeType
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.getInlinePreviewMimeType = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.getInlinePreviewMimeType");
}

/**
* Head function and some subfunctions included, TODO JSDoc
*	@function inlinePreviewProviders
*/
fileConnector.inlinePreviewProviders = {
		console.log("ALEX mongoConnector.inlinePreviewProviders");
}

module.exports = mongoConnector;