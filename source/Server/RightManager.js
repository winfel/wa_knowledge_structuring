
var _ = require('underscore');

var db = false;
var Modules = false;

/**
 * @class RightManager
 * @classdesc This is the right manager on the server side.
 */
var RightManager = function () {
  var that = this;

  /**
   * Initializes the right manager on the server,
   * 
   * @function init
   * @param {type} theModules
   * @returns {undefined}
   */
  this.init = function (theModules) {
    Modules = theModules;
    db = require('monk')(Modules.MongoDBConfig.getURI());

    // Register RightManager related server calls...
    Modules.Dispatcher.registerCall('rmHasAccess', function (socket, data, responseID) {
      var connection = Modules.UserManager.getConnectionBySocket(socket);
      that.hasAccess(data.object, connection.user, data.right, function (result) {
        Modules.SocketServer.sendToSocket(socket, "rmHasAccessResult" + data.object.id, result);
      });
    });

    Modules.Dispatcher.registerCall('rmModifyAccess', function (socket, data, responseID) {
      //var connection = Modules.UserManager.getConnectionBySocket(socket);
      that.modifyAccess(data.object, data.right, data.role, data.grant, function (docs) {

        that.notifyManagers(socket, data.object, "rmModifiedAccess", {
          object: data.object,
          right: data.right,
          role: data.role,
          grant: data.grant
        });
      });
    });

    Modules.Dispatcher.registerCall("rmModifyUser", function (socket, data) {
      //var connection = Modules.UserManager.getConnectionBySocket(socket);
      that.modifyUser(data.object, data.user, data.role, data.add, function () {
        // Broadcast to all manager of the object...
        that.notifyManagers(socket, data.object, "rmModifiedUser", {
          object: data.object,
          user: data.user,
          role: data.role,
          add: data.add
        });
      });
    });

    Modules.Dispatcher.registerCall("rmModifyRole", function (socket, data) {
      //var connection = Modules.UserManager.getConnectionBySocket(socket);
      that.modifyRole(data.object, data.rolename, data.add, data.deletable, function (roleObject) {
        // Broadcast to all manager of the object...
        if (!roleObject.error) {
          that.notifyManagers(socket, data.object, "rmModifiedRole", {
            object: data.object,
            role: roleObject,
            add: data.add,
            deletable: data.deletable
          });
        } else {
          that.sendErrorMessage(socket, roleObject.error);
        }
      });
    });

    Modules.Dispatcher.registerCall("rmGetSupportedObjects", function (socket, data) {
      that.getSupportedObjects(function (objects) {
        Modules.SocketServer.sendToSocket(socket, "rmSupportedObjects", objects);
      });
    });

    Modules.Dispatcher.registerCall("rmGetRoles", function (socket, data) {
      var connection = Modules.UserManager.getConnectionBySocket(socket);

      that.isManager(data.object, connection.user, function (result) {
        if (result) {
          that.getRoles(data.object, function (roles) {
            Modules.SocketServer.sendToSocket(socket, "rmRoles" + data.object.id, roles);
          });
        } else {
          var error = {type: "blank", message: "You cannot access the right manager.", hide: false, object: data.object};
          // We need to send a rmRoles message to the server, because the client side of the right manager
          // has registered such a callback!
          Modules.SocketServer.sendToSocket(socket, "rmRoles" + data.object.id, error);
        }
      });
    });
  };

  /**
   * Maps the given object to another type of object. E.g. Subroom to Room.
   * 
   * @function mapObject
   * @param {type} object       The object to map.
   * @param {type} isRegister   Indicates whether this function is called during some right or role registration process.
   * @returns {undefined}
   */
  this.mapObject = function (object, isRegister) {
    //var dataObject = {id: object.id, type: object.type, inRoom: object.inRoom, parent: object.parent};
    var dataObject = _.clone(object); // Shallow copy
    switch (object.type) {
      // PaperSpace and Subroom are technically still a room.
      case "PaperSpace":
      case "Subroom":
        if (!isRegister) {
          if (object.getAttribute) {
            var destination = object.getAttribute('destination');
            if (!destination) {
              // No destination yet? Create one...
              // This should be done in more general place...
              destination = (new Date()).getTime() - 1296055327011;
              object.setAttribute('destination', String(destination));
            }
            dataObject.id = destination;
          } else if (object.attributes && object.attributes.destination) {
            dataObject.id = object.attributes.destination;
          } else {
            dataObject.id = object.destination;
          }
        }
        dataObject.type = "Room";
        dataObject.initial_id = object.id;
        dataObject.initial_type = object.type;
        break;
    }

    return dataObject;
  };

  /**
   * Reverts the mapping done mapObject.
   * 
   * @function unmapObject
   * @param {type} object
   * @returns {RightManager.unmapObject.dataObject}
   */
  this.unmapObject = function (object) {
    //var dataObject = {id: object.id, type: object.type, inRoom: object.inRoom, parent: object.parent};
    var dataObject = _.clone(object);
    if (object.initial_id)
      dataObject.id = object.initial_id;
    if (object.initial_type)
      dataObject.type = object.initial_type;
    return dataObject;
  };

  /**
   * Registers a right for a given object.
   * 
   * @function registerRight
   * @param {type} object
   * @param {type} name
   * @param {type} comment
   * @param {type} mask
   * @returns {undefined}
   */
  this.registerRight = function (object, name, comment, mask) {

    if (object.supportsRightmanager) {
      var dataObject = this.mapObject(object, true);

      var dbRights = db.get('rights');
      dbRights.update({
        type: String(dataObject.type),
        name: String(name)
      }, {
        type: String(dataObject.type),
        name: String(name),
        comment: String(comment)
      }, {
        upsert: true
      });
    }
  };

  /**
   * Registers a default role for a given object.
   * 
   * @function registerDefaultRole
   * @param {type} object
   * @param {type} name
   * @param {type} rights
   * @returns {undefined}
   */
  this.registerDefaultRole = function (object, name, rights) {
    var dataObject = this.mapObject(object, true);
    var dbDefRoles = db.get('defroles');
    if (String(name).toLowerCase() == "manager" && !rights) {
      // If the rights array is omitted and the role is manager,
      // then get all rights and call the function again.
      var dbRights = db.get('rights');
      dbRights.distinct("name", {type: dataObject.type}, function (e, docs) {
        that.registerDefaultRole(dataObject, name, docs);
      });
      return;
    }
    // Overwrite old or insert new right.
    dbDefRoles.update({
      object: String(dataObject.type),
      name: String(name)
    }, {
      object: String(dataObject.type),
      name: String(name),
      rights: rights
    }, {
      upsert: true
    });
  };

  /**
   * 
   * @function getObjectRights
   * @param {Object} object
   * @param {Function} callback
   * @returns {undefined}
   */
  this.getObjectRights = function (object, callback) {
    var dataObject = this.mapObject(object);

    var dbRights = db.get('rights');
    dbRights.distinct("name", {type: dataObject.type}, function (e, docs) {
      if (callback) {
        callback(docs);
      }
    });
  };

  /**
   * Notifies all users, who have the right to manage the given object and are
   * in the same room who performed some changes.
   * 
   * @function notifyManagers
   * @param {type} socket
   * @param {type} object
   * @param {type} message
   * @param {type} data
   * @returns {undefined}
   */
  this.notifyManagers = function (socket, object, message, data) {
    var connection = Modules.UserManager.getConnectionBySocket(socket);
    // Broadcast to all manager of the object...
    var roomConnections = Modules.UserManager.getConnectionsForRoom(connection.rooms.left.id);

    for (var i in roomConnections) {
      // Only send a message to other managers.
      that.isManager(object, roomConnections[i].user, function (result) {
        if (result) {
          Modules.SocketServer.sendToSocket(roomConnections[i].socket, message, data);
        }
      });
    }
  };

  /**
   * Sends an error message to a specific socket.
   * 
   * @function sendErrorMessage
   * @param {type} socket   The socket the error message is for.
   * @param {type} error    An object with the attributes type and error.
   * @returns {undefined}
   */
  this.sendErrorMessage = function (socket, error) {
    if (error.hide == undefined)
      error.hide = true;

    Modules.SocketServer.sendToSocket(socket, "rmError", error);
  };

  /**
   * This method returns the parent of this object
   * If the parent cannot be determined it returns null.
   * 
   * @function getParentObject
   * @param {Object}    object
   * @param {Function}  callback
   * @returns {RightManager.getParentOfObject.Anonym$26}
   */
  this.getParentObject = function (object, callback) {
    // Check the database
    var dbObjects = db.get('objects');

    if (object.id == "public") {
      // There is no parent for the public room...
      callback(null);
    } else if (object.type == "Room" && object.parent) {
      // If the object is a room, we only traverse through the parent attribute...
      dbObjects.find({id: object.parent, type: "Room"}, {}, function (e, objects) {
        if (objects && objects.length > 0) {
          callback(objects[0]);
        } else {
          callback(null);
        }
      });

    } else if (object.inRoom) {

      // No room yet, so we use the inRoom variable to get to the parent room...
      dbObjects.find({id: object.inRoom, type: "Room"}, {}, function (e, objects) {
        if (objects && objects.length > 0) {
          callback(objects[0]);
        } else {
          callback(null);
        }
      });
    } else {
      // If no inRoom attribute, there is no need to contact the database...
      callback(null);
    }
  };
  /**
   * The function returns a boolean value that 
   * represents if the current user has the right 
   * to perform a specific command.
   *	
   * @function hasAccess
   * @param {type}       object      The object that should be checked
   * @param {type}       user        The user object
   * @param {type}       right       The right to be checked, e.g., read, write (CRUD)
   * @param {function}   callback    The callback function with one boolean parameter (the answer)
   * @param {function}   recursive   
   */
  this.hasAccess = function (object, user, right, callback, recursive) {
    var dataObject = this.mapObject(object);
    var that = this;

    if (recursive == undefined)
      recursive = true;

    var dbRoles = db.get('roles');
    dbRoles.find({objectid: String(dataObject.id)}, {}, function (e, roles) {

      // Check if rights are set up for this object.
      // If not, check if the parent Room is configured...
      if (!roles || roles.length < 1) {
        if (recursive) {
          that.getParentObject(dataObject, function (parent) {
            if (parent) {
              // We are just looking for the direct parent. Which is why we pass
              // false to the recursive parameter.
              that.hasAccess(parent, user, right, callback, false);
            } else {
              // If no parent could be found at all, grant access...
              callback(false);
            }
          });
        } else {
          // Do not look any deeper. No access then...
          callback(false);
        }
      } else {
        // Object found. Check roles.
        var accessGranted = false;
        roles.forEach(function (role) {
          // Check if the role contains the needed right
          var roleHasRight = (role.rights.indexOf(String(right)) >= 0);
          if (roleHasRight) {
            // Check if current user is inside of one of these roles
            var userIsInUserList = (role.users.indexOf(String(user.username)) >= 0)
                    || (role.users.indexOf("all") >= 0);
            if (userIsInUserList) {
              accessGranted = true;
            }
          }
        });
        callback(accessGranted);
      }
    });
  };

  /**
   * Determines whether the user is a manager of the given
   * object or not. This function is used by the right manager
   * itself in order to grant access or not.
   * 
   * @function isManager
   * @param {Object}      object
   * @param {Object}      user        The user object
   * @param {Function}    callback
   * @returns {undefined}
   */
  this.isManager = function (object, user, callback) {
    var dataObject = this.mapObject(object);
    var dbRoles = db.get('roles');
    dbRoles.find({objectid: String(dataObject.id), name: "Manager"}, {}, function (e, docs) {
      var result = false;
      if (docs.length > 0) {
        result = docs[0].users.indexOf(user.username) >= 0;
      }
      callback(result);
    });
  };

  /**
   * The function can be used to grant access rights
   * 
   * @function grantAccess
   * @param {type} object    The object that should be used to change the access right
   * @param {type} right     The right, which needs to be checked , e.g., read, write (CRUD)
   * @param {type} role      The role that should be changed
   */
  this.grantAccess = function (object, right, role) {
    this.modifyAccess(object, right, role, true);
  };

  /**
   * The function can be used to revoke access rights
   * 
   * @function revokeAccess
   * @param {type} object    The object that should be used to change the access right
   * @param {type} right     The right, which needs to be checked , e.g., read, write (CRUD)
   * @param {type} role      The role that should be changed
   */
  this.revokeAccess = function (object, right, role) {
    this.modifyAccess(object, right, role, false);
  };

  /**
   *	The function can be used to modify access rights
   *	
   * @function modifyAccess
   * @param {type}   object    The object that should be used to change the access right
   * @param {type}   right     The right, which needs to be checked , e.g., read, write (CRUD)
   * @param {type}   role      The role that should be changed
   * @param {type}   grant     The grant paramter is set to true, if the access right should be
   *                           granted. Set false, to revoke access.
   * @param {type} callback     
   */
  this.modifyAccess = function (object, right, role, grant, callback) {
    var dataObject = this.mapObject(object);

    var collection = db.get('roles');
    collection.find({objectid: String(dataObject.id), name: String(role.name)}, {}, function (e, docs) {
      docs.forEach(function (item) {
        /* (2) update role */
        if (grant == true) {
          /* store to database */
          collection.update({_id: item._id}, {$addToSet: {rights: right.name}});
        } else {
          collection.update({_id: item._id}, {$pull: {rights: right.name}});
        }
      });
      if (callback)
        callback(docs);
    });
  };

  /**
   * Returns the roles of a given object stored in the database.
   * 
   * @function getRoles
   * @param {Object}    object
   * @param {Funciton}  callback
   * @returns {undefined}
   */
  this.getRoles = function (object, callback) {
    var dataObject = this.mapObject(object);

    var dbRoles = db.get('roles');
    dbRoles.find({objectid: String(dataObject.id)}, {}, function (e, docs) {
      callback(docs);
    });
  };

  /**
   * Returns all supported object types to a given callback.
   * 
   * @function getSupportedObjects
   * @param {Function}  callback   The callback we the data is given to.
   */
  this.getSupportedObjects = function (callback) {
    var dbRights = db.get('rights');
    dbRights.distinct("type", {}, function (e, docs) {
      if (callback) {
        callback(docs);
      }
    });
  };

  /**
   *	The function can be used to add/remove a user to/from a specific role.
   *	
   *	@function modifyUser
   *	@param {Object}   object    The object that should be used to get the specfic role
   *	@param {String}   user      The user object that should be added
   *	@param {Object}   role      The used role passed as a RoleObject
   *	@param {Boolean}  add       
   *	@param {Function} callback   
   */
  this.modifyUser = function (object, user, role, add, callback) {
    var dataObject = this.mapObject(object);

    var dbRoles = db.get('roles');

    dbRoles.find({objectid: String(dataObject.id), name: String(role.name)}, {}, function (e, docs) {
      docs.forEach(function (item) {
        if (add == true) {
          dbRoles.update({_id: item._id}, {$addToSet: {users: user}});
        } else {
          dbRoles.update({_id: item._id}, {$pull: {users: user}});
        }
      });
      if (callback)
        callback();
    });
  };

  /**
   *	The function adds/removes a role to/of an object.
   *	
   *	@function modifyRole
   *	@param {Object}     object        The object that should be used to get the specfic role
   *	@param {String}     rolename      The role name
   *	@param {Boolean}    add           Indicates if the role should be added or deleted.
   *	@param {Boolean}    deletable     Indicates if the role can be deleted by a user or not.
   *	@param {Function}   callback      
   *	@param {Array}      rights        Array of rights. Optional.
   *	@param {Array}      users         Array of users. Optional.
   *	@param {Boolean}    checkParent   Indicates if the hasAccess method should look at the parent 
   */
  this.modifyRole = function (object, rolename, add, deletable, callback, rights, users, checkParent) {
    var dataObject = this.mapObject(object);

    var role = {
      objectid: String(dataObject.id),
      name: rolename,
      deletable: deletable
    };

    var dbRoles = db.get('roles');
    if (add) {
      // Create a new role.
      // create empty arrays if the arrays are not exisiting
      if (rights)
        role.rights = rights;
      else
        role.rights = [];

      if (users)
        role.users = users;
      else
        role.users = [];

      // default mode = overwrite
      if (checkParent)
        role.checkParent = checkParent;
      else
        role.checkParent = false;

      // Search for existing role name (case-insensitive)
      dbRoles.find({objectid: String(dataObject.id), name: {$regex: "^" + String(role.name) + "$", $options: '-i'}}, {}, function (e, docs) {
        if (docs.length == 0) {
          dbRoles.insert(role);
        } else {
          role.error = {type: "error", message: 'The role "ROLE" already exists', placeholderData: {ROLE: role.name}};
        }
        // Call the callback anyway. With or without errors.
        if (callback)
          callback(role);
      });

    } else {
      // Remove the role.
      if (String(role.name).toLowerCase() != "manager") {
        dbRoles.remove({
          objectid: String(role.objectid),
          name: role.name
        });
      } else {
        role.error = {type: "error", message: 'You cannot delete the manager role!'};
      }

      // Call the callback anyway. With or without errors.
      if (callback)
        callback(role);
    }
  };
};

module.exports = new RightManager();