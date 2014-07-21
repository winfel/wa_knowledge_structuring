/**
* @classdes Contains room related tasks
* @class RoomController
* @requires Node.js/lodash
* @requires Node.js/Connector
* @requires ./ObjectManager
* @requires ./UserManager
* @requires ./SocketServer
*/

var _ = require('lodash');

var RoomController = {};

var Modules = false;

/**
* @function init
* @param theModules
*/
RoomController.init = function (theModules) {
    Modules = theModules;
};
/**
* @function getCommunicationChannel
* @param data
* @param context
* @param {Function} callback The callback function for successful requests
*/
RoomController.getCommunicationChannel = function(data, context, callback){
    var from = data.from;
    var to = data.to;

    var roomName = "communication_" + from + "_" + to;

    var cb = function(){
        callback(null, roomName)
    };

    Modules.Connector.getRoomData(roomName, context, cb);
};

//TODO: should be implemented on Connector lvl. because it may be different
/**
* @function createRoom
* @param data
* @param context
* @param {Function} callback The callback function for successful requests
*/
RoomController.createRoom = function (data, context, callback) {

    var roomID = data.roomID;

    var obj = {};
    obj.id = roomID;
    obj.name = roomID;

    //create callback with first parameter always null (otherwise would throw
    //error
    var cb = _.partial(callback, null);

    Modules.Connector.saveObjectData(roomID, roomID, obj, cb, context, true)

};

//TODO: should be implemented on Connector lvl. because it may be different
/**
* @function roomExists
* @param data
* @param context
* @param {Function} callback The callback function for successful requests
*/
RoomController.roomExists = function (data, context, callback) {
    var roomID = data.roomID;
    var obj= Modules.Connector.getObjectDataByFile(roomID,roomID);

    callback(null, !!obj);
};
/**
* @function duplicateRoom
* @param data
* @param context
* @param {Function} callback The callback function for successful requests
*/
RoomController.duplicateRoom = function (data, context, callback) {
    var roomID = data.fromRoom;
    var newRoomID = data.toRoom;
    var parent = data.parentRoom;
    var roomName = data.roomName;

    //TODO: it is really ugly that getRoomData is used to create a room
    //If parent is set.
    //Create subroom item in parent.
    if (parent) {
        Modules.Connector.getRoomData(newRoomID, context, undefined, parent); //TODO: set parent if necessary
        //TODO add subroom object to parent

        //Subroom item
        var subRoomItemData = {
            roomID: parent,
            type: "Subroom",
            attributes: {
                name: roomName || newRoomID,
                destination: newRoomID
            }
        };
    } else {
        Modules.Connector.getRoomData(newRoomID, context, undefined); //TODO: set parent if necessary
    }

    var requestData = {
        objects: "ALL",
        fromRoom: roomID,
        toRoom: newRoomID
    };
    Modules.ObjectManager.duplicateNew(requestData, context, callback);
};


//TODO: remove? combine with "browse" of exit object
/**
* @function listRooms
* @param {Function} callback The callback function for successful requests
*/
RoomController.listRooms = function (callback) {
    Modules.Connector.listRooms(callback);
};

//Information are sent to all clients in the same room
/**
* @function informAllInRoom
* @param data
* @param {Function} callback The callback function for successful requests
*/
RoomController.informAllInRoom = function (data, callback) {

    var connections = Modules.UserManager.getConnectionsForRoom(data.room);

    for (var i in connections) {
        var socket = connections[i].socket;
        Modules.SocketServer.sendToSocket(socket, 'inform', data);
    }
};

/**
* sends a rooms content to a client (given by its socket)
*    @function sendRoom
*	 @param socket
*    @param roomID
* TODO: there should be no socket! We are inside of a controller
*/
RoomController.sendRoom = function (socket, roomID) {
    var context = Modules.UserManager.getConnectionBySocket(socket);
	
    Modules.ObjectManager.getRoom(roomID, context, function (room) { //the room object

        room.updateClient(socket); // and send it to the client

        Modules.ObjectManager.getInventory(roomID, context, function (objects) {
            for (var i in objects) {
                var object = objects[i];
                object.updateClient(socket, 'objectUpdate'); // the object data
                
                if (object.hasContent()) { // and its content if there is some
                    object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
                }
            }

        });

    });

};


module.exports = RoomController;

