/**
*    Webarena - A web application for responsive graphical knowledge work
*	 @class FileConnector
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*	 @requires Node.js/fs
*    @requires Node.js/async
*	 @requires Node.js/q
*	 @requires Node.js/path
*    @requires Node.js/node-uuid
*	 @requires Node.js/imagemagick
*    @requires Config
*	 @requires ./Common/Log
*	 @requires mongodb
*	 @requires monk
*/
"use strict";

var fileConnector={};
var fs = require('fs');
var async = require('async');

var resumer = require('resumer');
// Todo: priority:low should use? the same connection if one already exist
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/test'); // Todo: priority:high must use the database address from config file
//var db = monk('ds033257.mongolab.com:33257/waobjects');
var dbObjects = db.get('objects'); // waObjects is name of collection
var dbRooms = db.get('rooms');
var dbContents = db.get('contents');

//var Server = require("mongo-sync").Server;
//var server = new Server('127.0.0.1');// Todo: priority:high must use the database address from config file
//var syncDb = server.db("test");// Todo: priority:high must use the database address from config file
//var objectsSync = syncDb.getCollection("objects");
//Todo: priority:high call server.close(); in the right place

var Q = require('q');
/**
* @function init
* @param theModules
*/
fileConnector.init=function(theModules){
	this.Modules=theModules;
}
/**
* @function info
*/
fileConnector.info=function(){
	return "FileConnector 1.0";
}

/**
*	logs the user in on the backend. The main purpose of this function is not
*	necessary a persistent connections but verifying the user's credentials
*	and in case of a success, return a user object with username, password and
*	home room for later usage.
*
*   why should we have plain password?
*
*	If the login was successful, the newly created user object is sent to a
*	response function.
* @function login
* @param username
* @param password
* @param externalSession
* @param context
* @param rp
*
*/
fileConnector.login=function(username,password,externalSession,context, rp){
	
	this.Modules.Log.debug("Login request for user '"+username+"'");
	
	var data={};
	
	data.username=username.toLowerCase();
	data.password=password;
	data.home= "public";
	
	if (this.Modules.Config.fileConnectorUsers) {
		
		if (this.Modules.Config.fileConnectorUsers[data.username] == data.password) {
			this.Modules.Log.debug("Login successfull for user '"+username+"'");
			rp(data);
		} else {
			this.Modules.Log.debug("Login failed for user '"+username+"'");
			rp(false);
		}
		
	} else {
		rp(data);
	}
	
}

/**
 * @function getTrashRoom
 * @param context
 * @param callback
 * @returns {*}
 */
fileConnector.getTrashRoom = function(context, callback){
    return this.getRoomData("trash", context, callback);
}

/**
 * @function listRooms
 * @param callback
 */
fileConnector.listRooms = function(callback){
    //Done Todo: should be replaced by a simple query of rooms
    //Todo: priority:low clean up
    //------------------------------------------->
    /*
    monk result is different than below (mongo console) result, it is an array
     dbRooms.find({name:true, _id:false}));
     { "name" : "public" }
     { "name" : 103755411174 }
     { "name" : 103755324969 }
     */
    console.log("-- listRooms called");
    var result = [];
    dbRooms.find({},/*{name:true, _id:false},*/ function(err, docs){
        if(err){
            return callback(err, null);
        }

        for(var i=0; i<docs.length; i++){
                result[i] = docs[i]['name'];
        }
        console.log(docs);
        console.log("results are:");
        console.log(result);
        callback(null, result);
    });

    //-------------------------------------------^
//	var filebase = fileConnector.Modules.Config.filebase;
//	fs.readdir(filebase, function(err, files){
//		if(err){
//			//TODO
//		}
//
//		var isRoom = function(file, callback){
//			if(/^\./.exec(file)){
//				return callback(false);
//			}
//			file = filebase + file;
//			fs.stat(file, function(err, result){
//				if(err){
//					return callback(err, null);
//				}
//				callback(result.isDirectory());
//			});
//		}
//
//		async.filter(files,isRoom, function( directories){
//            console.log("directories are *****:" +directories);
//			callback(null, directories);
//		});
//	});

}


/**
 * @function isLoggedIn
 * @param context
 */
fileConnector.isLoggedIn=function(context) {
	return true;
}


/* RIGHTS */
/**
* About rights
* @function mayWrite
* @param roomID
* @param objectID
* @param connection
* @param callback
*/
fileConnector.mayWrite=function(roomID,objectID,connection,callback) {
	callback(null, true);
}
/**
* About rights
* @function mayRead
* @param roomID
* @param objectID
* @param connection
* @param callback
*/
fileConnector.mayRead=function(roomID,objectID,connection,callback) {
	callback(null, true);
}
/**
* About rights
* @function mayDelete
* @param roomID
* @param objectID
* @param connection
* @param callback
*/
fileConnector.mayDelete=function(roomID,objectID,connection,callback) {
	callback(null, true);
}
// Todo: should the right managements be integrated here?
/**
* About rights
* @function mayEnter
* @param roomID
* @param connection
* @param callback
*/
fileConnector.mayEnter=function(roomID,connection,callback) {
	callback(null, true);
}

/**
* @function mayInsert
 * @param roomID
 * @param connection
 * @param callback
 */
fileConnector.mayInsert=function(roomID,connection,callback) {
	callback(null, true);
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
fileConnector.getInventory=function(roomID,context,callback){

	var self = this;

	this.Modules.Log.debug("Request inventory (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) throw new Error('Missing context in getInventory');
	
	if (!this.isLoggedIn(context)) this.Modules.Log.error("User is not logged in (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");


    //------------------------------------------->
    // Todo: priority:medium implement the sync as well (if needed), the following is only async
    console.log("-- get inventory called");
    console.log(typeof roomID);
    var inventoryDb = [];

    dbObjects.find({inRoom:roomID}, '-_id', function(err,docs){
        for(var i=0; i<docs.length; i++)
        {
//            console.log("doc[i] :");
//            console.log(docs[i]);
            //following lines are just copied from getObjectDataByFile except one line that changed
            var data = {};
            data.attributes=docs[i];
            data.type=data.attributes.type;
            data.id=data.attributes.id;
            data.attributes.id=data.id; // Todo: Q? does it normally happen that object id has not been saved? data.attributes.id already has id value why override it?
            data.inRoom=roomID;
            data.attributes.inRoom=roomID;
            //data.attributes.hasContent=false;
            if(data.attributes.hasContent) {
                data.attributes.contentAge=new Date().getTime();
            }
            else {
//                console.log("has no content : " + data.id);
                data.attributes.hasContent=false;
            }
//            console.log(i+' '+data.id);
            inventoryDb.push(data);
        }
//        console.log("inventoryDb = ");
//        console.log(inventoryDb);
        callback(inventoryDb);
    });
    //Todo: priority:NoIdea implement sync version with database if (callback === undefined)
    return;
    //-------------------------------------------^

	var filebase=this.Modules.Config.filebase;

	var inventory=[];

	try {fs.mkdirSync(filebase+'/'+roomID)} catch(e){};

	var files=fs.readdirSync(filebase+'/'+roomID);

    files= files || [];

	files.forEach(function(value,index){
		var position=value.indexOf('.object.txt');
		if(position == -1) return; //not an object file
		var filename=value;
		var objectID=filename.substr(0,position);

		if (roomID==objectID) return; //leave out the room

		try {
			var obj=self.getObjectDataByFile(roomID,objectID);
			if (obj) inventory.push(obj);
//            console.log('obj is:');
//            console.log(obj);
//            console.log('end of obj');
        } catch (e) {
			console.log(e);
			self.Modules.Log.error("Cannot load object with id '"+objectID+"' (roomID: '"+roomID+"', user: '"+self.Modules.Log.getUserFromContext(context)+"')");
		}

	});
	if (callback === undefined) {
		/* sync */
        console.log('**** sync inventory call');
		return inventory;
	} else {
		/* async */
		callback(inventory);
	}
	
}



/**
 *  Get room data or create room, if doesn't exist yet.
 *	@function getRoomData
 *
 * @param roomID
 * @param context
 * @param callback
 * @param oldRoomId - id of the parent room
 * @returns {*}
 */
fileConnector.getRoomData=function(roomID,context,callback,oldRoomId){
	this.Modules.Log.debug("Get data for room (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");

    //------------------------------------------->
    if (callback === undefined) {
        console.log('sync version called of getroomdata');
    }
    console.log("--getroomdata called");
//    console.log("context is: ");
//    console.log(context);
    var self=this;
    dbRooms.find({id:roomID}, function(err, docs){
        if(err) console.log('Error in getting room data!');
        // if room does not exist, create(insert)
        console.log("getroomdata docs : type "+ typeof docs);
        console.log(docs);
        console.log(roomID +' roomID type '+ typeof roomID);
        if (docs.length === 0){
            var roomobj={};
            roomobj.id=roomID;
            roomobj.name=roomID;
            if (oldRoomId) {
                roomobj.parent=oldRoomId;
            }
            dbRooms.insert(roomobj, function(err, doc){
                console.log(roomobj.id + ' room inserted into db');
            });  // Todo: is passing function needed here?
            return self.getRoomData(roomID,context,callback,oldRoomId); // Todo: priority:veryHigh check if it is right, should it go into insert call back?
        }
        else {  // room exists:
            callback(docs[0]); //Todo: implement sync version  callback === undefined
        }
    });
    // Todo: sync version if (callback === undefined)
    //-------------------------------------------^

//    var filebase=this.Modules.Config.filebase;
//	var obj=this.getObjectDataByFile(roomID,roomID);
//
//	if (!obj){
//		obj={};
//		obj.id=roomID;
//		obj.name=roomID;
//		if (oldRoomId) {
//			obj.parent=oldRoomId;
//		}
//		var self=this;
//		this.saveObjectData(roomID,roomID,obj,function(){
//			self.Modules.Log.debug("Created room (roomID: '"+roomID+"', user: '"+self.Modules.Log.getUserFromContext(context)+"', parent:'"+oldRoomId+"')");
//		},context,true)
//
//		return self.getRoomData(roomID,context,callback,oldRoomId);
//
//	} else {
//    	if (callback === undefined) {
//			/* sync */
//			return obj;
//		} else {
//			/* async */
//			callback(obj);
//		}
//	}
}

/**
* returns the room hierarchy starting by given roomID as root
*	@function getRoomHierarchy
*	@param roomID
*	@param context
*	@param callback
*
*/
fileConnector.getRoomHierarchy=function(roomID,context,callback){
	var self=this;
	var result = {
		'rooms' : {},
		'relation' : {},
		'roots' : []
	};

    //------------------------------------------->
    // Todo: checking accessiblity bypassed, it seemed it doesn't do anything
    console.log("--getRoomHierarchy called");
    dbRooms.find({},'-_id', function(err, docs){
        for(var i=0; i<docs.length; i++){   // Todo: substitude with forEach
            var doc = docs[i];
            result.rooms[doc.name +''] = '' + doc.name;
            if (doc.parent !== undefined) {
                if (result.relation[doc.parent] === undefined) {
                    result.relation[doc.parent] = new Array(''+doc);
                } else {
                    result.relation[doc.parent].push(''+doc);
                }
            } else {
                result.roots.push(''+doc);
            }
        }
        callback(result);
    });

    //-------------------------------------------^

//	//filter only "accessible" rooms
//	var filter = function(folders, cb){
//		async.filter(folders,
//			//Filter function
//			function(folder, cb1){
//				self.mayEnter(folder, context, function(err, res){
//					if(err) cb1(false);
//					else cb1(res);
//				});
//			},
//			//Response function
//			function(results){
//				cb(null, results);
//			}
//		);
//	}
//
//	var buildTree = function(files, cb){
//		files.forEach(function(file){
//			var obj = self.getObjectDataByFile(file,file);
//			result.rooms[file] = '' + obj.attributes.name;
//					if (obj.attributes.parent !== undefined) {
//						if (result.relation[obj.attributes.parent] === undefined) {
//					result.relation[obj.attributes.parent] = new Array(''+file);
//						} else {
//					result.relation[obj.attributes.parent].push(''+file);
//						}
//					} else {
//				result.roots.push(''+file);
//					}
//			});
//		cb(null, result);
//	}
//
//	async.waterfall([self.listRooms, filter, buildTree], function(err, res){
//		callback(res);
//	});

}

/**
*	
*	save the object (by given data)
*	if an "after" function is specified, it is called after saving
* @function saveObjectData
*	@param roomID
*	@param objectID
*	@param data
*	@param after
*	@param context
*	@param {boolean} createIfNotExists
*
*/
//TODO: async
fileConnector.saveObjectData=function(roomID,objectID,data,after,context,createIfNotExists){
	this.Modules.Log.debug("Save object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

	if (!context) this.Modules.Log.error("Missing context");
	if (!data) this.Modules.Log.error("Missing data");

    //------------------------------------------->
    console.log("--saveObjectData called");
    console.log(data);
    console.log("end of data");
    dbRooms.update({id:data.id}, data, {upsert:true}, function(err, docs){
        if(docs ===0) console.log("Error: there is something wrong with saveObjectData");
        if (after) after(objectID);
    });
    //-------------------------------------------^

//	var filebase=this.Modules.Config.filebase;
//
//	var foldername=filebase+'/'+roomID;
//
//	try {fs.mkdirSync(foldername)} catch(e){};
//
//	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
//	data=JSON.stringify(data);
//
//	//TODO Change to asynchronous access
//
//	if (!createIfNotExists){
//		if (!fs.existsSync(filename)){
//			this.Modules.Log.error("File does not exist")
//		}
//	}
//
//	fs.writeFileSync(filename, data,'utf-8');
//	if (after) after(objectID);
	
}

// Todo: priority:veryHigh implemented till here and get the error room id is missing.
/**
*	
*	save the object's content
*   if an "after" function is specified, it is called after saving
*	@function saveContent
*	@param roomID
*	@param objectID
*	@param content
*	@param after
*	@param context
*	@param inputIsStream
*
*/
fileConnector.saveContent=function(roomID,objectID,content,after,context, inputIsStream){
	this.Modules.Log.debug("Save content from string (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	var that = this;

    if (!context) this.Modules.Log.error("Missing context");
    //------------------------------------------->
    console.log("-- saveContent called");
    // Todo: veryHigh   inputIsStream mode must be implemented
    dbContents.update({id:objectID}, {id:objectID, /*room:roomID,*/"content":content }, {upsert:true}, function(err, docs){
        if(docs ===0) console.log("there is something wrong with saveContent");
        if (after) after(objectID);
    });


    //-------------------------------------------^

//    var filebase=this.Modules.Config.filebase;
//    var foldername=filebase+'/'+roomID;
//    try {fs.mkdirSync(foldername)} catch(e){};
//    var filename=filebase+'/'+roomID+'/'+objectID+'.content';
//
//
//    if(!!inputIsStream){    // Todo: Q? !!?
//        console.log('input stream '+typeof content+' ');console.log(content);
//        var wr = fs.createWriteStream(filename);
//        wr.on("error", function(err) {
//            that.Modules.Log.error("Error writing file: " + err);
//        });
//        content.on("end", function(){
//            if (after) after(objectID);
//        })
//        content.pipe(wr);
//    } else {
//        console.log('returned from NOT input stream '+typeof content+' ');console.log(content);
//        return;// Todo: veryHigh comment out all this stuff after finding out about inputStream
//        if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
//            /* create byte array */
//
//            var byteArray = [];
//            var contentBuffer = new Buffer(content);
//
//            for (var j = 0; j < contentBuffer.length; j++) {
//                byteArray.push(contentBuffer.readUInt8(j));
//            }
//
//            content = byteArray;
//
//        }
//
//		try {
//			fs.writeFileSync(filename, new Buffer(content));
//		} catch (err) {
//            this.Modules.Log.error("Could not write content to file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
//        }
//		if (after) after(objectID);
    
    }
}

/**
*	save a users painting
*	if an "after" function is specified, it is called after saving
*	@function savePainting
*	@param roomID
*	@param content
*	@param after
*	@param context
*/
fileConnector.savePainting=function(roomID,content,after,context){
	if (!context) this.Modules.Log.error("Missing context");
	
	this.Modules.Log.debug("Save painting (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	var that = this;
	var username=this.Modules.Log.getUserFromContext(context);

    //------------------------------------------->
    console.log("--- savePainting called");

    //-------------------------------------------^

    var filebase=this.Modules.Config.filebase;
    var foldername=filebase+'/'+roomID;
    try {fs.mkdirSync(foldername)} catch(e){};
    var filename=filebase+'/'+roomID+'/'+username+'.painting';

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
		fs.writeFileSync(filename, new Buffer(content));
	} catch (err) {
	    this.Modules.Log.error("Could not write painting to file (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	}
	if (after) after();
	
}

/**
*	deletePainting
*	delete a users Painting
*	@function deletePainting
*	@param roomID
*	@param callback
*	@param context
*/
fileConnector.deletePainting=function(roomID,callback,context){
	
	if (!context) this.Modules.Log.error("Missing context");
	var username=this.Modules.Log.getUserFromContext(context);
	
	this.Modules.Log.debug("Delete painting (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

	try {
	
		var filebase=this.Modules.Config.filebase;

		var filename=filebase+'/'+roomID+'/'+username+'.painting';

		fs.unlink(filename, function (err) {});
	
	} catch (e) {
		this.Modules.Log.error("Could not delete painting (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	}
	
	if (callback) callback();
	
}

/**
*	getPaintings
*	returns all paintings in a room (no actual objects, just a number of users with paintings)
* @function getPaintings
*	@param roomID
*	@param context
*	@param callback
*
*/
fileConnector.getPaintings=function(roomID,context,callback){

	var self = this;

	this.Modules.Log.debug("Request paintings (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) throw new Error('Missing context in getInventory');
	
	if (!this.isLoggedIn(context)) this.Modules.Log.error("User is not logged in (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	var filebase=this.Modules.Config.filebase;

	var paintings=[];

	try {fs.mkdirSync(filebase+'/'+roomID)} catch(e){};

	var files=fs.readdirSync(filebase+'/'+roomID);

    files=(files)?files:[];

	files.forEach(function(value,index){
		var position=value.indexOf('.painting');
		if(position == -1) return; //not an object file
		var filename=value;
		var user=filename.substr(0,position);
		paintings.push(user);
    });

	if (callback === undefined) {
		/* sync */
		return paintings;
	} else {
		/* async */
		callback(paintings);
	}
	
}


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
fileConnector.copyContentFromFile=function(roomID, objectID, sourceFilename, context, callback) {
	var that = this
	this.Modules.Log.debug("Copy content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"', source: '"+sourceFilename+"')");
	
	if (!context) this.Modules.Log.error("Missing context");

    //------------------------------------------->
    // Todo: need to be implemented
    console.log("--- copyContentFromFile called");
    console.log('-- ** Todo sourceFilename is : '); console.log();
    // figure out what sourceFilename is. is it the .content file?
    // this.saveContent(roomID,objectID,rds,callback,context, true);
    //-------------------------------------------^

    var rds = fs.createReadStream(sourceFilename);
    rds.on("error", function(err) {
        that.Modules.Log.error("Error reading file");
    });


	this.saveContent(roomID,objectID,rds,callback,context, true);

}

/**
* get an object's content as an array of bytes
*	@function getContent
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*	
*/
fileConnector.getContent=function(roomID,objectID,context,callback){
	
	this.Modules.Log.debug("Get content (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

    //------------------------------------------->
    console.log("-- getContent called");

    dbContents.find({id:objectID},'-_id -id',function(err, docs){
        callback(docs[0].content); // Todo: error handling
    });
    // Todo: sync version
    // Draft 1 commited till here
    //-------------------------------------------^

//	var filebase=this.Modules.Config.filebase;
//
//	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
//
//	try {
//		var content = fs.readFileSync(filename);
//
//		var byteArray = [];
//		var contentBuffer = new Buffer(content);
//
//		for (var j = 0; j < contentBuffer.length; j++) {
//
//			byteArray.push(contentBuffer.readUInt8(j));
//
//		}
//
//		if (callback == undefined) {
//			//sync
//			return byteArray;   // Todo: not implemented in db version
//		} else {
//			//async
//			callback(byteArray);
//		}
//
//	} catch (e) {
//		this.Modules.Log.debug("Could not read content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
//		if (callback == undefined) {
//			//sync
//			return false;   // Todo: not implemented in db version
//		} else {
//			//async
//			callback(false);    // Todo: not implemented in db version
//		}
//	}
	
}


/**
*	@function getContentStream
*	@param roomID
*	@param objectID
*	@param context
*	
*/
fileConnector.getContentStream = function(roomID, objectID, context) {
    this.Modules.Log.debug("Get content stream (roomID: '" + roomID + "', objectID: '" + objectID + "', user: '" + this.Modules.Log.getUserFromContext(context) + "')");

    //------------------------------------------->
    console.log("-- getContentStream called");
    dbContents.find({id:objectID}, '-_id', function(err, doc){
        var content = doc[0].content;
        var stream = resumer().queue(content).end(); //var stream = resumer().queue('your string').end()
        return stream;
    });
    //-------------------------------------------^

//    var filebase = this.Modules.Config.filebase;
//    var filename = filebase + '/' + roomID + '/' + objectID + '.content';
//
//    var rds = fs.createReadStream(filename);
//    rds.on("error", function(err) {
//        this.Modules.Log.error("Error reading file: " + filename);
//    });
//
//    return rds;
}

/**
*	@function getPaintingStream
*	@param roomID
*	@param users
*	@param context
*	
*/
fileConnector.getPaintingStream = function(roomID,user,context){
		
    this.Modules.Log.debug("Get painting stream (roomID: '"+roomID+"', user: '"+user+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

    //------------------------------------------->
    console.log("-- called");

    //-------------------------------------------^

    var filebase=this.Modules.Config.filebase;
    var filename=filebase+'/'+roomID+'/'+user+'.painting';

    var rds = fs.createReadStream(filename);
	var that=this;
    rds.on("error", function(err) {
        that.Modules.Log.error("Error reading file: " + filename);
    });

    return rds;
}



/**
*	remove an object from the persistence layer
*	@function remove
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*	
*/
fileConnector.remove=function(roomID,objectID,context, callback){
	var that = this;
	
	this.Modules.Log.debug("Remove object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");

    //------------------------------------------->
    console.log("--remove called");
    dbObjects.remove({id:objectID}, function(err, docs){
    });
    dbContents.remove({id:objectID}, function(err, docs){
    });
    // Todo: .preview files?
    //-------------------------------------------^

//
//	var objectBase = this.Modules.Config.filebase + '/' + roomID + "/" + objectID;
//	var files = ['.object.txt', '.content', '.preview'].map(function( ending ){
//		return objectBase + ending;
//	});
//
//	async.each(files, fs.unlink, function(err, resp){
//		if(callback){
//		callback();
//		}
//	});
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
fileConnector.createObject=function(roomID,type,data, context, callback){

	this.Modules.Log.debug("Create object (roomID: '"+roomID+"', type: '"+type+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var uuid = require('node-uuid');
	var objectID = uuid.v4();
	
	data.type=type;
	
	if (type == "Paint" || type == "Highlighter") {
		
		data.mimeType = 'image/png';
		data.hasContent = false;
		
	}

    //------------------------------------------->
    console.log("--createObject called");

    //-------------------------------------------^

	this.saveObjectData(roomID,objectID,data,callback,context,true);
	
}


/**
*	duplicate an object on the persistence layer
*	to direcly work on the new object, specify an after function
*	after(objectID)
* 	@function duplicateObject
*	@param roomID
*	@param toRoom
*	@param objectID
*	@param context
*	@param callback
*
*/
fileConnector.duplicateObject=function(roomID,toRoom, objectID, context,  callback){

	this.Modules.Log.debug("Duplicate object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"', toRoom: '"+toRoom+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var self = this;

	var uuid = require('node-uuid');
	var newObjectID = uuid.v4();

    //------------------------------------------->
    console.log("-- called");

    //-------------------------------------------^

	var filebase=this.Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	var objectFilename = filebase+'/'+roomID+'/'+objectID+'.object.txt';
	var contentFilename = filebase+'/'+roomID+'/'+objectID+'.content';
	var previewFilename = filebase+'/'+roomID+'/'+objectID+'.preview';
	
	var objectFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.object.txt';
	var contentFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.content';
	var previewFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.preview';

	var fs = require("fs");
	
	var copyFunc = function(source, dest, callback) {
		var read = fs.createReadStream(source);
		var write = fs.createWriteStream(dest);

		read.on("end", callback);
		read.pipe(write);
	}
	
	/* callback function after duplicating files */
	var cb = function() {
		if (callback) callback(null, newObjectID, objectID);
	}
	
	/* copy object data */
	copyFunc(objectFilename, objectFilenameNew, function() {
		/* object data copied */

		var path = require('path');

		/* check if content exists */
		if (path.existsSync(contentFilename)) {

			/* copy content */
			copyFunc(contentFilename, contentFilenameNew, function() {
				/* object content copied */

				/* check if preview exists */
				if (path.existsSync(previewFilename)) {
					/* copy preview */
					copyFunc(previewFilename, previewFilenameNew, function() {
						/* object preview copied */
						cb();
						return true;
					});
				} else {
					cb();
					return true;
				}
			});
		} else {
			cb();
			return true;
		}
	});

}


/**
*	returns the attribute set of an object
* 	@function getObjectData
*	@param roomID
*	@param objectID
*	@param context
*/
fileConnector.getObjectData=function(roomID,objectID,context){
	
	this.Modules.Log.debug("Get object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");

    //------------------------------------------->
    console.log("-- called");

    //-------------------------------------------^

	var obj = this.getObjectDataByFile(roomID,objectID);
	
	return obj;
	
}



/**
*	internal
*	read an object file and return the attribute set
*	@function getObjectDataByFile
*	@param roomID
*	@param objectID
*/
fileConnector.getObjectDataByFile=function(roomID,objectID, callback){
    //------------------------------------------->
    console.log("-- getObjectDataByFile called");

    dbObjects.find({id:objectID}, '-_id', function(err, docs){
        if (docs.length === 0)
        {
            callback(false); // object doesn't exist
        }
        var attributes = docs[0];

        var data={};

        //	automatically repair some values which could be wrong due
        //  to manual file copying.

        data.attributes=attributes;
        data.type=data.attributes.type;
        data.id=objectID;
        data.attributes.id=data.id; // Todo: Q? does it normally happen that object id has not been saved? data.attributes.id already has id value why override it?
        data.inRoom=roomID;
        data.attributes.inRoom=roomID;
        data.attributes.hasContent=false;

        //assure rooms do not loose their type
        if (roomID==objectID){
            data.type='Room';
            data.attributes.type='Room';
        }

        // look if there is any content for this object
        dbContents.find({id:objectID}, '-_id', function(err, docs){
            if(docs.length !== 0)
            {
                data.attributes.hasContent=true;
                data.attributes.contentAge=new Date().getTime();
            }
            callback(data);
        });
    });
    //-------------------------------------------^

//	var filebase = this.Modules.Config.filebase;
//
//	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
//
//	try {
//		var attributes = fs.readFileSync(filename, 'utf8');
//		attributes=JSON.parse(attributes);
//	} catch (e) {								//if the attribute file does not exist, create an empty one
//
//		//when an object is not there, false is returned as a sign of an error
//		return false;
//	}
//
//	var data={};
//
//	//	automatically repair some values which could be wrong due
//	//  to manual file copying.
//
//	data.attributes=attributes;
//	data.type=data.attributes.type;
//	data.id=objectID;
//	data.attributes.id=data.id; // Todo: Q? does it normally happen that object id has not been saved? data.attributes.id already has id value why override it?
//	data.inRoom=roomID;
//	data.attributes.inRoom=roomID;
//	data.attributes.hasContent=false;
//
//	//assure rooms do not loose their type
//	if (roomID==objectID){
//		data.type='Room';
//		data.attributes.type='Room';
//	}
//
//	var path = require('path');
//
//	filename=filebase+'/'+roomID+'/'+objectID+'.content';
//
//	if (path.existsSync(filename)) {
//
//		data.attributes.hasContent=true;
//		data.attributes.contentAge=new Date().getTime();
//	}
//
//	return data;
}

/**
*	@function trimImage
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.trimImage=function(roomID, objectID, context, callback) {

	var self = this;
	
	if (!context) this.Modules.Log.error("Missing context");

	/* save content to temp. file */

	var filename = __dirname+"/tmp/trim_"+roomID+"_"+objectID;

	this.getContent(roomID,objectID,context,function(content) {

		fs.writeFile(filename, new Buffer(content), function (err) {
		 	if (err) throw err;
			/* temp. file saved */

			var im = require('imagemagick');

			//output: test.png PNG 192x154 812x481+226+131 8-bit DirectClass 0.010u 0:00.000
			im.convert([filename, '-trim', 'info:-'], function(err,out,err2) {

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

							//save new content:
							self.copyContentFromFile(roomID, objectID, filename, context, function() {
							
								//delete temp. file
								fs.unlink(filename);
							
								callback(dX, dY, newWidth, newHeight);
								
							});
							
						} else {
							//TODO: delete temp. file
							self.Modules.Log.error("Error while trimming "+roomID+"/"+objectID);
						}
					});
				} else {
					console.log(err);
					self.Modules.Log.error("Error getting trim information of "+roomID+"/"+objectID);
				}
			});
		});
	});
};

/**
*	@function isInlineDisplayable
*	@param mimeType
*/
fileConnector.isInlineDisplayable=function(mimeType) {
	
	if (this.getInlinePreviewProviderName(mimeType) == false) {
		return false;
	} else {
		return true;
	}
	
}
/**
*	@function getMimeTyp
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.getMimeType=function(roomID,objectID,context,callback) {
	
	if (!context) throw new Error('Missing context in getMimeType');

    //------------------------------------------->
    console.log("-- called");

    //-------------------------------------------^

	var objectData = this.getObjectData(roomID,objectID,context);
	var mimeType = objectData.attributes.mimeType;
	
	callback(mimeType);
	
}


/**
* SYNC
*	@function getInlinePreviewProviderName
*	@param mimeType
*/
fileConnector.getInlinePreviewProviderName=function(mimeType) {

	if (!mimeType) return false;

	if (this.getInlinePreviewProviders()[mimeType] != undefined) {
		return this.getInlinePreviewProviders()[mimeType];
	} else {
		return false;
	}
	
}

/**
* SYNC
*	@function getInlinePreviewMimeTypes
*/
fileConnector.getInlinePreviewMimeTypes=function() {
	
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
fileConnector.getInlinePreviewProviders=function() {
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
fileConnector.getInlinePreviewDimensions=function(roomID, objectID, mimeType,context, callback) {
	
	var self = this;
	
	if (!context) throw new Error('Missing context in getInlinePreviewDimensions');
	
	function mimeTypeDetected(mimeType) {
		
		/* find provider for inline content: */
		var generatorName = self.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false, false); //do not set width and height (just send update to clients)
		} else {
			self.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, context, callback);
		}
		
	}
	
	if (!mimeType) {
		
		self.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}
/**
*	@function getInlinePreview
*	@param roomID
*	@param objectID
*	@param mimeType
*	@param context
*	@param callback
*/
fileConnector.getInlinePreview=function(roomID, objectID, mimeType,context, callback) {

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
				callback(false); //do not set width and height (just send update to clients)
			} else {
				self.inlinePreviewProviders[generatorName].preview(roomID, objectID, context, callback);
			}
		
		}
		
	}
	
	if (!mimeType) {
		
		self.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}
/**
*	@function getInlinePreviewMimeType
*	@param roomID
*	@param objectID
*	@param context
*	@param callback
*/
fileConnector.getInlinePreviewMimeType=function(roomID, objectID,context,callback) {
	
	var self = this;
	
	if (!context) throw new Error('Missing context in getInlinePreviewMimeType');
	
	this.getMimeType(roomID,objectID,context,function(mimeType) {
		
		if (!mimeType) {
			callback(false);
		}

		/* find provider for inline content: */
		var generatorName = self.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false);
		} else {
			callback(self.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context));
		}
		
	});
	
}


/**
* Head function and some subfunctions included, TODO JSDoc
*	@function inlinePreviewProviders
*/
fileConnector.inlinePreviewProviders = {
	
	'image': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for image');
			
			return mimeType;
		},
		'dimensions' : function(roomID, objectID, context, callback) {
			
			if (!context) throw new Error('Missing context in dimensions for image');

			
			var filename = __dirname+"/tmp/image_preview_dimensions_"+roomID+"_"+objectID;

			fileConnector.getContent(roomID,objectID,context,function(content) {
				fs.writeFile(filename, Buffer(content), function (err) {
				 	if (err) throw err;
					/* temp. file saved */

					var im = require('imagemagick');

					im.identify(filename, function(err, features) {

						if (err) throw err;

						var width = features.width;
						var height = features.height;

						if (width > fileConnector.Modules.config.imageUpload.maxDimensions) {
							height = height*(fileConnector.Modules.config.imageUpload.maxDimensions/width);
							width = fileConnector.Modules.config.imageUpload.maxDimensions;
						}

						if (height > fileConnector.Modules.config.imageUpload.maxDimensions) {
							width = width*(fileConnector.Modules.config.imageUpload.maxDimensions/height);
							height = fileConnector.Modules.config.imageUpload.maxDimensions;
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
//TODO: change image orientation
			fileConnector.getContent(roomID,objectID,context,function(content) {
				
				callback(content);
				
			});
					}
				}
}






module.exports=fileConnector;
