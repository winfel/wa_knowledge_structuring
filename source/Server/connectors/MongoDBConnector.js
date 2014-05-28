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
var db = null;

var rooms;

/**
* @function init
* @param theModules
*/
mongoConnector.init = function(theModules) {
    this.Modules = theModules;
    db = require('monk')(theModules.MongoDBConfig.getURI());
    
    rooms = db.get('rooms');
}

/**
*   logs the user in on the backend. The main purpose of this function is not
*   necessary a persistent connections but verifying the user's credentials
*   and in case of a success, return a user object with username, password and
*   home room for later usage.
*
*   If the login was successful, the newly created user object is sent to a
*   response function.
*   
* @function login
* @param username
* @param password
* @param externalSession
* @param context
* @param rp
*
*/
mongoConnector.login = function(username, password, externalSession, context, rp) {
    this.Modules.Log.debug("Login request for user '" + username + "'");
    
    var data = {};
    data.username = username.toLowerCase();
    data.password = password;
    data.home = "public";
    
    rp(data);
}

/**
 * @function isLoggedIn
 * @param context
 */
mongoConnector.isLoggedIn = function(context) {
    console.log("ALEX mongoConnector.isLoggedIn");
    return true;
}

//-------------------------RIGHTS ----------------------------------------------
// TODO: discuss this with the rightmanager group

/**
 * About rights
 * 
 * @function mayWrite
 * @param roomID
 * @param objectID
 * @param connection
 * @param callback
 */
mongoConnector.mayWrite = function(roomID, objectID, connection, callback) {
    console.log("ALEX mongoConnector.mayWrite");
    callback(null, true);
}
/**
 * About rights
 * 
 * @function mayRead
 * @param roomID
 * @param objectID
 * @param connection
 * @param callback
 */
mongoConnector.mayRead = function(roomID, objectID, connection, callback) {
    console.log("ALEX mongoConnector.mayRead");
    callback(null, true);
}
/**
 * About rights
 * 
 * @function mayDelete
 * @param roomID
 * @param objectID
 * @param connection
 * @param callback
 */
mongoConnector.mayDelete = function(roomID, objectID, connection, callback) {
    console.log("ALEX mongoConnector.mayDelete");
    callback(null, true);
}

/**
 * About rights
 * 
 * @function mayEnter
 * @param roomID
 * @param connection
 * @param callback
 */
mongoConnector.mayEnter = function(roomID, connection, callback) {
    console.log("ALEX mongoConnector.mayEnter");
    callback(null, true);
}

/**
 * @function mayInsert
 * @param roomID
 * @param connection
 * @param callback
 */
mongoConnector.mayInsert = function(roomID, connection, callback) {
    console.log("ALEX mongoConnector.mayInsert");
    callback(null, true);
}

//-----------------------------------------------------------------

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
    
    this.Modules.Log.debug("Get data for room (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    
    if (callback === undefined) {
        console.warn('ERROR: callback muss not be undefined');
    }
    
    var self = this;
    var obj = getObjectDataFromDB(roomID, roomID, function (obj) {
        
        if (!obj) {
            
            obj = {};
            obj.id = roomID;
            obj.name = roomID;
            
            if (oldRoomId) {
                obj.parent = oldRoomId;
            }
            
            self.saveObjectData(roomID, roomID, obj, function() {
                self.Modules.Log.debug("Created room (roomID: '" + roomID + "', user: '" + self.Modules.Log.getUserFromContext(context) + "', parent:'" + oldRoomId + "')");
                
                self.getRoomData(roomID, context, callback, oldRoomId);
            }, context, true)
        } else {
            callback(obj);
        }
         
    });
}

/**
*   internal
*   read an object file and return the attribute set
*   @function getObjectDataByFile
*   @param roomID
*   @param objectID
*   @param callback
*/
function getObjectDataFromDB (roomID, id, callback) {
    console.log("ALEX mongoConnector.getObjectDataFromDB");
    
    console.log("roomID: " + roomID);
    console.log("id: " + id);

    rooms.find({id: id}, {}, function(err, doc) {
        if (err || doc === null || doc === undefined) callback(false);
        if (doc.length === 0) callback(false);
        else callback(doc[0]);
    });
}


/**
 * save the object (by given data) if an "after" function is specified, it is
 * called after saving
 * 
 * @function saveObjectData
 * @param roomID
 * @param objectID
 * @param data
 * @param after
 * @param context
 * @param {boolean} createIfNotExists
 */
mongoConnector.saveObjectData = function(roomID, objectID, data, after, context, createIfNotExists) {
    console.log("ALEX mongoConnector.saveObjectData");

    this.Modules.Log.debug("Save object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    if (!data)    this.Modules.Log.error("Missing data");
    
    console.log("Data to be saved: " + JSON.stringify(data));
    console.log("roomID: " + roomID);
    console.log("objectID: " + objectID);
    
    // saved the room data
    rooms.insert(data, after);
}

/**
*   Returns the attribute set of an object
*   
*   @function getObjectData
*   @param roomID
*   @param objectID
*   @param context
*/
mongoConnector.getObjectData = function(roomID, objectID, context) {
    console.log("ALEX mongoConnector.getObjectData");

    this.Modules.Log.debug("Get object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");

    var obj = getObjectDataFromDB(roomID, objectID);

    return obj;    
}

/**
* returns the room hierarchy starting by given roomID as root
*   @function getRoomHierarchy
*   @param roomID
*   @param context
*   @param callback
*/
mongoConnector.getRoomHierarchy = function(roomID, context, callback) {
    console.log("ALEX mongoConnector.getRoomHierarchy");
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
    
    // return this.getRoomData("trash", context, callback);
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
mongoConnector.createObject = function(roomID, type, data, context, callback) {
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
mongoConnector.duplicateObject = function(roomID, toRoom, objectID, context, callback) {
	console.log("ALEX mongoConnector.duplicateObject");
}

/**
*	@function trimImage
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.trimImage = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.trimImage");
}

/**
*	@function isInlineDisplayable
*	@param mimeType
*/
mongoConnector.isInlineDisplayable = function(mimeType) {
	console.log("ALEX mongoConnector.isInlineDisplayable");
}

/**
*	@function getMimeTyp
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.getMimeType = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.getMimeType");
}

/**
* SYNC
*	@function getInlinePreviewProviderName
*	@param mimeType
*/
mongoConnector.getInlinePreviewProviderName = function(mimeType) {
	console.log("ALEX mongoConnector.getInlinePreviewProviderName");
}

/**
* SYNC
*	@function getInlinePreviewMimeTypes
*/
mongoConnector.getInlinePreviewMimeTypes = function() {
	console.log("ALEX mongoConnector.getInlinePreviewMimeTypes");
}

/**
* SYNC
*	@function getInlinePreviewProviders
*/
mongoConnector.getInlinePreviewProviders = function() {
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
mongoConnector.getInlinePreviewDimensions = function(roomID, objectID, mimeType, context, callback) {
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
mongoConnector.getInlinePreview = function(roomID, objectID, mimeType, context, callback) {
	console.log("ALEX mongoConnector.getInlinePreview");
}

/**
*	@function getInlinePreviewMimeType
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.getInlinePreviewMimeType = function(roomID, objectID, context, callback) {
	console.log("ALEX mongoConnector.getInlinePreviewMimeType");
}

///**
//* Head function and some subfunctions included, 
//* @function inlinePreviewProviders
//*/
//mongoConnector.inlinePreviewProviders = {
//		console.log("ALEX mongoConnector.inlinePreviewProviders");
//}

module.exports = mongoConnector;