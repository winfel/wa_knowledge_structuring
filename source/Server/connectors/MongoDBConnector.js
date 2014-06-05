/**
*    Webarena - A web application for responsive graphical knowledge work
*    
*    @class FileConnector
*    @classdesc Connects to the database
*    
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*/
"use strict";

var _ = require('underscore');

var mongoConnector = {};
var Modules = false;
var db = null;

var async = require('async');

var rooms;
var objects;
var paintings;

/**
* @function init
* @param theModules
*/
mongoConnector.init = function(theModules) {
    this.Modules = theModules;
    db = require('monk')(theModules.MongoDBConfig.getURI());
 
    rooms   = db.get('rooms');
    objects = db.get('objects');
    paintings = db.get('paintings');
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
    callback(null, true);
}

/**
 * @function mayInsert
 * @param roomID
 * @param connection
 * @param callback
 */
mongoConnector.mayInsert = function(roomID, connection, callback) {
    callback(null, true);
}

//-----------------------------------------------------------------

/**
 * @function listRooms
 * @param callback
 */
mongoConnector.listRooms = function(callback) {
    console.log("ALEX mongoConnector.listRooms");
    
    var promise =  rooms.find(); // return a promise
    promise.on('complete', function(err, rooms){
    	if (err || rooms === undefined || rooms.length === 0) {
            console.warn("ERROR: " + err);
            callback(false);
        } else {
        	callback(null, rooms);
        }    	
    });
}

/**
* returns all objects in a room (no actual objects, just their attribute set)
* @function getInventory
* @param roomID
* @param context
* @param callback
*/
mongoConnector.getInventory = function(roomID, context, callback) {
    var self = this;
    this.Modules.Log.debug("Request inventory (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) throw new Error('Missing context in getInventory');

    if (!this.isLoggedIn(context)) {
        this.Modules.Log.error("User is not logged in (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
    }
    
    var promise = getObjectsByRoom(roomID);
    promise.on('complete', function(err, objects) {
        
       var inventory = [];
       
       if (!err && objects !== undefined && objects.length > 0) {    
           for (var i in objects) {
               var obj = objects[i];
               var data = buildObjectFromDBObject(roomID, obj);
               inventory.push(data);
           }
       }
       
       // we also return the room data as part of the inventory
       var promise2 = getRoomFromDB(roomID);
       promise2.on('complete', function(err, room) {
           
           if (!err && room) {  
               var data = buildObjectFromDBObject(roomID, room);
               inventory.push(data);
           }
           
           callback(inventory); 
       });
        
    });
}


/**
*   internal
*   Builds a data object from the database data
*   
*   @param roomID
*   @param attributes
*/
function buildObjectFromDBObject (roomID, attributes) {
    var data = {};
    
    data.attributes = attributes;
    
    data.type = data.attributes.type;
    data.id = attributes.id;                           
    data.attributes.id = data.id;
    data.inRoom = roomID;
    data.attributes.inRoom = roomID;
    data.attributes.hasContent = false;
    
    // assure rooms do not loose their type
    if (roomID == data.id){
        data.type = 'Room';
        data.attributes.type = 'Room';
    }
    
    // TODO: Check this
    if (false) {
        data.attributes.hasContent = true;
        data.attributes.contentAge = new Date().getTime();
    }
    
    return data;
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
    this.Modules.Log.debug("Get data for room (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    
    if (callback === undefined) {
        console.warn('ERROR: callback muss be defined');
    }
    
    var self = this;
    var promise = getRoomFromDB(roomID);
    promise.on('success', function(obj) {
        
        if (!obj) {    
            obj = {};
            obj.id = roomID;
            obj.name = roomID;
            obj.type = "Room";
            
            console.log("roomID: " + roomID);
            
            if (oldRoomId) {
                obj.parent = oldRoomId;
            }
            
            var promise = self.saveRoom(roomID, obj, context);
            promise.on('success', function(doc) {
                self.Modules.Log.debug("Created room (roomID: '" + roomID + "', user: '" + self.Modules.Log.getUserFromContext(context) + "', parent:'" + oldRoomId + "')");
                
                self.getRoomData(roomID, context, callback, oldRoomId);
            });
        } else {
            var room = buildObjectFromDBObject(roomID, obj);
            callback(room);
        } 
    });
}

/**
 * save the object (by given data) 
 * 
 * @function saveObjectData
 * @param roomID
 * @param objectID
 * @param data
 * @param cb not use, left hier for compatibility reasons 
 * @param context
 */
mongoConnector.saveObjectData = function(roomID, objectID, data, cb, context) {
    this.Modules.Log.debug("Save object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    if (!data)    this.Modules.Log.error("Missing data");
    
    if (roomID == objectID) {
        var promise = updateRoom(objectID, data);
        promise.on('complete', function(err, objects) {
            if (err) {
                console.warn("mongoConnector.saveObjectData error: " + err);
            }
        });
    } 
    
    if (roomID != objectID) {
        var promise = updateObject(objectID, data);
        promise.on('complete', function(err, objects) {
            if (err) {
                console.warn("mongoConnector.saveObjectData error: " + err);
            }
        });
    } 
}

/**
*   create a new object on the persistence layer
*   to directly work on the new object, specify a callback function
*   after(objectID)
*   @function createObject
*   @param roomID
*   @param type
*   @param data
*   @param context
*   @param callback
*
*/
mongoConnector.createObject = function(roomID, type, data, context, callback) {
     if (!context) this.Modules.Log.error("Missing context");
     this.Modules.Log.debug("Create object (roomID: '" + roomID + "', type: '" + type + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
        
     var uuid = require('node-uuid');
     var objectID = uuid.v4();
        
     data.type = type;
     data.id = objectID;
     data.inRoom = roomID;
        
     if (type == "Paint" || type == "Highlighter") {
         data.mimeType = 'image/png';
         data.hasContent = false;   
     }
        
     var promise = saveObject(data);
     promise.on('complete', function(err, doc) {
         if (err || doc === undefined || doc.length === 0) {
             console.warn("ERROR: " + err);
             callback(false);
         } else callback(objectID);
     });
}

/**
*   Returns the attribute set of an object
*   
*   @function getObjectData
*   @param roomID
*   @param objectID
*   @param context
*/
mongoConnector.getObjectData = function(roomID, objectID, context, callback) {
    this.Modules.Log.debug("Get object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    
    if (roomID == objectID) {
        
        // This is a room
        var promise = getRoomFromDB(objectID);
        promise.on('complete', function(err, room) {
            
            if (err || !room) {
                console.warn("ERROR: mongoConnector.getObjectData object not found " + err);
                callback(false);
            } else { 
                var data = buildObjectFromDBObject(objectID, room);
                callback(data);
            }
        });
        
    } else {
        var promise = getObjectDataFromDB(objectID);
        promise.on('complete', function(err, obj) {
            
            if (err || !obj) {
                console.warn("ERROR: mongoConnector.getObjectData object not found " + err);
                callback(false);
            } else {
                var data = buildObjectFromDBObject(objectID, obj);
                callback(data);
            }
        });
    }
}

/**
 * Save the object (by given data) if an "callback" function is specified, it is
 * called after saving
 * 
 * @param roomID
 * @param data
 * @param context
 */
mongoConnector.saveRoom = function(roomID, data, context) {
    this.Modules.Log.debug("Save object data (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    if (!data)    this.Modules.Log.error("Missing data");
    
    return rooms.insert(data);
}

/**
*   internal
*   Saves and object
*   
*   @param obj to be saved
*/
function saveObject(obj) {
    return objects.insert(obj); // return a promise
}

/**
*   internal
*   read an object file and return the attribute set
*   @function getObjectDataByFile
*   @param id
*   @param callback
*/
function getObjectDataFromDB(id) {
    return objects.findOne({id: id}); // return a promise
}

/**
*   internal
*   Updates a room
*   @function getObjectDataByFile
*   @param roomID
*   @param data
*/
function updateRoom(roomID, data) {
    var aux = _.omit(data, '_id');
    return rooms.findAndModify({id: roomID}, { $set: aux });
}

/**
*   internal
*   Updates an object
*   @function getObjectDataByFile
*   @param id
*   @param data
*/
function updateObject(id, data) {
    var aux = _.omit(data, '_id');
    return objects.findAndModify({id: id}, { $set: aux });
}

/**
*   internal
*   Gets a room
*   @function getObjectDataByFile
*   @param roomID
*/
function getRoomFromDB(roomID) {
    return rooms.findOne({id: roomID}); // return a promise
}

/**
*   internal
*   Get the objects associated to a room
*   @param roomID
*/
function getObjectsByRoom (roomID) {
    return objects.find({inRoom: roomID});
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
    var self=this;
	var result = {
		'rooms' : {},
		'relation' : {},
		'roots' : []
	};

	//filter only "accessible" rooms
	var filter = function(rooms, cb){
		async.filter(rooms,
			//Filter function
			function(room, cb1){
				self.mayEnter(room, context, function(err, res){
					if(err) cb1(false);
					else cb1(res);
				});
			},
			//Response function
			function(results){
				cb(null, results);
			}
		);
	}

	var buildTree = function(rooms, cb){
		rooms.forEach(function(room){
			result.rooms[room.name] = '' + room.name;
				if (room.parent !== undefined) {
					if (result.relation[room.parent] === undefined) {
						result.relation[room.parent] = new Array('' + room.name);
					} else {
						result.relation[room.parent].push('' + room.name);
					}
				} else {
					result.roots.push('' + room.name);
				}
			});
		cb(null, result);
	}

	async.waterfall([self.listRooms, filter, buildTree], function(err, res){
		callback(res);
	});
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
    var that = this;
    this.Modules.Log.debug("Save content from string (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '" + this.Modules.Log.getUserFromContext(context)+"')");	
	if (!context) this.Modules.Log.error("Missing context");
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
    if (!context) this.Modules.Log.error("Missing context");
	
	this.Modules.Log.debug("Save painting (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	var that = this;
	var username = this.Modules.Log.getUserFromContext(context);
	
	var painting = {};
	painting.inRoom = roomID;
	painting.name = username;
	
	
	if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
	    /* create byte array */
	
	    var byteArray = [];
	    var contentBuffer = new Buffer(content);
	
	    for (var j = 0; j < contentBuffer.length; j++) {
	
	        byteArray.push(contentBuffer.readUInt8(j));
	
	    }
	
	    content = byteArray;	   
	    painting.content = new Buffer(content);	    
	}
	
	var promise = that.savePaintingInDB(roomID, painting, context);
	
	promise.on('complete', function(err) {
		 
		if (err) {
			that.Modules.Log.error("Could not write painting to file (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
			after(false);
	    } else { 
	    	 after();
	    }
	});
	
}

/**
 * Saves the painting (given by data), if an "callback" function is specified, it is
 * called after saving
 * 
 * @param roomID
 * @param data
 * @param context
 */
mongoConnector.savePaintingInDB = function(roomID, painting, context) {
    this.Modules.Log.debug("Save object data (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    if (!painting) this.Modules.Log.error("Missing data");
    
    return paintings.insert(painting);
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
    
	if (!context) this.Modules.Log.error("Missing context");
	var username = this.Modules.Log.getUserFromContext(context);
	
	this.Modules.Log.debug("Delete painting (roomID: '"+roomID+"', user: '" + this.Modules.Log.getUserFromContext(context)+"')");

	paintings.remove({ name : username}, function (err) {
		if(err) {
			this.Modules.Log.error("Could not delete painting (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context)+"')");
			callback(false);
		} else {
			callback();
		}
	});
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
    var self = this;

	this.Modules.Log.debug("Request paintings (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) throw new Error('Missing context in getInventory');
	
	if (!this.isLoggedIn(context)) this.Modules.Log.error("User is not logged in (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	var promise = paintings.find( {}, ["name"] );
	promise.on('complete', function(err, paintings) {         
		if (err) {
            console.warn("ERROR: mongoConnector.getPaintings: " + err);
            callback(false);
        } else {            
            callback(paintings);
        }
    });   
	
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
* @function getInlinePreviewMimeTypes
*/
mongoConnector.getInlinePreviewMimeTypes = function() {
	var mimeTypes = this.getInlinePreviewProviders();
    var list = {};
    
    for (var mimeType in mimeTypes){
        list[mimeType] = true;
    }
    
    return list;
}

/**
* SYNC
*	@function getInlinePreviewProviders
*/
mongoConnector.getInlinePreviewProviders = function() {
	
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