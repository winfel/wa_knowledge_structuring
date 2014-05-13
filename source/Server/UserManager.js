/**
 *   Webarena - A web application for responsive graphical knowledge work
 *
 *   @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *   @class UserManager
 *   @classdesc the UserManager holds connection information. For every connection, it saves
 *   information about who is logged in, which room he is in
 *   and the socket. Actual socket connections are handled by SocketServer
 */
"use strict";

var db = require('monk')('localhost/WebArena');
var DEBUG_OF_USERMANAGEMENT = false;

var UserManager = {};

var Modules = false;
var enter = String.fromCharCode(10);
var possibleAccessRights = [];

var PAPER_WRITER = "Writer";

UserManager.connections = {};

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
UserManager.init = function(theModules) {
  Modules = theModules;
  var Dispatcher = Modules.Dispatcher;
  Dispatcher.registerCall('login', UserManager.login);
  Dispatcher.registerCall('enter', UserManager.enterRoom);
  Dispatcher.registerCall('leave', UserManager.leaveRoom);

  Dispatcher.registerCall("umClearRoles", UserManager.clearRoles);
  Dispatcher.registerCall("umLoadDefaultRoles", UserManager.loadDefaulRoles);
  Dispatcher.registerCall('umGetRoles', UserManager.getRoles);
  Dispatcher.registerCall("umGetMissingUsers", UserManager.getMissingUsers);
  Dispatcher.registerCall('umAddRole', UserManager.addRole);
  Dispatcher.registerCall('umRemoveRole', UserManager.removeRole);

  Dispatcher.registerCall('umGetUsers', UserManager.getUsers);
  Dispatcher.registerCall('umAddUser', UserManager.addUser);
  Dispatcher.registerCall('umRemoveUser', UserManager.removeUser);

  Dispatcher.registerCall('enterPaperWriter', UserManager.enterPaperWriter);

  /* get all exiting access rights from the database */
  var collection = db.get('rights');
  collection.find({}, {}, function(e, docs) {
    if (docs != undefined) {
      docs.forEach(function(entry) {

        Modules.Log.debug("adding right: " + String(entry.name));
        possibleAccessRights.push(entry.name);
      });
    }
  });
  Modules.Log.debug("UserManager has been initialized");
};

/**
 * In case of a new connection, a new entry is created.
 * 
 * @param {Object} socket the socket of the client.
 */
UserManager.socketConnect = function(socket) {
  this.connections[socket.id] = ({'socket': socket, 'user': false, 'rooms': {'left': false, 'right': false}});
};

/**
 * Delete all connection data, when a socket disconnects and informs all remaining users 
 * in the user's room about the disconnect.
 *
 * @param {Object} socket the socket of the client.
 */
UserManager.socketDisconnect = function(socket) {

  var rooms = this.getConnectionBySocket(socket).rooms;

  delete (this.connections[socket.id]);

  for (var index in rooms) {
    if (rooms[index]) {
      UserManager.sendAwarenessData(rooms[index].id);
    }
  }

};

/**
 * When a user tries to log in, his credentials are tested and added to the
 * connection
 * 
 * @param {Object} socketOrUser The user.
 * @param {Object} data The credentials of the user.
 */
UserManager.login = function(socketOrUser, data) {
  if (typeof socketOrUser.id == 'string')
    var userID = socketOrUser.id;
  else
    var userID = socketOrUser;
  // var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;

  var connection = UserManager.connections[userID];
  if (!connection) {
    Modules.Log.error("UserManager", "+login", "There is no connection for this user (user: '" + userID + "')");
    return;
  }

  var socket = connection.socket;
  var connector = Modules.Connector;
  var socketServer = Modules.SocketServer;

  // try to login on the connector
  connector.login(data.username, data.password, data.externalSession, connection, function(data) {

    // if the connector returns data, login was successful. In this case
    // a new user object is created and a loggedIn event is sent to the
    // client

    if (data) {

      var colors = [
        "#398da8",
        "#39a842",
        "#a84d39",
        "#a8398e",
        "#a2a839",
        "#39a899",
        "#74a839",
        "#a87639",
        "#1d68c4",
        "#c41d73",
        "#1dc46e",
        "#c46b1d"
      ];

      var userColor = colors[Math.floor(Math.random() * colors.length + 1)];

      var userObject = require('./User.js');
      connection.user = new userObject(this);
      connection.user.username = data.username;
      connection.user.password = data.password;
      connection.user.color = userColor;
      connection.user.externalSession = data.externalSession;
      connection.user.id = socket.id;

      connection.user.home = data.home;
      connection.user.hash = '___' + require('crypto').createHash('md5').update(socket.id + connection.user).digest("hex");

      socketServer.sendToSocket(socket, 'loggedIn', {
        userData: connection.user,
        userhash: connection.user.hash,
        home: connection.user.home
      });

      Modules.EventBus.emit("server::user::login", {username: connection.user.username});

    } else {
      socketServer.sendToSocket(socket, 'loginFailed', 'Wrong username or password!');
    }

  });

};

UserManager.enterPaperWriter = function(socketOrUser, data, responseID) {
  UserManager.enterRoom(socketOrUser, data, responseID);

  var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;
  var context = UserManager.connections[userID];

  Modules.ObjectManager.getObjects(data.roomID, context, function(inventory) {
    for (var aux in inventory) {
      var obj = inventory[aux];

      if (obj.type == PAPER_WRITER) {
        return;
      }
    }

    var attr = {x: "20", y: "45", width: "700", locked: true, paper: data.roomID};
    Modules.ObjectManager.createObject(data.roomID, PAPER_WRITER, attr, false, context, function(error, obj) {
      //Modules.Log.debug(obj);
    });
  });
};

/**
 * Let a user enter a room with a specific roomID
 *  
 * @param {Object} socketOrUser The user.
 * @param {Object} data The received data.
 * @param {Object} responseID response ID.
 **/
UserManager.enterRoom = function(socketOrUser, data, responseID) {
  if (typeof socketOrUser.id == 'string')
    var userID = socketOrUser.id;
  else
    var userID = socketOrUser;
  // var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;

  if (data.index === undefined)
    var index = 'left';
  else
    var index = data.index;
  // var index = (data.index === undefined) ? 'left' : data.index;

  var roomID = data.roomID;

  var connection = UserManager.connections[userID];
  var ObjectManager = Modules.ObjectManager;

  //oldrooom is sent down to the connector, which may use it for parent creation
  if (connection.rooms[index]) {
    var oldRoomId = connection.rooms[index].id;
  }

  if (!connection) {
    Modules.Log.error("UserManager", "+enter", "There is no connection for this user (user: '" + userID + "')");
    return;
  }

  var socket = connection.socket;
  var connector = Modules.Connector;
  var socketServer = Modules.SocketServer;
  var user = connection.user;

  // try to enter the room on the connector
  connector.mayEnter(roomID, connection, function(err, mayEnter) {

    // if the connector responds true, the client is informed about the successful entering of the room
    // and all clients in the same rooms get new awarenessData.
    if (mayEnter) {

      ObjectManager.getRoom(roomID, connection, function(room) {
        connection.rooms[index] = room;
        Modules.RoomController.sendRoom(socket, room.id);
        socketServer.sendToSocket(socket, 'entered', room.id);
        UserManager.sendAwarenessData(room.id);
      }, oldRoomId);

      //ObjectManager.sendChatMessages(roomID,socket);

      Modules.Dispatcher.respond(socket, responseID, false);
      Modules.EventBus.emit("room::" + roomID + "::userEntered", {username: connection.user.username});

    } else {
      socketServer.sendToSocket(socket, 'error', 'User ' + user.username + ' may not enter ' + roomID);
      Modules.Dispatcher.respond(socket, responseID, true);
    }

  });
};

/**
 * Let a user leave a room with a specific roomID
 * 
 * @param {Object} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID response ID.
 */
UserManager.leaveRoom = function(socket, data, responseID) {
  if (data.index === undefined)
    var index = 'right';
  else
    var index = data.index;
  // var index = (typeof data.index == undefined) ? 'right' : data.index;

  var roomID = data.roomID;
  var userID = data.user.id;

  var connection = UserManager.connections[userID];

  delete (connection.rooms[index]);

  UserManager.sendAwarenessData(roomID);

  Modules.Dispatcher.respond(socket, responseID, false);
};

/**
 * AwarenessData is a set of information about the users in the current room.
 * This may be extended further, when user get their own objects
 * 
 * @param {Object} roomID The id of the room.
 * @param {Object} connections ???.
 **/
UserManager.getAwarenessData = function(roomID, connections) {
  var awarenessData = {};
  awarenessData.room = roomID;
  awarenessData.present = [];
  for (var i in connections) {
    var con = connections[i];

    var presData = {};
    presData.username = con.user.username;
    presData.id = i;
    presData.color = con.user.color;
    awarenessData.present.push(presData);
  }
  return awarenessData;
};

/**
 * Sends awarenessData about a room to all clients within that room.
 * 
 * @param {Object} roomID The id of the room.
 **/
UserManager.sendAwarenessData = function(roomID) {
  var connections = UserManager.getConnectionsForRoom(roomID);

  var awarenessData = UserManager.getAwarenessData(roomID, connections);

  for (var i in connections) {
    var con = connections[i];
    var sock = con.socket;

    var data = {};
    data.message = {};
    data.message['awareness'] = awarenessData;
    data.room = roomID;
    data.user = 'Server';

    Modules.SocketServer.sendToSocket(sock, 'inform', data);
  }
  loggedInInfo();
};

/**
 * Get the connections of the specified room.
 * 
 * @param {Object} roomID The id of the room.
 * @return {Object} the connections of the room
 **/
UserManager.getConnectionsForRoom = function(roomID) {
  var result = {};
  for (var connectionID in this.connections) {
    var connection = this.connections[connectionID];
    for (var index in connection.rooms) {
      if (connection.rooms[index] && roomID == connection.rooms[index].id) {
        result[connectionID] = connection;
        break;
      }
    }
  }

  return result;
};

/**
 * Get connections by socket.
 * 
 * @param {Object} socket The specified socket
 * @return {boolean} The connections
 **/
UserManager.getConnectionBySocket = function(socket) {
  for (var i in this.connections) {
    var connection = this.connections[i];
    if (connection.socket == socket)
      return connection;
  }

  return false;
};

/**
 * Get connections by the Id of a socket.
 * 
 * @param {Object} socketID The specified id of a socket
 * @return {boolean} The connections
 **/
UserManager.getConnectionBySocketID = function(socketID) {
  for (var i in this.connections) {
    var connection = this.connections[i];
    if (connection.socket.id == socketID)
      return connection;
  }

  return false;
};

/**
 * Get connections by User hash.
 * 
 * @param {Object} userHash The specified userHash
 * @return {boolean} The connections
 **/
UserManager.getConnectionByUserHash = function(userHash) {
  for (var i in this.connections) {
    var connection = this.connections[i];
    if (connection.user.hash == userHash)
      return connection;
  }

  return false;
};




/**
 *	The function can be used to add a role
 *
 * @param {type} role   The used role passed as a RoleObject
 * @param {type} object The object that should be used to change the access right
 *
 *	A call could look like this: modifyAccess(ReviewRole.create(),"AB");
 */
UserManager.addRole = function(socket, data) {
  UserManager.modifyRole(socket, data, true);
};

/**
 *	The function can be used to remove a role
 *
 * @param {type} role   The used role passed as a RoleObject
 * @param {type} object The object that should be used to change the access right
 * @returns {undefined}
 */
UserManager.removeRole = function(socket, data) {
  UserManager.modifyRole(socket, data, false);
};

/**
 *	The function can be used to modify a role
 *	@param {type}	role    The used role passed as a RoleObject
 *	@param {type}	object  The object that should be used to change the access right
 *	@param {type}   add   The grant paramter is set to true, if the access right should be
 *			granted. Set false, to revoke access.
 *	A call could look like this: modifyAccess(ReviewRole.create(),"AB", true);
 */
UserManager.modifyRole = function(socket, data, add) {
  var role = {
    contextID: data.object.id,
    name: data.role.name
  };

  var collection = db.get('roles');

  /* create empty arrays if the arrays are not exisiting */
  if (role.rights == null) {
    role.rights = [];
  }

  if (role.users == null) {
    role.users = [];
  }

  /* default mode = overwrite */
  if (role.mode == null) {
    role.mode = "overwrite";
  }

  /* add resp. remove the role */
  if (add == true) {
    if (role.name == "Manager") {
      /* overwrite rights and users */
      role.rights = ["create", "read", "update", "delete"];
      role.users = [data.username];
    }

    collection.insert({
      contextID: String(role.contextID),
      mode: role.mode,
      name: role.name,
      rights: role.rights,
      users: role.users});

  } else {
    if (role.name == "Manager") {
      console.log("you cannot remove the manager role!");
    } else {
      console.log("trying to remove : " + role.contextID + " | " + role.name);
      collection.remove({contextID: String(role.contextID),
        name: String(role.name)});
    }
  }
};

UserManager.getRoles = function(socket, data) {
  var collection = db.get('roles');

  collection.find({contextID: String(data.object.id)}, {}, function(e, docs) {
    Modules.SocketServer.sendToSocket(socket, "umGetRoles" + data.object.id, docs);
  });

};

UserManager.isManager = function(socket, data) {
  var collection = db.get('roles');

  collection.find({contextID: String(data.object.id)}, {}, function(e,
          docs) {

    docs.forEach(function(doc) {
      if (doc.name == "Manager") {

        var found = false;
        doc.users.forEach(function(u) {
          if (data.username == u)
            found = true;
        });

        if (found) {
          Modules.SocketServer.sendToSocket(socket, "umIsManager" + data.object.id, docs);
        } else {
          Modules.SocketServer.sendToSocket(socket, "umIsNotManager" + data.object.id, docs);
        }
      }

    });
  });
};

/**
 * 
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
UserManager.loadDefaulRoles = function(socket, data) {
  var that = UserManager;

  var object = data.object;

  var dbRights = db.get("rights");
  var dbDefRoles = db.get("defroles");
  var dbRoles = db.get("roles");

  var connection = that.getConnectionBySocket(socket);

  // Get the current manager role of the object
  dbRoles.find({contextID: String(object.id), name: "Manager"}, {}, function(e, owner) {

    // Get all rights for the object type
    dbRights.find({type: String(object.type)}, {}, function(e, docs) {

      // Create an array of all rights for the object type
      var managerRights = new Array();
      docs.forEach(function(right) {
        managerRights.push(right.name);
      });

      // Create the default manager role
      var managerRole = {
        contextID: String(object.id),
        name: "Manager",
        mode: "overwrite"
      };

      if (owner && owner.length > 0) {
        managerRole.rights = owner[0].rights;
        managerRole.users = owner[0].users;
      } else {
        managerRole.rights = managerRights;
        managerRole.users = [connection.user.username];
      }

      // Clear the current roles
      dbRoles.remove({contextID: String(object.id)});

      // Load the default roles
      dbDefRoles.find({object: String(object.type)}, {}, function(e, roles) {
        roles.push(managerRole);

        roles.forEach(function(role) {
          // Insert 
          if (role.users == undefined)
            role.users = new Array();

          dbRoles.insert({
            contextID: String(object.id),
            name: String(role.name),
            rights: role.rights,
            mode: String("overwrite"),
            users: role.users
          });
        });

        Modules.SocketServer.sendToSocket(socket, "umDefaultRoles" + object.id, roles);
      });
    });
  });
};

/**
 * 
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
UserManager.clearRoles = function(socket, data) {
  var object = data.object;

  var collection = db.get("roles");

  Modules.SocketServer.sendToSocket(socket, "umRolesCleared" + object.id);
};

/**
 *	The function can be used to add a user to a specific role
 *	
 *	@param {Object} socket  Socket connection
 *	@param {Object}	data    Send data
 */
UserManager.addUser = function(socket, data) {
  UserManager.modifyUser(data.role, data.object, data.username, true);
};

/**
 *	The function can be used to remove a user to a specific role
 *	@param {type}	role    The used role passed as a RoleObject
 *	@param {type}	object  The object that should be used to get the specfic role
 *	@param {type}   user    The user object that should be added
 */
UserManager.removeUser = function(socket, data) {
  UserManager.modifyUser(data.role, data.object, data.username, false);
};

/**
 *	The function can be used to remove a user to a specific role
 *	@param {type}	role    The used role passed as a RoleObject
 *	@param {type}	object  The object that should be used to get the specfic role
 *	@param {type}   username    The user object that should be added
 */
UserManager.modifyUser = function(role, object, username, add) {
  /* (1) get the current users */
  var collection = db.get('roles');
  collection.find({contextID: String(object.id), name: String(role.name)}, {}, function(e, docs) {
    Modules.Log.debug(docs);

    docs.forEach(function(item) {
      /* (2) update role */
      if (add == true) {
        /* store to database */
        collection.update({_id: item._id}, {$addToSet: {users: username}});
      } else {
        collection.update({_id: item._id}, {$pull: {users: username}});
      }
    });

    // Broadcast to all manager of the object...

  });
};

/**
 * 
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
UserManager.getUsers = function(socket, data) {
  var dbRoles = db.get('roles');

  dbRoles.find({contextID: String(data.object.id), name: String(data.role.name)}, {}, function(e, docs) {

    var result = (docs.length > 0 ? docs[0].users : []);

    Modules.SocketServer.sendToSocket(socket, "umUsers" + data.object.id, result);
  });
};

/**
 * 
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
UserManager.getMissingUsers = function(socket, data) {
  var dbRoles = db.get('roles');
  var dbUsers = db.get('users');

  dbUsers.find({}, {}, function(e, userDocuments) {

    dbRoles.find({contextID: String(data.object.id), name: String(data.role.name)}, {}, function(e, roleDocuments) {

      var result = (roleDocuments && roleDocuments.length > 0 ? roleDocuments[0].users : []);

      Modules.SocketServer.sendToSocket(socket, "umMissingUsers" + data.object.id, {allUsers: userDocuments, alreadyAddedUsers: result});
    });
  });
};

function loggedInInfo() {
  var connections = UserManager.connections;

  var count = 0;
  var userInfo = '';
  for (var i in connections) {
    var data = connections[i];
    count++;
    if (count > 1)
      userInfo += '; ';
    userInfo += data.user.username + ' in ';
    var countRooms = 0;

    for (var index in data.rooms) {
      if (data.rooms[index]) {
        if (countRooms > 0)
          userInfo += ' and ';
        userInfo += data.rooms[index].id;
        countRooms++;
      }
    }
  }
  Modules.Log.debug(count + ' users: ' + userInfo);
}

module.exports = UserManager;