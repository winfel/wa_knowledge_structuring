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
// DEMO TeST Comment
var db = false;
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
 * @function init
 * @param {Object} theModules variable to access the other modules.
 */
UserManager.init = function (theModules) {
  Modules = theModules;
  var that = this;

  db = require('monk')(Modules.MongoDBConfig.getURI());

  var Dispatcher = Modules.Dispatcher;
  Dispatcher.registerCall('login', UserManager.login);
  Dispatcher.registerCall('enter', UserManager.enterRoom);
  Dispatcher.registerCall('leave', UserManager.leaveRoom);

  Dispatcher.registerCall('setUserPreferredLanguage', UserManager.setUserPreferredLanguage);

  Dispatcher.registerCall("umGetMissingUsers", function (socket, data) {
    that.getMissingUsers(data.object, data.role, function (result) {
      Modules.SocketServer.sendToSocket(socket, "umMissingUsers" + data.object.id, result);
    });
  });

  Dispatcher.registerCall('umGetDataOfSpaceWithDest', UserManager.getDataOfSpaceWithDest);
  Dispatcher.registerCall('umSetDataOfSpaceWithDest', UserManager.setDataOfSpaceWithDest);
  Dispatcher.registerCall('umRemoveDataOfSpaceWithDest', UserManager.removeDataOfSpaceWithDest);

  Dispatcher.registerCall('enterPaperWriter', UserManager.enterPaperWriter);

  Dispatcher.registerCall('enterPublicSpace', UserManager.enterPublicSpace);
  Dispatcher.registerCall('enterPrivateSpace', UserManager.enterPrivateSpace);

  Dispatcher.registerCall('umIsManager', UserManager.isManager);
  Dispatcher.registerCall('umisValidUser', UserManager.isValidUser);

  Dispatcher.registerCall('umDeleteObjectFromTabs', function (socket, data) {
    for (var i in that.connections) {
      Modules.SocketServer.sendToSocket(that.connections[i].socket, "umBroadcastDeleteObjectFromTabs", data);
    }
  });

  Dispatcher.registerCall('umBroadcastNameChange', function (socket, data) {
    var object = data;

    for (var i in that.connections) {
      Modules.SocketServer.sendToSocket(that.connections[i].socket, "umBroadcastNameChange", data);
    }

  });

  Dispatcher.registerCall('umGetTabCache', function (socket, data) {
    var responseObject = {};

    var tabsDB = db.get('tabs');
    tabsDB.find({username: data.username}, {}, function (e, docs) {
      if (typeof docs != 'undefined' && docs.length > 0) {
        responseObject.username = data.username;
        responseObject.objectlist = docs[0].objectlist;
        responseObject.initTabs = docs[0].initTabs;
        responseObject.cache = [];

        var runs = 1;
        var objectCache = db.get('objectCache');
        responseObject.objectlist.forEach(function (entryInCache) {

          /* for each entry in cache: get important data and store it in the
           response object */
          objectCache.find({id: entryInCache}, {}, function (e, docs) {
            if (typeof docs != 'undefined' && docs.length > 0) {

              responseObject.cache.push({id: docs[0].id,
                isPO: docs[0].isPO,
                name: docs[0].name,
                dest: docs[0].dest
              });

              if (runs == responseObject.objectlist.length) {
                // data has been gathered: send it back
                Modules.SocketServer.sendToSocket(socket, "umGetTabCache" + data.username, responseObject);
              }
              runs++;
            } // end of if

          }); // end of objectCache.find
        }); // end of objectlist.foreach

      } /* end of if */ else {
        console.log("No tabs were saved for this username");
      }
    }); // end of tabsDb.find
  });

  Dispatcher.registerCall('umStoreTabCache', function (socket, data) {
    var tabsDB = db.get('tabs');
    // drop old objectlist
    tabsDB.remove({username: data.username});

    // push new objectlist
    tabsDB.insert({username: data.username, objectlist: data.objectlist, initTabs: data.initTabs});

    // update objectcache
    var objectCache = db.get('objectCache');
    data.cache.forEach(function (cacheEntry) {
      objectCache.remove({id: cacheEntry.id});

      objectCache.insert({id: cacheEntry.id,
        isPO: cacheEntry.isPO,
        name: cacheEntry.name,
        dest: cacheEntry.dest
      });
    });
  });


  Modules.Log.debug("UserManager has been initialized");
};

/**
 * In case of a new connection, a new entry is created.
 * 
 * @function socketConnect
 * @param {Object} socket the socket of the client.
 */
UserManager.socketConnect = function (socket) {
  this.connections[socket.id] = ({'socket': socket, 'user': false, 'rooms': {'left': false, 'right': false}});
};

/**
 * Delete all connection data, when a socket disconnects and informs all remaining users 
 * in the user's room about the disconnect.
 *
 * @function socketDisconnect
 * @param {Object} socket the socket of the client.
 */
UserManager.socketDisconnect = function (socket) {

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
 * @function login
 * @param {Object} socketOrUser The user.
 * @param {Object} data The credentials of the user.
 */
UserManager.login = function (socketOrUser, data) {
  var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;

  var connection = UserManager.connections[userID];
  if (!connection) {
    Modules.Log.error("UserManager", "+login", "There is no connection for this user (user: '" + userID + "')");
    return;
  }

  var socket = connection.socket;
  var connector = Modules.Connector;
  var socketServer = Modules.SocketServer;

  // try to login on the connector
  connector.login(data.username, data.password, data.externalSession, connection, function (data) {

    // if the connector returns data, login was successful. In this case
    // a new user object is created and a loggedIn event is sent to the
    // client

    if (data) {
      // Create the private space manager role.
      var privateSpace = {id: "PrivateSpace" + data.username, type: "Room"};
      Modules.RightManager.getObjectRights(privateSpace, function (rights) {
        Modules.RightManager.modifyRole(privateSpace, "Manager", true, false, false, rights, [data.username]);
      });

      // if there is no color yet, create one and store it
      if (!data.color) {
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
        data.color = userColor;

        Modules.UserDAO.updateUsersById(data._id, {color: userColor});

      }

      var userObject = require('./User.js');
      connection.user = new userObject(this);
      connection.user.username = data.username;
      connection.user.password = data.password;
      connection.user.preferredLanguage = data.preferredLanguage;
      connection.user.color = data.color;
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

/**
 * 
 * @function setUserPreferredLanguage
 * @param {type} socketOrUser
 * @param {type} lang
 * @returns {undefined}
 */
UserManager.setUserPreferredLanguage = function (socketOrUser, lang) {
  if (typeof socketOrUser.id == 'string')
    var userID = socketOrUser.id;
  else
    var userID = socketOrUser;
  Modules.UserDAO.usersByUserName(UserManager.connections[userID].user.username, function (err, users) {
    if (err || users.length == 0) {
      return;
    }
    Modules.UserDAO.updateUsersById(users[0]._id, {preferredLanguage: lang});
  });
};

UserManager.setUserPreferredLanguage.public = true;

/**
 * 
 * @function enterPaperWriter
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.enterPaperWriter = function (socketOrUser, data, responseID) {
  //  Syntax            Type # Name # X # Y # Width # Amount of Attributes # Att_i;value
  var shouldInclude = [PAPER_WRITER + "#Writer#20#200#700#2#locked;true#paper;" + data.roomID,
    "SimpleText#WritingAreaInfo#20#145#100#2#height;30#content;Writing Area:",
    "SimpleText#ViewerInfo#800#145#100#2#height;30#content;Viewing Area:",
    "Viewer#Viewer#800#200#600#0#",
    "ReferenceContainer#References#800#800#600#2#locked;true#height;455",
    "Textarea#InfoBox#20#800#700#2#height;100#content;For your information: \nYou can use the magnifier to choose a chapter that is shown within the" +
            "writing area. Sort the chapters from left to right to create a order.",
    "PaperSelector#Selector#220#45#128#0#"];
  UserManager.loadRoomWithDefaultInventory(socketOrUser, data, responseID, shouldInclude);
};

/**
 * 
 * @function loadRoomWithDefaultInventory
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @param {type} shouldInclude
 * @returns {undefined}
 */
UserManager.loadRoomWithDefaultInventory = function (socketOrUser, data, responseID, shouldInclude) {
  UserManager.enterRoom(socketOrUser, data, responseID);
  var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;
  var context = UserManager.connections[userID];

  Modules.ObjectManager.getObjects(data.roomID, context, function (inventory) {

    shouldInclude.forEach(function (item) {
      var token = item.split('#');

      var oType = token[0];
      var oName = token[1];
      var oX = token[2];
      var oY = token[3];
      var oWidth = token[4];
      var oAttsL = token[5];
      var oAtts = [];
      var oHeight = -1;
      var oContent = "ERROR - Content not defined";

      var additionalAtts = [];
      for (var i = 6; i < oAttsL + 6 - 1; i++) {
        if (typeof token[i] != 'undefined') {
          var attToken = token[i].split(';');

          var attName = attToken[0];
          var attValue = attToken[1];

          if (attName.indexOf('content') > -1) {
            oContent = attValue;
          } else if (attName.indexOf('height') > -1) {
            oHeight = attValue;
          } else {
            additionalAtts.push(attName + ";" + attValue);
          }
        }
      }

      var attr;
      if (oHeight == -1) {
        attr = {x: oX, y: oY, width: oWidth, name: oName, paper: data.roomID};
      } else {
        attr = {x: oX, y: oY, width: oWidth, height: oHeight, name: oName, paper: data.roomID};
      }

      var found = false;
      /* it it already there? */
      for (var aux in inventory) {
        var obj = inventory[aux];

        if (obj.getAttribute('name').indexOf(oName) > -1) {
          found = true;
        }
      }

      /* if not found: create it */
      if (!found) {
        Modules.ObjectManager.createObject(data.roomID, oType, attr, oContent, context, function (error, obj, addAtts) {

          if (typeof addAtts != 'undefined') {
            addAtts.forEach(function (item) {

              if (typeof item != 'undefined') {
                var attToken2 = item.split(';');

                var attName2 = attToken2[0];
                var attValue2 = attToken2[1];

                obj.setAttribute(attName2, attValue2);
              }
            });
          }

        }, additionalAtts);
      }
    });

  });
};

/**
 * 
 * @function enterPublicSpace
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.enterPublicSpace = function (socketOrUser, data, responseID) {
  UserManager.loadRoomWithDefaultInventory(socketOrUser, data, responseID, []);
};

/**
 * 
 * @function enterPrivateSpace
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.enterPrivateSpace = function (socketOrUser, data, responseID) {
  //  Syntax            Type # Name # X # Y # Width # Amount of Attributes # Att_i;value
  var shouldInclude = ["Textarea#PublicSpaceInfo#20#45#100#1#content;This is the private space of user " +
            UserManager.getConnectionBySocket(socketOrUser).user.username];

  UserManager.loadRoomWithDefaultInventory(socketOrUser, data, responseID, shouldInclude);
};

/**
 * 
 * @function setDataOfSpaceWithDestServerSide
 * @param {type} data
 * @returns {undefined}
 */
UserManager.setDataOfSpaceWithDestServerSide = function (data) {
  var ss = db.get('SpaceStorage');

  // if data is not included: store it
  ss.update({// query
    'destination': String(data.destination), 'key': String(data.key)
  },
  {// update
    $set: {
      'value': data.value
    }
  },
  {// options
    upsert: true
  });
};

/**
 * 
 * @function getDataOfSpaceWithDestServerSide
 * @param {type} data
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getDataOfSpaceWithDestServerSide = function (data, callback) {
  var ss = db.get('SpaceStorage');

  ss.find({'destination': String(data.destination), 'key': String(data.key)}, {}, function (e, docs) {
    if (typeof docs != 'undefined' && docs.length > 0) {
      callback(docs);
    } else {
      callback("error");
    }
  });
};

/**
 * 
 * @function setDataOfSpaceWithDest
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.setDataOfSpaceWithDest = function (socketOrUser, data, responseID) {
  UserManager.setDataOfSpaceWithDestServerSide.call(this, data);
};

/**
 * 
 * @function removeDataOfSpaceWithDest
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.removeDataOfSpaceWithDest = function (socketOrUser, data, responseID) {
  var ss = db.get('SpaceStorage');

  ss.remove({'destination': data.destination, 'key': data.key});
};

/**
 * 
 * @function removeDataOfSpaceWithDestServerSide
 * @param {type} data
 * @returns {undefined}
 */
UserManager.removeDataOfSpaceWithDestServerSide = function (data) {
  var ss = db.get('SpaceStorage');

  ss.remove({'destination': data.destination, 'key': data.key});
};

/**
 * 
 * @function getDataOfSpaceWithDest
 * @param {type} socketOrUser
 * @param {type} data
 * @param {type} responseID
 * @returns {undefined}
 */
UserManager.getDataOfSpaceWithDest = function (socketOrUser, data, responseID) {
  var ss = db.get('SpaceStorage');
  ss.find({'destination': data.destination, 'key': data.key}, {}, function (e, docs) {
    if (typeof docs != 'undefined' && docs.length > 0) {
      Modules.SocketServer.sendToSocket(socketOrUser, "umGetDataOfSpaceWithDest" + data.destination + data.key, docs);
    } else {
      Modules.SocketServer.sendToSocket(socketOrUser, "umGetDataOfSpaceWithDest" + data.destination + data.key, 'error');
    }
  });
};

/**
 * Let a user enter a room with a specific roomID
 * 
 * @function enterRoom
 * @param {Object} socketOrUser The user.
 * @param {Object} data The received data.
 * @param {Object} responseID response ID.
 **/
UserManager.enterRoom = function (socketOrUser, data, responseID) {
  var userID = (typeof socketOrUser.id == 'string') ? socketOrUser.id : socketOrUser;
  var index = (data.index === undefined) ? 'left' : data.index;

  var roomID = data.roomID;

  var connection = UserManager.connections[userID];
  var ObjectManager = Modules.ObjectManager;

  // oldrooom is sent down to the connector, which may use it for parent
  // creation
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
  connector.mayEnter(roomID, connection, function (err, mayEnter) {

    // if the connector responds true, the client is informed about the
    // successful entering of the room
    // and all clients in the same rooms get new awarenessData.
    if (mayEnter) {

      ObjectManager.getRoom(roomID, connection, function (room) {
        connection.rooms[index] = room;
        Modules.RoomController.sendRoom(socket, room.id);
        socketServer.sendToSocket(socket, 'entered', room.id);
        UserManager.sendAwarenessData(room.id);
      }, oldRoomId);

      //ObjectManager.sendChatMessages(roomID,socket);

      Modules.Dispatcher.respond(socket, responseID, false);
      Modules.EventBus.emit("room::" + roomID + "::userEntered", {
        username: connection.user.username
      });

    } else {
      socketServer.sendToSocket(socket, 'error', 'User ' + user.username + ' may not enter ' + roomID);
      Modules.Dispatcher.respond(socket, responseID, true);
    }

  });
};

/**
 * Let a user leave a room with a specific roomID
 * 
 * @function leaveRoom
 * @param {Object} socket The socket of the client.
 * @param {Object} data The received data.
 * @param {Object} responseID response ID.
 */
UserManager.leaveRoom = function (socket, data, responseID) {
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
 * @function getAwarenessData
 * @param {Object} roomID The id of the room.
 * @param {Object} connections ???.
 **/
UserManager.getAwarenessData = function (roomID, connections) {
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
 * @function sendAwarenessData
 * @param {Object} roomID The id of the room.
 **/
UserManager.sendAwarenessData = function (roomID) {
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
 * @function getConnectionsForRoom
 * @param {Object} roomID The id of the room.
 * @return {Object} the connections of the room
 **/
UserManager.getConnectionsForRoom = function (roomID) {
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
 * @function getConnectionBySocket
 * @param {Object} socket The specified socket
 * @return {boolean} The connections
 **/
UserManager.getConnectionBySocket = function (socket) {
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
 * @function getConnectionBySocketID
 * @param {Object} socketID The specified id of a socket
 * @return {boolean} The connections
 **/
UserManager.getConnectionBySocketID = function (socketID) {
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
 * @function getConnectionByUserHash
 * @param {Object} userHash The specified userHash
 * @return {boolean} The connections
 **/
UserManager.getConnectionByUserHash = function (userHash) {
  for (var i in this.connections) {
    var connection = this.connections[i];
    if (connection.user.hash == userHash)
      return connection;
  }

  return false;
};

/**
 * 
 * @function isManager
 * @param {type} socket
 * @param {type} data
 * @returns {undefined}
 */
UserManager.isManager = function (socket, data) {
  var that = UserManager;
  var connection = that.getConnectionBySocket(socket);

  var collection = db.get('roles');

  collection.find({objectid: String(data.object.id)}, {}, function (e, docs) {
    docs.forEach(function (doc) {
      if (doc.name == "Manager") {

        var found = false;
        doc.users.forEach(function (u) {
          if (connection.user.username == u)
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
 * The function can be used to check wheter a user is valid (exists) or not
 *  
 * @function isValidUser
 * @param {Object} socket  Socket connection
 * @param {Object} data    Send data
 * @param {Sring} responseID  RespondId of the request
 */
UserManager.isValidUser = function (socket, data, responseID) {
  Modules.UserDAO.usersByUserName(data.user, function (err, docs) {
    var valid = (!err && docs.length > 0);

    Modules.SocketServer.respondToSocket(socket, responseID, valid);
  });
};

/**
 * Returns all users who are not assigned to the given object and role yet.
 * 
 * @function getMissingUsers
 * @param {type} object
 * @param {type} role
 * @param {type} callback
 * @returns {undefined}
 */
UserManager.getMissingUsers = function (object, role, callback) {
  var dataObject = Modules.RightManager.mapObject(object);

  var dbRoles = db.get('roles');
  var dbUsers = db.get('users');

  dbUsers.find({}, {}, function (e, userDocuments) {
    dbRoles.find({objectid: String(dataObject.id), name: String(role.name)}, {}, function (e, roleDocuments) {
      var result = (roleDocuments && roleDocuments.length > 0 ? roleDocuments[0].users : []);
      callback({allUsers: userDocuments, alreadyAddedUsers: result});
    });
  });
};

/**
 * 
 * @function loggedInInfo
 * @returns {undefined}
 */
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