"use strict";

var ROOM_TYPE   = 'Room';
var SUBROOM_TYPE   = 'Subroom';
var FILE_TYPE   = 'File';
var PUBLIC_ROOM  = 'public';
var TRASH_ROOM  = 'trash';
/**
*    CoW - A web application for responsive graphical knowledge work
*    
*    @class FileConnector
*    @classdesc Connects to the database
*    
*    @author University of Paderborn, 2014
*/
var mongoConnector = {};
var Modules = false;
var dbmonk = null;
var db = null;
var monk = null;

var path    = require('path');
var _       = require('underscore');
var async   = require('async');
var fs      = require('fs');
var mongo   = require('mongodb');
var GridStore = require('mongodb').GridStore;
var Grid    = require('gridfs-stream');

var gfs;
var objects;
var paintings;

/**
* @function init
* @param theModules
*/
mongoConnector.init = function(theModules) {
	var that = this;
	Modules = theModules;
    that.Modules = theModules;
    monk = require('monk'); 
    dbmonk = monk(theModules.MongoDBConfig.getURI());
       
    mongo.MongoClient.connect(theModules.MongoDBConfig.getURI(), function (err, db) {
    	if (err) { console.log("err"+ err); } 
    	that.db = db;
    	gfs = Grid(db, mongo);
    });
        
    objects = dbmonk.get('objects');
    paintings = dbmonk.get('paintings');
    
    // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/#db.collection.ensureIndex
    objects.ensureIndex( { "id": 1 }, { unique: true } );
    objects.ensureIndex( { "inRoom": 1 }, { background: true });
};

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
*/
mongoConnector.login = function(username, password, externalSession, context, rp) {
    this.Modules.Log.debug("Login request for user '" + username + "'");
    
    var data = {};
	data.username = username.toLowerCase();
	data.password = password;
	data.home = "public";

	Modules.UserDAO.usersByUserName(data.username, function(err, users) {
		if (!users || users.length == 0) {
			rp(false);
		} else {
			data = users[0];
			data.home = "public";
			rp(data);
		}
	});
};

/**
 * @function isLoggedIn
 * @param context
 */
mongoConnector.isLoggedIn = function(context) {
    return true;
};

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
};

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
};

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
};

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
};

/**
 * @function mayInsert
 * @param roomID
 * @param connection
 * @param callback
 */
mongoConnector.mayInsert = function(roomID, connection, callback) {
    callback(null, true);
};

//-----------------------------------------------------------------

/**
 * @function listRooms
 * @param callback
 */
mongoConnector.listRooms = function(callback) {
    var promise =  objects.find({type: ROOM_TYPE}); // return a promise
    promise.on('complete', function(err, rooms){
    	if (err || rooms === undefined || rooms.length === 0) {
            console.warn("ERROR mongoConnector.listRooms err : " + err);
            callback(false);
        } else {
        	callback(null, rooms);
        }    	
    });
};

/**
* returns all objects in a room (no actual objects, just their attribute set)
* @function getInventory
* @param roomID
* @param context
* @param callback
*/
mongoConnector.getInventory = function(roomID, context, callback) {
    roomID = roomID.toString();
    var self = this;
    
    if (!context) throw new Error('Missing context in getInventory');
    
    this.Modules.Log.debug("Request inventory (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!this.isLoggedIn(context)) {
        this.Modules.Log.error("User is not logged in (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
    }
    
    var inventory = [];
    
    // we also return the room data as part of the inventory
    var promise2 = getRoomFromDB(roomID);
    promise2.on('complete', function(err, room) {
        
        if (!err && room) {  
            buildObjectFromDBObject(roomID, room, function(roomData) {
                inventory.push(roomData);
                
                var promise = getObjectsByRoom(roomID);
                promise.on('complete', function(err, objects) {
                    
                   function pushToInventory(i) {
                       if (i < objects.length) {
                           buildObjectFromDBObject(roomID, objects[i], function(data) {
                               inventory.push(data);
                               pushToInventory(i+1);
                           });
                       } else {
                           callback(inventory);
                       }
                   }
                   
                   if (!err && objects !== undefined && objects.length > 0) { 
                       pushToInventory(0);
                   } else {
                       callback(inventory);
                   }
                   
                });
                
            });
        } else {
            console.warn("mongoConnector.getInventory err " + err);
            callback(false);
        }
    });
};

/**
*   internal
*   Builds a data object from the database data
*   
*   @param roomID
*   @param attr
*   @param callback
*/
function buildObjectFromDBObject (roomID, attr, callback) {
    // Remove the internal DB _id field
    var attributes = _.omit(attr, '_id');
    roomID = roomID.toString();
    var data = {};
    
    data.attributes = attributes;
    
    data.type = data.attributes.type;
    data.id = attributes.id;                           
    data.attributes.id = data.id;
    data.inRoom = data.attributes.inRoom;
    data.attributes.inRoom = roomID;
    data.attributes.hasContent = false;

	if(!mongoConnector.db) {
		Modules.Log.error(new Error('call to .buildObjectFromDBObject before database finished connecting'));
	}

	GridStore.exist(mongoConnector.db, attributes.id, function(err, result) {
		if (err) { throw err; }
		if (result) {
			//console.log ("File " + attributes.id + "  exist");
			data.attributes.hasContent = true;
			data.attributes.contentAge = new Date().getTime();	
		}

		callback(data);
	});
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
    roomID = roomID.toString();
    this.Modules.Log.debug("Get data for room (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    
    if (callback === undefined) {
        console.warn('ERROR: callback must be defined');
    }
    
    var self = this;
    var promise = getRoomFromDB(roomID);
    promise.on('success', function(obj) {
        
        if (!obj) {    
            obj = {};
            obj.id = roomID;
            obj.name = roomID;
            obj.type = ROOM_TYPE;
            
            if (oldRoomId) {
                obj.parent = oldRoomId;
            }
            
            var promise = saveObject(obj);
            promise.on('success', function(doc) {
                self.Modules.Log.debug("Created room (roomID: '" + roomID + "', user: '" + self.Modules.Log.getUserFromContext(context) + "', parent:'" + oldRoomId + "')");
                
                self.getRoomData(obj.id, context, callback, oldRoomId);
            });            
            
        } else {
            buildObjectFromDBObject(roomID, obj, function(room) {
                callback(room);
            });
        } 
    });
};

/**
 * save the object (by given data) 
 * 
 * @function saveObjectData
 * @param roomID
 * @param objectID
 * @param data
 * @param callback 
 * @param context
 */
mongoConnector.saveObjectData = function(roomID, objectID, data, callback, context) {
	roomID = roomID.toString();
    this.Modules.Log.debug("Save object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    if (!data)    this.Modules.Log.error("Missing data");
    
    var promise = updateObject(objectID, data);
    promise.on('complete', function(err, objects) {
        if (err) {
            console.warn("mongoConnector.saveObjectData error: " + err);
            if (!_.isUndefined(callback) && callback != false) callback();
        } else {
        	if (!_.isUndefined(callback) && callback != false) callback();
        }
    });
};

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
    roomID = roomID.toString();
    if (!context) this.Modules.Log.error("Missing context");
    this.Modules.Log.debug("Create object (roomID: '" + roomID + "', type: '" + type + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

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
            console.warn("ERROR mongoConnector.createObject : " + err);
            callback(false);
        } else {
            // console.log("mongoConnector.createObject: Object " + objectID + " was successfully created");
            callback(objectID);
        }
    });
};
 
/**
 * Duplicate a list of objects
 * see function duplicateObject
 */
mongoConnector.duplicateObjects = function(roomID, toRoom, objectIDs, context, callback) {
    var that = this;
    var idList = [];
    
    function dObject(i) {
        if (i < objectIDs.length) {
            that.duplicateObject(roomID, toRoom, objectIDs[i], context, function (err, newID, objectID) {
                idList.push(newID);
                dObject(i+1);
            });
        } else {
            callback(null, idList);
        }
    }
    
    dObject(0);
};

/**
 * duplicate an object on the persistence layer to directly work on the new
 * object, specify an after function after(objectID)
 * 
 * @function duplicateObject
 * @param roomID
 * @param toRoom
 * @param objectID
 * @param context
 * @param callback
 * 
 */
mongoConnector.duplicateObject = function(roomID, toRoom, objectID, context, callback) {
    roomID = roomID.toString();
    this.Modules.Log.debug("Duplicate object (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "', toRoom: '" + toRoom + "')");
    
    if (!context) this.Modules.Log.error("Missing context");
    
    var that = this;
    
    var promise = getObjectDataFromDB(objectID);
    promise.on('complete', function(err, obj) {
        
        if (err || !obj) {
            console.warn("ERROR: mongoConnector.duplicateObject object with id: " + objectID + " in room " + roomID + " not found: " + err);
            callback(err, false, false);
        } else {
            var uuid = require('node-uuid');
            var newID = uuid.v4();
            
            // modify the object
            obj.id = newID;
            obj.inRoom = toRoom;
            
            if (obj.x != undefined) {
                // So the copy do not appear in the same position
                obj.x += 20;
                obj.y += 20;
            }
            
            //console.log("File was written in the DB");
   		    var promise2 = saveObject(obj);
            promise2.on('complete', function(err, doc) {
            	if (err || doc === undefined || doc.length === 0) {
                    console.warn("ERROR mongoConnector.duplicateObject : " + err);
                    callback(err, false, false);
                } else {
                	if(obj.hasContent){ //if the object has content, also copy the content
			            var filenameSource = objectID;
			            var filenameNew = newID; // create a file in the fs.files with a name the id of the object
			            gfs.exist({ filename : filenameSource	}, function(err, found) {
			            	
			        	    if (err) {
			        	    	this.Modules.Log.debug("Could not read content from file (roomID: '"
			        	    		+ roomID + "', objectID: '" + objectID + "', user: '" + 
			        	    		this.Modules.Log.getUserFromContext(context) + "')");
			        	    	callback(err, false, false);
			        	    } else {
			        			if (found) {			
			        				// Read in the whole  file
			        		        GridStore.read(that.db, filenameSource, function(err, content) {        		        	
			        		        	if(content == null) { content = "";}			        		        	
		        						var contentBuffer = new Buffer(content);        						
		        						var gridStore2 = new GridStore(that.db, filenameNew, "w");
		        						gridStore2.open(function(err, gridStore) {
			        						gridStore.write(contentBuffer, function(err, gridStore) {
			        					    	if (err) {throw err; callback(err, false, false); }
			        					    	// Close (Flushes the data to MongoDB)
			        					        gridStore.close(function(err, result) {
			        					        	if (err) { throw err; callback(err, false, false);}
			        					        	// Verify that the file exists
			        					            GridStore.exist(that.db, filenameNew, function(err, result) {
			        					            	if(err) { 
			        					            		throw err; 
			        					            		callback(err, false, false);			        					            		
			        					            	}
			        					            	if(result){
			        					            		callback(null, newID, objectID);			        					            		
			        					            	}
			        					            });
			        					        });
			        					    });	
		        						});			        		        	          
			        		        });
			        			} else {
			        				console.log("mongoConnector.getContent " + filename + " does not exist");
			        				callback(err, false, false);
			        			}
			        		}
			        	});
	                } else {//if the object dosen't have a content
	                	callback(null, newID, objectID);
                	}
                }
            });
        }
    });
};

/**
*   move object/objects from one room to another
*   @function moveObjects
*   @param roomID
*   @param toRoom
*   @param objectIDs
*   @param context
*   @param callback
*
*/
mongoConnector.moveObjects = function(roomID, toRoom, objectIDs, objectAttributes, context, callback) {
    this.Modules.Log.debug("Move object(s) (roomID: '" + roomID + "', objectIDs: '" + objectIDs + "', user: '" + this.Modules.Log.getUserFromContext(context) + "', toRoom: '" + toRoom + "')");
    
    if (!context) this.Modules.Log.error("Missing context");
    
    var that = this;
    function updateObject(i) {
        
        if (i < objectIDs.length) {
            
            var objID = objectIDs[i];
            var obJX = (objectAttributes[objID] != undefined) ? objectAttributes[objID].x : 100;
            var objY = (objectAttributes[objID] != undefined) ? objectAttributes[objID].y : 100;
            
            that.mayInsert(toRoom, context, function (err, hasRight) { 
                if (err) {
                    console.warn("ERROR: mongoConnector.moveObjects object with id: " + objID + " in room " + roomID + ": " + err);
                } else if (!hasRight) {
                    console.warn("mongoConnector.moveObjects Can't insert into the target room!"); 
                } else {
                    
                    var promise = objects.update({id: objID}, { $set: { inRoom : toRoom, x: obJX, y: objY }} );
                    promise.on('complete', function(err, obj) {  
                        if (err || !obj) {
                            console.warn("ERROR: mongoConnector.move object with id: " + objID + " in room " + roomID + " not found: " + err);
                        } else {
                            updateObject(i + 1);
                        }
                    });
                }
            });
           
        } else {
            callback(null, objectIDs);
        }       
    }
    
    updateObject(0);
};

/**
*   Returns the attribute set of an object
*   
*   @function getObjectData
*   @param roomID
*   @param objectID
*   @param context
*   @param callback
*/
mongoConnector.getObjectData = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
    this.Modules.Log.debug("Get object data (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");

    if (!context) this.Modules.Log.error("Missing context");
    
    var promise = getObjectDataFromDB(objectID);
    promise.on('complete', function(err, obj) {
        
        if (err || !obj) {
            console.warn("ERROR: mongoConnector.getObjectData object with id: " + objectID + " in room " + roomID + " not found: " + err);
            callback(false);
        } else {
            buildObjectFromDBObject(roomID, obj, function(data) {
                callback(data);
            });
        }
    });
};

/**
*   internal
*   Saves and object
*   
*   @param obj to be saved
*/
function saveObject(obj) {
    var aux = _.omit(obj, '_id');
    return objects.insert(aux); // return a promise
}

/**
*   internal
*   read an object file and return the attribute set
*   @param id
*/
function getObjectDataFromDB(id) {
    return objects.findOne({id: id}); // return a promise
}

/**
*   internal
*   Updates a room
*   @param roomID
*   @param data
*/
function updateRoom(roomID, data) {
    var aux = _.omit(data, '_id');
    return objects.findAndModify({id: roomID}, { $set: aux });
}

/**
*   internal
*   Updates an object
*   @param id
*   @param data
*/
function updateObject(id, data) {
    var aux = _.omit(data, '_id');
    return objects.findAndModify({id: id}, { $set: aux });
}

/**
*   internal
*   removes an object
*   @param id
*/
function removeObjectFromDB(id) {
    return objects.remove({id: id});
}

/**
*   internal
*   removes a room
*   @param id
*/
function removeRoomFromDB(id) {
    return objects.remove({inRoom: id});
}

/**
*   internal
*   removes an object
*   @param id
*/
function removeObjectsContentFromDB(id) {
	GridStore.unlink(mongoConnector.db, id, function(err, gridStore) { });
}

/**
*   internal
*   moves an object to the trash room
*   @param id
*/
function moveObjectToTrashRoom(id, oldRoom) {
    return objects.update({id: id}, { $set: { inRoom : TRASH_ROOM, oldRoom: oldRoom }});
}

/**
*   internal
*   Gets a room
*   @param roomID
*/
function getRoomFromDB(roomID) {
	return objects.findOne({id: roomID}); // return a promise
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
*   Returns objects of the DB that match the query object
*   i.e. query = {mainTag: 'xx' } 
*   
*   http://mongodb.github.io/node-mongodb-native/markdown-docs/queries.html#query-object
*   
*   @function getObjectDataByQuery
*   @param query a json object containing the query
*   @param callback callback to call
*   @return a list of objects
*/
mongoConnector.getObjectDataByQuery = function(query, callback) {
    objects.find(query, function (err, objects) {
        var objectsList = [];
        
        function pushToObjects(i) {
            if (i < objects.length) {
                buildObjectFromDBObject(objects[i].inRoom, objects[i], function(data) {
                    objectsList.push(data);
                    pushToObjects(i+1);
                });
            } else {
                callback(objectsList);
            }
        }
        
        if (!err && objects !== undefined && objects.length > 0) { 
            pushToObjects(0);
        } else {
            callback(objectsList);
        }
    });
};

/**
* returns the room hierarchy starting by given roomID as root
*   @function getRoomHierarchy
*   @param roomID
*   @param context
*   @param callback
*/
mongoConnector.getRoomHierarchy = function(roomID, context, callback) {
    roomID = roomID.toString();
    var self = this;
	var result = {
		'rooms' : {},
		'relation' : {},
		'roots' : []
	};
	
	//filter only "accessible" rooms
	var filter = function(rooms, cb) {
		async.filter(rooms,
			//Filter function
			function(room, cb1) {
				self.mayEnter(room, context, function(err, res) {
					if(err) cb1(false);
					else cb1(res);
				});
			},
			//Response function
			function(results) {
				cb(null, results);
			}
		);
	}

	var buildTree = function(rooms, cb) {
		rooms.forEach(function(room) {
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

	async.waterfall([self.listRooms, filter, buildTree], function(err, res) {
		callback(res);
	});
};

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
mongoConnector.saveContent = function(roomID, objectID, content, callback, context, inputIsStream) {
    roomID = roomID.toString();
	var that = this;
	
    this.Modules.Log.debug("Save content from string (roomID: '" + roomID
		+ "', objectID: '" + objectID + "', user: '"
		+ this.Modules.Log.getUserFromContext(context) + "')");
    
    if (!context) this.Modules.Log.error("Missing context");
	
	var filename = objectID;

    if (!!inputIsStream) {
    	
    	// streaming to gridfs
    	var wr = gfs.createWriteStream({
    	    filename: filename
    	});
    	
        wr.on("error", function(err) {
            that.Modules.Log.error("Error writing file to database: " + err);
        });
        
        wr.on("close", function(file) {
            if (callback) { callback(objectID); }
        });   
        
        content.pipe(wr);
    } else {
    	writeFileInDB(filename, content, callback, objectID);		
    }
};

function writeFileInDB(filename, content, callback, callbackParam, metaData) {
	var that = this;
	if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
        
        /* create byte array */
        var byteArray = [];
        var contentBuffer = new Buffer(content);

        for (var j = 0; j < contentBuffer.length; j++) {
            byteArray.push(contentBuffer.readUInt8(j));
        }

        content = byteArray;
    }

	try {
		// Create a new instance of the gridstore
		var gridStore = new GridStore(mongoConnector.db, filename, 'w', {metadata: metaData});
		
		// Open the file
		gridStore.open(function(err, gridStore) { 
			if(err) { throw err; }
			// Write some data to the file
		    gridStore.write(new Buffer(content), function(err, gridStore) {
		    	if (err) {throw err;}
		    	// Close (Flushes the data to MongoDB)
		        gridStore.close(function(err, result) {
		        	if (err) {throw err;}
		        	// Verify that the file exists
		            GridStore.exist(mongoConnector.db, filename, function(err, result) {
		            	if(err) { throw err; }
		            	if(result){
		            		//console.log("File was written in the DB");
		            		if(callbackParam) {
		            			callback(callbackParam);
		            		} else {
		            			callback();
		            		}
		            	}
		            });
		        });
		    });
		});			  
	} catch (err) {
		Modules.Log.error("Error in writing the file: "+ filename +
				Modules.Log.getUserFromContext(context) +":  " + err + "')");
        callback(false);
    }
	
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
mongoConnector.savePainting = function(roomID, content, callback, context) {
    if (!context) this.Modules.Log.error("Missing context");
	
    this.Modules.Log.debug("Save painting (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
	
	var filename = this.Modules.Log.getUserFromContext(context);
	
	var paintingMetaData = {};
	paintingMetaData.inRoom = roomID;
	paintingMetaData.name = filename;
	
	writeFileInDB(filename, content, callback, null, paintingMetaData);	
};

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
};

/**
 * deletePainting delete a users Painting
 * 
 * @function deletePainting
 * @param roomID
 * @param callback
 * @param context
 */
mongoConnector.deletePainting = function(roomID, callback, context) {
	if (!context) this.Modules.Log.error("Missing context");
	var username = this.Modules.Log.getUserFromContext(context);

    this.Modules.Log.debug("Delete painting (roomID: '" + roomID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
    
    GridStore.unlink(this.db, username, function(err, gridStore) { 
    	if(err) {
            this.Modules.Log.error("Could not delete painting (roomID: '" + roomID + "', user: '"
                    + this.Modules.Log.getUserFromContext(context) + "')");
			callback(false);
		} else {
			callback();
		}
    });
};

/**
*   getPaintings
*   returns all paintings in a room (no actual objects, just a number of users with paintings)
*   @function getPaintings
*   @param roomID
*   @param context
*   @param callback
*/
mongoConnector.getPaintings = function(roomID, context, callback) {
    roomID = roomID.toString();
    var that = this;

	this.Modules.Log.debug("Request paintings (roomID: '" + roomID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "')");
	
	if (!context) throw new Error('Missing context in getInventory');
	
	if (!this.isLoggedIn(context)) {
        this.Modules.Log.error("User is not logged in (roomID: '" + roomID + "', user: '"
                + this.Modules.Log.getUserFromContext(context) + "')");
	}   
	
	// List the existing paintings (return only filenames)
    GridStore.list(that.db, {filename : true}, function(err, paintings) {
    	if (err) {
            console.warn("ERROR: mongoConnector.getPaintings: " + err);
            callback(false);
        } else {    	
            callback(paintings);
        }    	
    });	
};

/**
*	get the the object's content from a file and save it
*	if a callback function is specified, it is called after saving
*	@function copyContentFromFile
*	@param roomID
*	@param objectID
*	@param sourceFilename
*	@param context
*	@param callback
*/
mongoConnector.copyContentFromFile = function(roomID, objectID, sourceFilename, context, callback) {
	var that = this
	this.Modules.Log.debug("Copy content from file (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
            + this.Modules.Log.getUserFromContext(context) + "', source: '" + sourceFilename + "')");

    if (!context)  this.Modules.Log.error("Missing context");
	if (!callback) this.Modules.Log.error("Missing callback");
	
    var rds = fs.createReadStream(sourceFilename);
    rds.on("error", function(err) {
        that.Modules.Log.error("Error reading file");
    });

	this.saveContent(roomID, objectID, rds, callback ,context, true);
};

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
    roomID = roomID.toString();
    this.Modules.Log.debug("Get content (roomID: '" + roomID + "', objectID: '"
		+ objectID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
    
    if (!context)  this.Modules.Log.error("Missing context");
	if (!callback) this.Modules.Log.error("Missing callback");
	
	var that = this;
	
	var filename = objectID;
	
	gfs.exist({ filename : filename	}, function(err, found) {
	
	    if (err) {
	    	this.Modules.Log.debug("Could not read content from file (roomID: '"
	    		+ roomID + "', objectID: '" + objectID + "', user: '" + 
	    		this.Modules.Log.getUserFromContext(context) + "')");
	 		callback(false);
	    } else {
			if (found) {

				// Read in the whole file
		        GridStore.read(that.db, filename, function(err, content) {
		        	var byteArray = [];
		        	if(content != null) {
						var contentBuffer = new Buffer(content);
	
						for (var j = 0; j < contentBuffer.length; j++) {
							byteArray.push(contentBuffer.readUInt8(j));
						}
		        	}
					callback(byteArray);		          
		        });
			} else {
				// console.log("mongoConnector.getContent " + filename + " does not exist");
				callback(false);
			}
		}
	});
};

/**
*   @function getContentStream
*   @param roomID
*   @param objectID
*   @param context
*   
*/
mongoConnector.getContentStream = function(roomID, objectID, context) {
    roomID = roomID.toString();
    var that = this;
    this.Modules.Log.debug("Get content stream (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");
    
    var filename = objectID;
    
    var readStream = gfs.createReadStream({
	    filename: filename
	});
    readStream.on("error", function(err) {
    	that.Modules.Log.error("Error reading file: " + filename);
    });

    return readStream;
};

/**
*   @function getPaintingStream
*   @param roomID
*   @param users
*   @param context
*/
mongoConnector.getPaintingStream = function(roomID, user, context) {
	var that = this;
    this.Modules.Log.debug("Get painting stream (roomID: '" + roomID+"', user: '" + 
    			user + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");    
    var filename = user;
           
    var readStream = gfs.createReadStream({
	    filename: filename
	});
    
    
    readStream.on('data', function(data) {
    	//console.log("Reading data from file -- " + filename);
    });
    
    readStream.on('end', function() { 
    	//console.log("Read stream for file -- " + filename + " -- ended!!"); 
    });
    
    readStream.on("error", function(err) {
    	that.Modules.Log.error("Error reading file: " + filename + " error type: " + err);
    });

    return readStream;  
};

/**
 * @function getTrashRoom
 * @param context
 * @param callback
 * @returns {*}
 */
mongoConnector.getTrashRoom = function(context, callback) {
    this.getRoomData(TRASH_ROOM, context, callback);
};

/**
 * remove an object from the persistence layer
 * 
 * @function removeObject
 * @param roomID
 * @param objectID
 * @param context
 * @param callback
 */
mongoConnector.removeObject = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
	this.Modules.Log.debug("Remove object (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '"
			+ this.Modules.Log.getUserFromContext(context) + "')");
	
    if (!context) this.Modules.Log.error("Missing context");
    
    if (roomID == TRASH_ROOM) {
    	// delete completely from the DB
    	this.removeObjectFromDB(roomID, objectID, context, callback);
    } else {    	
    	// just move to the trash room
    	this.moveObjectToTrashRoom(roomID, objectID, context, callback);    	
    }	 
};

/**
 * Moves an Object to the Trash room
*	@function moveObjectToTrashRoom
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/

mongoConnector.moveObjectToTrashRoom = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
	this.getObjectData(roomID, objectID, context, function(objectData) {        
        
		var promise = moveObjectToTrashRoom(objectID, roomID);
		promise.on('complete', function(err, obj) {         
	        if (err) {
	            console.warn("ERROR: mongoConnector.moveObjectToTrashRoom: Error trying to move to trash room the object " 
	            		+ objectID + " in room " + roomID + " : " + err);
	            if (!_.isUndefined(callback)) callback(false);
	        } else {
	        	// if the object is a Subroom and it is in the public room
	        	// find the corresponding Room object and set the 'parent' attribute to 'trash'
	        	
	        	var objectType = objectData.attributes.type;	        	
	        	//if (roomID == PUBLIC_ROOM && objectType == SUBROOM_TYPE) {
	        	if(objectType == SUBROOM_TYPE) {
	        		if(objectData.attributes.destination != null){
		        		var roomObjectID = objectData.attributes.destination.toString(); 
		        		objects.update({id: roomObjectID},{ $set: { parent : TRASH_ROOM }}, function(err, doc){
		        			if (err) {
		        	            console.warn("ERROR: mongoConnector.moveObjectToTrashRoom: Error trying to move to trash room the object " 
		        	            		+ objectID + " in room " + roomID + " : " + err);
		        	            if (!_.isUndefined(callback)) callback(false);
		        	        } else { 
		        	        	if (!_.isUndefined(callback)) callback(true);	
		        	        }
		        		});
	        		}
	        	} else {
	        		if (!_.isUndefined(callback)) callback(true);
	        	}
	        }			
	    });	
	});
};


/**
 * Removes an Object from the DB
*	@function removeObjectFromDB
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.removeObjectFromDB = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
	this.getObjectData(roomID, objectID, context, function(objectData) {        
		var objectType = objectData.attributes.type;
		
		if (objectType != SUBROOM_TYPE) { // if the object to delete is not a Subroom
			var promise = removeObjectFromDB(objectID);
			promise.on('complete', function(err, obj) {         
		        if (err) {
		            console.warn("ERROR: mongoConnector.removeObjectFromDB: Error trying to remove the object " 
		            		+ objectID + " in room " + roomID + " : " + err);
		            if (!_.isUndefined(callback)) callback(false);
		        } else {
		        	// if the object has content, delete its content as well
		        	
		        	var objectHasContent = objectData.attributes.hasContent;		        	
		        	if (objectHasContent != undefined && objectHasContent == true) {
	        			GridStore.unlink(mongoConnector.db, objectID, function(err, gridStore) { 
		        			if (err) {
		        				 this.Modules.Log.error("Could not delete object's content (roomID: '" + roomID + "', user: '"
		        		                    + this.Modules.Log.getUserFromContext(context) + "')");
		        				 if (!_.isUndefined(callback)) callback(false);
		        			} else {
		       				 	if (!_.isUndefined(callback)) callback(true);
		        			}
		        		});
	        		} else {
	        			if (!_.isUndefined(callback)) callback(true);	
	        		}
		        		        	
		        }
		    });
		} else { // if the object to delete is a Subroom, then check if it has related Room object
			if(objectData.attributes.destination != undefined){
			    var roomObjectID = objectData.attributes.destination.toString();
			    var descendants = [];
			    var stack = [];
			    objects.findOne({id: roomObjectID}, function (err, root) {
			    	
			        descendants.push(root.id);
			        stack.push(root);
			        
			        function pushToDescendants() {
			            var currentnode = stack.pop();
			            
			            objects.find({parent:currentnode.id}, function(err, children) {
			                children.forEach(function(child) {
			                    descendants.push(child.id);
			                    stack.push(child);
			                });
			                
			                if (stack.length > 0) pushToDescendants();
			                else {
			                    // console.log("Rooms: " + JSON.stringify(descendants));
			                    objects.find( { inRoom: { $in: descendants }, hasContent: true }, function (err, objectsArray) {
			                        if (err) {
	                                    this.Modules.Log.error("Could not delete object's content (roomID: '" + roomID + "', user: '"
	                                               + this.Modules.Log.getUserFromContext(context) + "')");
	                                    if (!_.isUndefined(callback)) callback(false);
	                               } else {
	                                    // console.log("objectsArray: " + JSON.stringify(objectsArray));
	    		                        objects.remove( { inRoom: { $in: descendants } }, function (err, data) {
	    	                                if (err) {
	    	                                     this.Modules.Log.error("Could not delete object's content (roomID: '" + roomID + "', user: '"
	    	                                                + this.Modules.Log.getUserFromContext(context) + "')");
	    	                                     if (!_.isUndefined(callback)) callback(false);
	    	                                } else {
	    	                                    
	    	                                    var objectsIDs = [];
	    	                                    objectsArray.forEach(function(obj) {
	    	                                        objectsIDs.push(obj.id);
	    	                                    });
	    	                                    
	    	                                    GridStore.unlink(mongoConnector.db, objectsIDs, function(err, gridStore) {
	    	                                        if (err) {
	    	                                            console.log("unlink err: " + err);
	    	                                        }else {
	    	                                            // console.log("unlink done :) ");
	    	                                        } 
	    	                                    });
	    	                                    
	    	                                    objects.remove( { destination: { $in: descendants } }, function (err, data) {
	    	                                        if (err) {
	    	                                             this.Modules.Log.error("Could not delete object's content (roomID: '" + roomID + "', user: '"
	    	                                                        + this.Modules.Log.getUserFromContext(context) + "')");
	    	                                             if (!_.isUndefined(callback)) callback(false);
	    	                                        } else {
	    	                                            if (!_.isUndefined(callback)) callback(true);
	    	                                        } 
	    	                                    });
	    	                                } 
	    	                            });
	                               }
			                    });
			                }
			            });
			        }
			        
			        pushToDescendants();
			    });
			} else {
				var promise = removeObjectFromDB(objectID);
				promise.on('complete', function(err, obj) {				
					if (err) {
			            console.warn("ERROR: mongoConnector.removeObjectFromDB: Error trying to remove the object " 
			            		+ objectID + " in room " + roomID + " : " + err);
			            if (!_.isUndefined(callback)) callback(false);
			        } else {
			        	if (!_.isUndefined(callback)) callback(false);
			        }
				});  
			}
		}
	});	
};

/**
*	@function trimImage
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.trimImage = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
    var self = this;
    
    if (!context) this.Modules.Log.error("Missing context");

    /* save content to temp. file */
    //var filename = __dirname + "/tmp/trim_" + roomID + "_" + objectID;
	
	var os = require('os');
			
	var filename = os.tmpdir()+"/image_preview_dimensions_"+roomID+"_"+objectID;

    this.getContent(roomID, objectID, context, function(content) {

        fs.writeFile(filename, new Buffer(content), function (err) {
            if (err) throw err;
            /* temp. file saved */

            var im = require('imagemagick');

            //output: test.png PNG 192x154 812x481+226+131 8-bit DirectClass 0.010u 0:00.000
            im.convert([filename, '-trim', 'info:-'], function(err, out, err2) {

                if (!err) {

                    var results = out.split(" ");

                    var dimensions = results[2];
                    var dimensionsA = dimensions.split("x");

                    var newWidth = dimensionsA[0];
                    var newHeight = dimensionsA[1];

                    var d = results[3];
                    var dA = d.split("+");

                    var dX = dA[1];
                    var dY = dA[2];

                    im.convert([filename, '-trim', filename], function(err,out,err2) {

                        if (!err) {

                            // save new content:
                            self.copyContentFromFile(roomID, objectID, filename, context, function() {
                            
                                // delete temp. file
                                fs.unlink(filename);
                            
                                callback(dX, dY, newWidth, newHeight);
                            });
                            
                        } else {
                            //TODO: delete temp. file
                            self.Modules.Log.error("Error while trimming " + roomID + "/" + objectID);
                        }
                    });
                } else {
                    console.log(err);
                    self.Modules.Log.error("Error getting trim information of " + roomID + "/" + objectID);
                }
            });
        });
    });
};

/**
*	@function isInlineDisplayable
*	@param mimeType
*/
mongoConnector.isInlineDisplayable = function(mimeType) {
    return !(this.getInlinePreviewProviderName(mimeType) == false); 
};

/**
*	@function getMimeTyp
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.getMimeType = function(roomID, objectID, context, callback) {
	if (!context) throw new Error('Missing context in getMimeType');

    this.getObjectData(roomID, objectID, context, function(objectData) {
        var mimeType = objectData.attributes.mimeType;
        callback(mimeType);
    });
};

/**
* SYNC
*	@function getInlinePreviewProviderName
*	@param mimeType
*/
mongoConnector.getInlinePreviewProviderName = function(mimeType) {
    if (!mimeType) return false;
    
    var inlinePreProv = this.getInlinePreviewProviders()[mimeType];

    return (inlinePreProv != undefined) ? inlinePreProv : false;
};

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
};

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
};

/**
*	@function getInlinePreviewDimensions
*	@param roomID
*	@param objectID
*	@param mimeType
*	@param context
*	@param callback
*/
mongoConnector.getInlinePreviewDimensions = function(roomID, objectID, mimeType, context, callback) {
    roomID = roomID.toString();
    var self = this;
    
    if (!context) throw new Error('Missing context in getInlinePreviewDimensions');
    
    function mimeTypeDetected(mimeType) {
        
        /* find provider for inline content: */
        var generatorName = self.getInlinePreviewProviderName(mimeType);

        if (generatorName == false) {
            self.Modules.Log.warn("no generator name for mime type '" + mimeType + "' found!");
            callback(false, false); //do not set width and height (just send update to clients)
        } else {
            self.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, context, callback);
        }
        
    }
    
    if (!mimeType) {
        
        self.getMimeType(roomID, objectID, context, function(mimeType) {
            mimeTypeDetected(mimeType);
        });
        
    } else {
        mimeTypeDetected(mimeType);
    }
};

/**
*	@function getInlinePreview
*	@param roomID
*	@param objectID
*	@param mimeType
*	@param context
*	@param callback
*/
mongoConnector.getInlinePreview = function(roomID, objectID, mimeType, context, callback) {
    roomID = roomID.toString();
    var self = this;

    if (!context) throw new Error('Missing context in getInlinePreview');
    
    function mimeTypeDetected(mimeType) {
        
        if (!mimeType) {
            callback(false);
        } else {

            /* find provider for inline content: */
            var generatorName = self.getInlinePreviewProviderName(mimeType);

            if (generatorName == false) {
                self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
                callback(false); // do not set width and height (just send update to clients)
            } else {
                self.inlinePreviewProviders[generatorName].preview(roomID, objectID, context, callback);
            }
        }
    }
    
    if (!mimeType) {
        self.getMimeType(roomID, objectID, context, function(mimeType) {
            mimeTypeDetected(mimeType);
        });
        
    } else {
        mimeTypeDetected(mimeType);
    }
};

/**
*	@function getInlinePreviewMimeType
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
mongoConnector.getInlinePreviewMimeType = function(roomID, objectID, context, callback) {
    roomID = roomID.toString();
	var self = this;
	
    if (!context) throw new Error('Missing context in getInlinePreviewMimeType');
    
    this.getMimeType(roomID, objectID, context, function(mimeType) {
        
        if (!mimeType) {
            callback(false);
        }

        /* find provider for inline content: */
        var generatorName = self.getInlinePreviewProviderName(mimeType);

        if (generatorName == false) {
            self.Modules.Log.warn("no generator name for mime type '" + mimeType + "' found!");
            callback(false);
        } else {
            callback(self.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context));
        }
        
    });
};

/**
*   Head function and some subfunctions included, TODO JSDoc
*   @function inlinePreviewProviders
*/
mongoConnector.inlinePreviewProviders = {
    
    'image': {
        'mimeType' : function(roomID, objectID, mimeType, context) {
            
            if (!context) throw new Error('Missing context in mimeType for image');
            
            return mimeType;
        },
        'dimensions' : function(roomID, objectID, context, callback) {
            if (!context) throw new Error('Missing context in dimensions for image');
            
			//var filename =  path.resolve(__dirname, "../tmp/image_preview_dimensions_" + roomID + "_" + objectID);
			
			var os = require('os');
			
			var filename = os.tmpdir()+"/image_preview_dimensions_"+roomID+"_"+objectID;

            mongoConnector.getContent(roomID, objectID, context, function(content) {
                
                if (!content) throw new Error('Missing content in dimensions for image ' + objectID);
                
                fs.writeFile(filename, Buffer(content), function (err) {
                    if (err) throw err;
                    /* temp. file saved */

                    var im = require('imagemagick');

                    im.identify(filename, function(err, features) {

                        if (err) throw err;

                        var width = features.width;
                        var height = features.height;

                        if (width > mongoConnector.Modules.config.imageUpload.maxDimensions) {
                            height = height * (mongoConnector.Modules.config.imageUpload.maxDimensions / width);
                            width = mongoConnector.Modules.config.imageUpload.maxDimensions;
                        }

                        if (height > mongoConnector.Modules.config.imageUpload.maxDimensions) {
                            width = width * (mongoConnector.Modules.config.imageUpload.maxDimensions / height);
                            height = mongoConnector.Modules.config.imageUpload.maxDimensions;
                        }

                        //delete temp. file
                        fs.unlink(filename);
                        callback(width, height);
                    });
                });
            });
        },
        'preview' : function(roomID, objectID, context, callback) {
            
            if (!context) throw new Error('Missing context in preview for image');
            
            // TODO: change image orientation
            mongoConnector.getContent(roomID, objectID, context, function(content) {
                callback(content);
            });
        }
    }
}

module.exports = mongoConnector;