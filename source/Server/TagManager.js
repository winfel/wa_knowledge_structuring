
var _ = require('underscore');

var db = false;
var Modules = false;

var TRASH_ROOM = 'trash';
var FILE_TYPE_NAME = "File";
var CONTAINER_ID = "containerID";
var CONTAINER_WIDTH = 500;
var CONTAINER_HEIGHT = 300;
var CONTAINERS_PER_LINE = 3;
var HORIZONTAL_GAP = 20;
var VERTICAL_GAP = 20;
var INITIAL_X = 30;
var INITAIL_Y = 30;

var freePlaces = []; // keeps track of the available gaps

var fillCurrentDbWithTestData = function() {

	/* clear table */
	db.get('MainTags').drop();
	
	var maintags = db.get("MainTags");
	 
    maintags.insert(
		   [
			  { id: "1", name: "Human-Machine Interaction", 
			    secTags: ["Didactics of Informatics","Computer Graphics","Visualization","Image Processing","Human-Computer Interaction","Computers and Society","Computing in Context"] },
			  { id: "2", name: "Software Technologies", 
			    secTags: ["Model Driven Software Engineering", "Knowledge- Based Systems", "Electronic Commerce", "Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
			  { id: "3", name: "Embedded Systems", 
			    secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
			  { id: "4", name: "Models and Algorithms", 
			    secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"] }
		   ]	
	);	
};
/**
* @class TagManager
*/
var TagManager = function() {
    
	var that = this;
	
   /**
   * The function is needed to initialize the TagManager
   */
	this.init = function(theModules) {
	    Modules = theModules;
	    
	    db = require('monk')(Modules.MongoDBConfig.getURI());
	    db.get('MainTags').ensureIndex( { "name": 1 }, { unique: true } );
	    
	    // fillCurrentDbWithTestData();
	    
	    var Dispatcher = Modules.Dispatcher;
	
	    Dispatcher.registerCall('getMainTags', function(socket, data, responseID) {
			that.getMainTags(socket);
		});
	
	    Dispatcher.registerCall('getSecTags', function(socket, data, responseID) {
			that.getSecTags(socket, data.mainTag); 
		});
	    
	    Dispatcher.registerCall('getMainTagsAndSecTags', function(socket, data, responseID) {
			that.getMainTagsAndSecTags(socket);
		});
	   
		Dispatcher.registerCall('updMainTags', function(socket, data) {
			// for every Main Tag a GlobalContainer object is created
			var context = Modules.UserManager.getConnectionBySocket(socket);
			
			db.get("MainTags").findOne({name: data.mainTag }, function(error, tags) {
			    if (error) {
			        console.log("updMainTags::ERROR " + error);
			    } else {
			        if (tags != null) {
			            var msg = "tagManager.duplicateMainTag.error";
			            Modules.SocketServer.sendToSocket(socket, "updMainTags", {"error": true, "msg": msg});
			        } else {
			            that.createGlobalContainer(context, data, function (error, object) {
	                        if (!error) {
	                            that.updMainTags(data.mainTag, data.newId, object.id); 
	                        } else {
	                            that.deleteGlobalContainer(object.id, context, null);
	                        }
	                        
	                        var msg = (error) ? "tagManager.maintagcreation.error" : "success";
	                        Modules.SocketServer.sendToSocket(socket, 'updMainTags', {"error": error, "msg": msg});
	                    });   
			        }
			    }
			});
		});
		
		Dispatcher.registerCall('updMainTagName', function(socket, data, responseID) {
			that.updMainTagName(data.tagID, data.newName, function(error, msg, containerID) {
			    if (!error) {
	                var context = Modules.UserManager.getConnectionBySocket(socket);
	                
	                // let's modify the container associated with this main Tag
	                Modules.ObjectManager.getObject('public', containerID, context, function (object) {
	                    object.setAttribute('name', data.newName);
	                });
	            }
			    Modules.SocketServer.sendToSocket(socket, 'updMainTagName', {"error": error, "msg": msg});
			}); 
		});
		
		Dispatcher.registerCall('deleteMainTag', function(socket, data) {
	        that.deleteMainTag(socket, data.mainTagID, function(error, msg, containerID) {
	            if (!error) {
	                var context = Modules.UserManager.getConnectionBySocket(socket);
	                
	                // let's delete the container associated with this main Tag
	                that.deleteGlobalContainer(containerID, context, function(coordinates) {
	                    var index = _.sortedIndex(freePlaces, coordinates, 'y');
	                    
	                    if (index == freePlaces.length) freePlaces.push(coordinates);
	                    else {
	                        var temp = freePlaces.slice(0, index);
	                        temp.push(coordinates); 
	                        freePlaces = _.union(temp, freePlaces.slice(index)); 
	                    }
	                    
	                    //console.log("++ freePlaces: " + JSON.stringify(freePlaces));
	                });
	            } 
	            
	            Modules.SocketServer.sendToSocket(socket, 'deleteMainTag', {"error": error, "msg": msg});
	        }); 
	    });
		
		Dispatcher.registerCall('updSecTagName', function(socket, data, responseID) {
			that.updSecTagName(socket, data.mainTagID, data.oldName, data.newName, function(error, msg){
				Modules.SocketServer.sendToSocket(socket, 'updSecTagName', {"error": error, "msg": msg});
			}); 
		});
		
		Dispatcher.registerCall('moveSecTag', function(socket, data, responseID) {
			that.moveSecTag(socket, data.oldMainTagID, data.newMainTagID, data.secTag, function(error, msg){
				Modules.SocketServer.sendToSocket(socket, 'moveSecTag', {"error": error, "msg": msg});
			}); 
		});
		
		Dispatcher.registerCall('deleteSecTags', function(socket, data, responseID) {
			that.deleteSecTags(socket, data.mainTag, data.secTag, function(error, msg){				
				Modules.SocketServer.sendToSocket(socket, 'deleteSecTags', {"error": error, "msg": msg});
			}); 
		});
		
		Dispatcher.registerCall('updSecTags', function(socket, data) {
            that.updSecTags(socket, data.mainTag, data.secTag, function (error, message) {
                Modules.SocketServer.sendToSocket(socket, 'updSecTags', {"error": error, "msg": message});
            }); 
        });
        

		// TODO: move this out of init, because this is dangerous as some object creation may fail due to still unfinished server/database startup process
		// we create our context
		var context = {
			user: { username : "root"}
		};
		// Check if there are tags without Container
		// If there are any; then let's create the containers
		that.createMissingContainers(context, function (newContainers) {});
	};
  
	/**
	 * Returns all existing main tags in format ["id", "name"]
	 * (without corresponding secondary tags)
	 * 
	 * @param {Object} socket The socket of the client. 
	 * @return {Object} mainTags All main tags
	 */
	this.getMainTags = function(socket) {
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.find( {}, ["id", "name"], function(e, mainTags) {
			Modules.SocketServer.sendToSocket(socket, "getMainTags", mainTags);
		} );
	};
	
	/**
     * Returns all secondary tags for a specified main tag
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} mainTag The main tag for which secondary tags are returned. 
     * @return {Object} secTags All secondary tags
     */
	this.getSecTags = function(socket, mainTag) {
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.findOne( {name: mainTag}, ["secTags"] , function(e, secTags) {
			if(!secTags) {
				/* it happens that there are requests for maintags, which are not existant (any more).
					This is not good, but at least throw no error at client side because argument secTags is null.*/
				secTags = {
					secTags: [],
				};
			}
			Modules.SocketServer.sendToSocket(socket, "getSecTags", secTags);
		} );
	};
	
	/**
	 * Returns all existing main tags
	 * with corresponding secondary tags
	 * 
	 * @param {Object} socket The socket of the client. 
	 * @return {Object} mainTagsAndSecTags All main tags
	 */
	this.getMainTagsAndSecTags = function(socket) {
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.find( {}, [], function(e, mainTagsAndSecTags) {
			Modules.SocketServer.sendToSocket(socket, "getMainTagsAndSecTags", mainTagsAndSecTags);
		} );	 
	};
	
	/**
     * Add new secondary tag in the list of secondary tags 
     * of the specified main tag
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} mainTag The main tag.
     * @param {Object} newSecTag The newly added secondary tag.
     * @param {Object} callback the function to call back.
     */
	this.updSecTags = function(socket, mainTag, newSecTag, callback) {
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.findOne( { name: mainTag, secTags: {$in:[newSecTag]}}, function(error, secTag) {
		    if (!secTag) {
		        dbMainTags.update( {name: mainTag}, { 
                    $addToSet: { secTags:  newSecTag } 
                });
		    } 
		    
		    var message = (secTag != null) ? "tagManager.duplicateSecondaryTag.error" : "success";
		    callback((secTag != null), message);
		});
	};
	
	/**
     * Deletes the specified secondary tag from the list of 
     * secondary tags of the specified main tag 
     * In case that some files tagged with this file exist,
     * deletion is not performed
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} mainTag The main tag.
     * @param {Object} secTag The secondary tag to be deleted.
     * @param {Object} callback callback function
     */
	this.deleteSecTags = function(socket, mainTag, secTag, callback) {
		var dbMainTags = db.get('MainTags');
		var dbObjects = db.get('objects');
		
		var promise = dbObjects.find( {type: FILE_TYPE_NAME, secondaryTags : {$in : [secTag]} });
		
		promise.on('complete', function(err, obj) {
            if (err || obj == null) {
                console.log("deleteSecTags::ERROR " + err);
                callback(true, "The secondary tag cannot be deleted: " + err);
            } else {
                if(obj.length == 0){
	            	var promise2 = dbMainTags.update( {name: mainTag}, { 
	        			$pull: { secTags:  secTag } 
	        	    }); 
	                promise2.on('complete', function(err, obj) {
	                    if (err){ 
	                    	console.log("deleteSecTags::ERROR " + err);
	                    	callback(true, "The secondary tag cannot be deleted: " + err);	                    	
	                    } else {
	                    	callback(false, null);
	                    }	
	                });
                } else {                	
                	console.log("The secondary tag cannot be deleted since there are files tagged with this tag");
                	callback(true, "The secondary tag cannot be deleted since there are files tagged with this tag");
                } 
            }        
        });
	};
	
	/**
     * Creates a new Main tag with the specified name, ID and containerID
     * 
     * @param {Object} newMainTag The name of the new main tag.
     * @param {Object} newId The ID of the new main tag.
     * @param {Object} containerID The containerID of the new main tag.
     */
	this.updMainTags = function(newMainTag, newId, containerID) {
		var dbMainTags = db.get('MainTags');
		dbMainTags.insert(
			  { 
				  id: newId.toString(),
				  name: newMainTag,	
				  containerID: containerID, // every main Tag is associated with one container
			      secTags: [] 
			  }
		);	
	};
	
	/**
     * Updates name of the specified secondary tag
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} mainTagID The id of the main tag.
     * @param {Object} oldName The old name of the secondary tag.
     * @param {Object} newName The new name of the secondary tag.
     */
	this.updSecTagName = function(socket, mainTagID, oldName, newName, callback) {
		var dbMainTags = db.get('MainTags');
		
		var promise = dbMainTags.findOne({
											id: mainTagID, 
											secondaryTags : {$in : [new RegExp("^" + newName + "$", 'i')] } 
										});
		promise.on('complete', function(err, obj) {
			 if (err) {
	                console.log("updSecTagName::ERROR " + err);
	                callback(true, "The secondary tag cannot be renamed: " + err);
			 } else {
				 if(obj != null){
					 console.log("updSecTagName::ERROR " + err);
		             callback(true, "The secondary tag cannot be renamed since secondary tag with the same name alredy exists");
				 } else {
				 	 //delete the old secondary tag
					 var promise1 = dbMainTags.update( {id: mainTagID}, {
					     $pull: { secTags:  oldName }
					 });
					 promise1.on('complete', function(err, obj) {
						 if (err || obj == null) {
				                console.log("updSecTagName::ERROR " + err);
				                callback(true, "The secondary tag cannot be renamed: " + err);
						 } else {
							//add the new tag
							 var promise2 = dbMainTags.update( {id: mainTagID}, {
							 	$addToSet: { secTags:  newName }
							 });
							 promise2.on('complete', function(err, obj) {
								 if (err || obj == null) {
						                console.log("updSecTagName::ERROR " + err);
						                callback(true, "The secondary tag cannot be renamed: " + err);
								 } else {
									 callback(false, null);
								 }
							 });
						 }						
					 });					
				 }				
			 }
		});
	};
	
	
	/**
     * Moves the specified secondary tag from one main tag to another one
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} oldMainTag The name of old main tag.
     * @param {Object} newMainTag The name of new main tag.
     * @param {Object} secTag The name of the secondary tag.
     */
	this.moveSecTag = function(socket, oldMainTagID, newMainTagID, secTag, callback) {
		var dbMainTags = db.get('MainTags');
		
		var promise = dbMainTags.findOne({
			id: newMainTagID, 
			//secondaryTags : {$in : [new RegExp('^' + secTag + '$', 'i')] } 
		});
		
		promise.on('complete', function(err, obj) {
			if (err) {
	        	console.log("moveSecTag::ERROR " + err);
	         	callback(true, "The secondary tag cannot be moved: " + err);
			} else {
				if(obj != null){
					var secondaryTagExists = false;
					
					for (var item in obj.secTags) {
						if(obj.secTags[item].toLowerCase() == secTag.toLowerCase()){
							secondaryTagExists = true;
							break;
						}
					}
					if(secondaryTagExists){
						console.log("The secondary tag cannot be moved since secondary tag with the same name alredy exists");
						callback(true, "tagManager.duplicateSecondaryTag.error");
					} else {
						//delete the old secondary tag
						var promise1 = dbMainTags.update( {id: oldMainTagID}, {
						    $pull: { secTags:  secTag }
						});
						promise1.on('complete', function(err, obj) {
							if (err) {
					        	console.log("moveSecTag::ERROR " + err);
					         	callback(true, "The secondary tag cannot be moved: " + err);
							} else {
								var promise2 = dbMainTags.update( {id: newMainTagID}, {
									$addToSet: { secTags:  secTag }
								});
								promise2.on('complete', function(err, obj) {
									if (err) {
							        	console.log("moveSecTag::ERROR " + err);
							         	callback(true, "The secondary tag cannot be moved: " + err);
									} else {
										callback(false, null);
									}
								});
							}
						});
					}
				}
			}
		});
	};
	
	/**
     * Updates the name of the specified main tag
     * 
     * @param {Object} tagID The ID of the main tag.
     * @param {Object} newName The new name of the main tag.
     * @param {Object} callback callback function
     * @returns {undefined}
     */   
    this.updMainTagName = function(tagID, newName, callback) {
        var dbMainTags = db.get('MainTags');
        
        var promise = dbMainTags.findOne({id: tagID.toString()});
        promise.on('complete', function(err, obj) {
            if (err || obj == null) {
                console.log("updMainTagName::ERROR " + err);
                callback(true, "updMainTagName::ERROR " + err);
            } else {
            	var tagToBeUpdated = obj;
            	var promise1 = dbMainTags.findOne({name: {$regex: "^" + newName + "$", $options: 'i'}});
            	promise1.on('complete', function(err, obj) {
            		if (err) {
                        console.log("updMainTagName::ERROR " + err);
                        callback(true, "updMainTagName::ERROR " + err);
                    } else {
                    	if(obj != null){
        					console.log("updSecTagName::ERROR " + err);
        		            callback(true, "The main tag cannot be renamed since main tag with the same name alredy exists.");
        				} else {
	                    	var containerID = tagToBeUpdated.containerID;
	                        
	                        var promise2 = dbMainTags.update( {id: tagID.toString()}, { 
	                            $set: { name:  newName } 
	                        }); 
	                        promise2.on('complete', function(err, obj) {
	                            if (err) {
	                            	callback(true, null);
	                            }  else {
	                            	console.log("Success");
	                            	callback(false, containerID);
	                            }
	                        });
        				}
                    }
            		
            		            		
            	});
                
            }
        });
    };
	
    /**
     * Deletes the specified main tag
     * 
     * @param {Object} socket The socket of the client.
     * @param {Object} mainTag The ID of the main tag.
     * @param {Object} callback callback function
     * @returns {undefined}
     */
	this.deleteMainTag = function(socket, mainTagID, callback) {
		var dbMainTags = db.get('MainTags');
		var dbObjects = db.get('objects');
		
		var promise = dbMainTags.findOne( {id: mainTagID });
		promise.on('complete', function(err, obj) {
		    
            if (err || obj == null) {
                //console.log("deleteMainTag::ERROR " + err);
                callback(true, "The main tag cannot be deleted: " + err);
            } else {	
				var promise1 = dbObjects.find( {type: FILE_TYPE_NAME, mainTag : obj.name, inRoom: {$nin:[TRASH_ROOM]} });
				
				promise1.on('complete', function(err, obj) {
		            if (err || obj == null) {
		                //console.log("deleteMainTag::ERROR " + err);
		                callback(true, "The main tag cannot be deleted: " + err);
		            } else {
		                if (obj.length == 0) {
		                	var promise2 = dbMainTags.findOne({id: mainTagID.toString()});
		            		promise2.on('complete', function(err, obj) {
		                        if (err) callback(true, "The main tag cannot be deleted: " + err);
		                        else {
		                            var containerID = obj.containerID;
		                            
		                            var promise3 = dbMainTags.remove({id: mainTagID.toString()});
		                            promise3.on('complete', function(err, obj) {
		                                if (err) { 
		                                	callback(true, "The main tag cannot be deleted: " + err);
		                                } else {                  
		                                	callback(false, undefined, containerID);
		                                } 
		                            });
		                        }
		                    });
		                } else {                	
		                	// console.log("The main tag cannot be deleted since there are files tagged with this tag");
		                	callback(true, "tagManager.maintagdeletion.error");
		                } 
		            }        
		        });
		
            }        
        });
	};
	
	/**
	 * Creates a GlobalContainer 
	 * 
	 * @param {type} context 
	 * @param {type} data
	 * @param {type} callback
	 */
	this.createGlobalContainer = function(context, data, callback) {
	    var attr = {
	            x: INITIAL_X,
	            y: INITAIL_Y,
	            height : CONTAINER_HEIGHT,
	            width  : CONTAINER_WIDTH,
	            name   : data.mainTag
	    };
	    
	    // calculates X and Y coordinates
	    var dbMainTags = db.get('MainTags');
	    dbMainTags.find({}, function (err, mainTags) {
            if (err) console.log("createGlobalContainer::ERROR " + err);
            else {
                var totalTags = mainTags.length;
                
                if ((freePlaces.length == 0) && (totalTags > 0)) {
                    var div = Math.floor(totalTags / CONTAINERS_PER_LINE);
                    var rest = totalTags % CONTAINERS_PER_LINE;
                
                    if (rest == 0) {
                        attr.y = INITAIL_Y + (div * (VERTICAL_GAP + CONTAINER_HEIGHT));
                    } else {
                        attr.y = INITAIL_Y + (div * (VERTICAL_GAP + CONTAINER_HEIGHT));
                        attr.x = INITIAL_X + (rest * (HORIZONTAL_GAP + CONTAINER_WIDTH));
                    }
                    
                } else if (freePlaces.length > 0) {
                    var freeSpace = getNextFreeSpace();
                    
                    attr.x = freeSpace.x;
                    attr.y = freeSpace.y;
                }
            }
            
            //console.log("(x,y) = (" + attr.x + "," + attr.y + ")");
            //console.log("data.mainTag = " + data.mainTag);
            
            Modules.ObjectManager.createObject('public', 'GlobalContainer', attr, false, context, callback);
	    });
	};
	
	/**
	 * Deletes a global container
	 */
	this.deleteGlobalContainer = function(containerID, context, callback) {
	    Modules.ObjectManager.getObject('public', containerID, context, function (obj) {
	        var coordinates = {
	            x : obj.get('x'),
	            y : obj.get('y')
	        }; 
	        Modules.ObjectManager.remove(obj);
	        if (callback != null && callback != undefined) callback(coordinates);
	    });
	}
	
	/**
	 * Creates missing containers
	 */
	this.createMissingContainers = function(context, callback) {
	    var dbMainTags = db.get('MainTags');
	    var newContainersCounter = 0;
	    
	    dbMainTags.find( {}, function (err, docs) {
	        if (err) console.log("createMissingContainers::ERROR " + err);
	        else {
	            
	            function recursive(i) {
	                if (i < docs.length) {
	                    var tag = docs[i];
	                    
	                    if (tag.containerID == undefined || tag.containerID == "") {
	                        that.createGlobalContainer(context, { mainTag: tag.name }, function(err, obj) {
	                            dbMainTags.update( {id: tag.id.toString()}, { 
	                                $set: { containerID:  obj.id } 
	                            }, function(err, o) {
	                                // console.log("Updated tag: " + tag.name + " with container ID: " + obj.id );
	                                newContainersCounter++;
	                                recursive(i + 1);
	                            });  
	                        });
	                    } else {
	                        recursive(i + 1);
	                    }
	                } else {
	                    callback(newContainersCounter);
	                }
	            }
	            
	            recursive(0);
	        }
	    });
	}
	
	/**
	 * Order the containers
	 */
	this.OrderContainers = function(context) {
	    freePlaces = [];
	    var dbMainTags = db.get('MainTags');
	    
	    // console.log("sorting containers...");
        
        dbMainTags.find({}, [CONTAINER_ID], function(e, mainTags) {
            if (e) console.log("OrderContainers::ERROR " + e);
            else {
                var cX = INITIAL_X;
                var cY = INITAIL_Y;
                
                var horizontalCounter = 0;
                
                function recursive(i) {
                    if (i < mainTags.length) {
                        var containerID = mainTags[i].containerID;
                        
                        Modules.ObjectManager.getObject('public', containerID, context, function (object) {
                            if (object) {
                                object.setAttribute('x', cX);
                                object.setAttribute('y', cY);
                                object.persist();
                                
                                cX += HORIZONTAL_GAP + CONTAINER_WIDTH;
                                
                                horizontalCounter++;
                                
                                if (horizontalCounter == CONTAINERS_PER_LINE) {
                                    horizontalCounter = 0;
                                    cX = INITIAL_X; // new line
                                    cY += VERTICAL_GAP + CONTAINER_HEIGHT;
                                }
                            }
                            
                            recursive(i + 1);
                        });
                    }
                }
                
                recursive(0);
            }
        });
	}  
};

function getNextFreeSpace() {
    var freeSpace = null;
    
    if (freePlaces.length > 0) {
        freeSpace = freePlaces[0];
        
        if (freePlaces.length > 1) {
            var counter = 1;
            var aux = freePlaces[counter]; 
            
            while (aux.y == freeSpace.y) {       // This means the two spaces are in the same row
               
                if (aux.x < freeSpace.x) {      // if the position of auxiliar is more to the left then choose it
                    freeSpace = aux;
                }
                
                counter++;
                if (freePlaces.length == counter) break;
                
                aux = freePlaces[counter]; 
            }
        }
        
        freePlaces = _.filter(freePlaces, function(space) { return (space.x != freeSpace.x) || (space.y != freeSpace.y) } ); 
    } 
    
    //console.log("++ freePlaces: " + JSON.stringify(freePlaces));
    
    return freeSpace;
}

module.exports = new TagManager();