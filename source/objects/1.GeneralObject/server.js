/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *	 GeneralObject server component
 *
 */

"use strict";

// The server side defintion of the object extends the common parts

var theObject = Object.create(require('./common.js'));

// The Modules variable provides access to server modules such as
// Module.ObjectManager

var Modules = require('../../server.js');
var _ = require('lodash');

var RightManager = Modules.RightManager;

// Make the object public
module.exports = theObject;


// ****************************************************************
// * MAKE SENSITIVE ***********************************************
// ****************************************************************

/**
* @function makeSensitive
*/
theObject.makeSensitive = function() {
  this.isSensitiveFlag = true;

  var theObject = this;

  this.onObjectMove = function(changeData) {
    //complete data

    var oldData = {};
    var newData = {};
    var fields = ['x', 'y', 'width', 'height'];

    for (var i = 0; i < 4; i++) {
      var field = fields[i];
      oldData[field] = changeData['old'][field] || this.getAttribute(field);
      newData[field] = changeData['new'][field] || this.getAttribute(field);
    }

    var self = this;
    this.getRoom(function (room) {
        room.getInventoryAsync(function(inventory) {
            
            for (var i in inventory) {
                var object = inventory[i];

                if (object.id == self.id) {
                  continue;
                }

                var bbox = object.getBoundingBox();

                // determine intersections
                var oldIntersects = self.bBoxIntersects(oldData.x, oldData.y, oldData.width, oldData.height, bbox.x, bbox.y, bbox.width, bbox.height);
                var newIntersects = self.bBoxIntersects(newData.x, newData.y, newData.width, newData.height, bbox.x, bbox.y, bbox.width, bbox.height);

                // handle move
                if (oldIntersects && newIntersects)   self.onMoveWithin(object, newData);
                if (!oldIntersects && !newIntersects) self.onMoveOutside(object, newData);
                if (oldIntersects && !newIntersects)  self.onLeave(object, newData);
                if (!oldIntersects && newIntersects)  self.onEnter(object, newData);
              }     
        });
    });
  }

  /**
  * function bBoxIntersects
  * @param thisX
  * @param thisY
  * @param thisWidth
  * @param thisHeight
  * @param otherX
  * @param otherY
  * @param otherWidth
  * @param otherHeight
  */
  theObject.bBoxIntersects = function(thisX, thisY, thisWidth, thisHeight, otherX, otherY, otherWidth, otherHeight) {

    if ((otherX + otherWidth) < thisX) {
      //console.log('too far left');
      return false;
    }
    if ((otherY + otherHeight) < thisY) {
      //console.log('too far up');
      return false;
    }
    if (otherX > (thisX + thisWidth)) {
      //console.log('too far right');
      return false;
    }
    if (otherY > (thisY + thisHeight)) {
      //console.log('too far bottom');
      return false;
    }

    //console.log('intersects');
    return true;

  }

  /**
   *	Determines, if this Active object intersects another object.
   *	In this simple implementation, this is done by bounding box comparison.
   * @function intersects
   * @param otherX
   * @param otherY
   * @param otherWidth
   * @param otherHeight
   * @return {boolean}
   **/
  theObject.intersects = function(otherX, otherY, otherWidth, otherHeight) {

    if (typeof otherX == 'object') {
      var other = otherX.getBoundingBox();
      otherX = other.x;
      otherY = other.y;
      otherWidth = other.width;
      otherHeight = other.height;
    }

    var bbox = this.getBoundingBox();

    return this.bBoxIntersects(bbox.x, bbox.y, bbox.width, bbox.height, otherX, otherY, otherWidth, otherHeight);

  }
  /**
   *  Get an array of all overlapping objects
   *	@function getOverlappingObjects
   *  return {undefined}
   *	
   **/
  theObject.getOverlappingObjects = function() {
    var result = [];

    var inventory = this.getRoom().getInventory();

    for (var i in inventory) {
      var test = inventory[i];
      if (test.id == this.id)
        continue;
      if (this.intersects(test)) {
        result.push(test);
      }
    }

    return result;
  }


  /**
   *	SensitiveObjects evaluate other objects in respect to themselves.
   *
   *  @function evaluateObject
   *	@param object The object that shall be evaluated
   *	@param changeData Old and new values of positioning (e.g. changeData.old.x) 
   *  @return {undefined}
   **/
  theObject.evaluateObject = function(object, changeData) {

    //complete data

    var oldData = {};
    var newData = {};
    var fields = ['x', 'y', 'width', 'height'];

    for (var i = 0; i < 4; i++) {
      var field = fields[i];
      oldData[field] = changeData['old'][field] || object.getAttribute(field);
      newData[field] = changeData['new'][field] || object.getAttribute(field);
    }

    //determine intersections

    var oldIntersects = this.intersects(oldData.x, oldData.y, oldData.width, oldData.height);
    var newIntersects = this.intersects(newData.x, newData.y, newData.width, newData.height);

    //handle move

    if (oldIntersects && newIntersects)
      return this.onMoveWithin(object, newData);
    if (!oldIntersects && !newIntersects)
      return this.onMoveOutside(object, newData);
    if (oldIntersects && !newIntersects)
      return this.onLeave(object, newData);
    if (!oldIntersects && newIntersects)
      return this.onEnter(object, newData);
  }

  if (!theObject.onMoveWithin)
    theObject.onMoveWithin = function(object, data) {

    };

  if (!theObject.onMoveOutside)
    theObject.onMoveOutside = function(object, data) {

    };

  if (!theObject.onLeave)
    theObject.onLeave = function(object, data) {

    };

  if (!theObject.onEnter)
    theObject.onEnter = function(object, data) {

    };

}


// ****************************************************************
// * MAKE STRUCTURING *********************************************
// ****************************************************************

/**
* @function makeStructuring
* @return {undefined}
*/
theObject.makeStructuring = function() {
  this.isStructuringFlag = true;
  this.makeSensitive();
  this.isSensitiveFlag = false;

  this.onObjectMove = function(changeData) {

    //when a structuring object is moved, every active object may be in need of repositioning

    console.log('onObjectMove on structuring object ' + this);

    this.getRoom().placeActiveObjects();
  }

  if (!this.getPositioningDataFor)
    this.getPositioningDataFor = function(activeObject) {

      var result = {reference: 'ignore'};

      //reference: must, mustnot, ignore
      //minX
      //maxX
      //minY
      //maxY

      return result;

    }

}



/**
 *
 *	all of the objects Attributes as key,value pairs.
 *	This may be different from actual object data
 *	as evaluations may be involved
 * @function getAttributeSet
 * @return {AttributeSet}
 */
theObject.getAttributeSet = function() {
  return Modules.AttributeManager.getAttributeSet(this);
}

/**
 *
 *send a message to a client (identified by its socket)
 * @function updateClient
 */
theObject.updateClient = function(socket, mode) {
    
  if (!mode) {
    mode = 'objectUpdate';
  }
  
  var object = this;
  process.nextTick(function() {
    var SocketServer = Modules.SocketServer;
    SocketServer.sendToSocket(socket, mode, object.getAttributeSet());
  });
}

/**
 *	
 *
 *	Call this whenever an object has changed. It is saved
 *	through the current connector, the evaluation is called
 *	and a message is sent to the clients
 * @function persist
 *
 */
theObject.persist = function() {
  var data = this.get();
  if (data) {
    Modules.Connector.saveObjectData(this.inRoom, this.id, data, false, this.context);
    this.updateClients();
  }
}

/**
 *	updateClients
 *
 *	Send an upadate message to all clients which are subscribed
 *	to the object's room
 * @function updateClients
 * @param mode
 */
theObject.updateClients = function(mode) {

  if (!mode) {
    mode = 'objectUpdate';
  }

  var connections = Modules.UserManager.getConnectionsForRoom(this.inRoom);

  for (var i in connections) {
    this.updateClient(connections[i].socket, mode);
  }

}

/**
 *	Determines, if the object has content or not
 * @function hasContent
 * @return {Boolean}
 */
theObject.hasContent = function() {
  return this.getAttribute('hasContent');
}

/**
 *
 *	Set a new content. If the content is base64 encoded png data,
 *	it is decoded first.
 * @function setContent
 * @param content
 * @param callback
 */
theObject.setContent = function(content, callback) {	
	var that = this;
	if ((typeof content) != "object" && content.substr(0, 22) == 'data:image/png;base64,') {
	
	var base64Data = content.replace(/^data:image\/png;base64,/, ""),
		content = new Buffer(base64Data, 'base64');
	}
	
	Modules.Connector.saveContent(this.inRoom, this.id, content, function(){
		that.set('hasContent', !!content);
		that.set('contentAge', new Date().getTime());

		//send object update to all listeners
		that.persist();
		that.updateClients('contentUpdate');
		if (callback) { callback(); }
	}, this.context, false);
}

theObject.setContent.public = true;
theObject.setContent.neededRights = {
  write: true
}

/**
* @function copyContentFromFile
* @param filename
* @param callback
*/
theObject.copyContentFromFile = function(filename, callback) {

  Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, this.context, callback);

  this.set('hasContent', true);
  this.set('contentAge', new Date().getTime());

  //send object update to all listeners
  this.persist();
  this.updateClients('contentUpdate');

}

/**
* @function getCurrentUserName
* @return {undefined}
*/
theObject.getCurrentUserName = function() {
    if (!this.context) {
      return 'root';
    }
  
    return this.context.user.username;
}

/**
 *  get the object's content
 *	@function getContent
 *  @param {function} callback
 */
theObject.getContent = function(callback) {
	if (!this.context) throw new Error('Missing context in GeneralObject.getContent');

	Modules.Connector.getContent(this.inRoom, this.id, this.context, callback);
}

theObject.getContent.public = true;
theObject.getContent.neededRights = {
  read: true
}

/**
* @function getContentAsString
* @param {function} callback
* @return {undefined}
*/
theObject.getContentAsString = function(callback) {
    if (_.isUndefined(callback)) throw new Error('Missing callback in GeneralObject.getContentAsString');
    
    this.getContent(function(content) {
        callback(GeneralObject.utf8.parse(content));
    });
}

/**
* @function getContentFromApplication
* @param applicationName
* @param callback
*/
theObject.getContentFromApplication = function(applicationName, callback) {
  var eventName = "applicationevent::" + applicationName + "::getContent"
  var event = {
    objectID: this.getID(),
    callback: callback
  }
  Modules.EventBus.emit(eventName, event);
}

/**
 * Get the object's inline preview
 * @function getInlinePreview
 * @param callback
 * @param mimeType
 *  @return {undefined}
 *
 */
theObject.getInlinePreview = function(callback, mimeType) {
  return Modules.Connector.getInlinePreview(this.inRoom, this.id, mimeType, this.context, callback);
}

/**
* @function getInlinePreviewMimeType
* @param {function} callback
*/
theObject.getInlinePreviewMimeType = function(callback) {
  Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


/**
* @function evaluatePosition
* @param key
* @param value
* @param oldvalue
*/
theObject.evaluatePosition = function(key, value, oldvalue) {

  if (this.runtimeData.evaluatePositionData === undefined) {
    this.runtimeData.evaluatePositionData = {};
    this.runtimeData.evaluatePositionData.old = {};
    this.runtimeData.evaluatePositionData.new = {};
  }

  if (this.runtimeData.evaluatePositionData.delay) {
    clearTimeout(this.runtimeData.evaluatePositionData.delay);
    this.runtimeData.evaluatePositionData.delay = false;
  }

  this.runtimeData.evaluatePositionData['new'][key] = value;
  if (!this.runtimeData.evaluatePositionData['old'][key]) {
    this.runtimeData.evaluatePositionData['old'][key] = oldvalue;
    //if there yet is a value here, we have concurrent modifications
  }

  var posData = this.runtimeData.evaluatePositionData;
  var self = this;

  //Within this time, we collect data for evaluation. This is important
  //as often data that logically belongs together is sent seperately

  var timerLength = 200;

  this.runtimeData.evaluatePositionData.delay = setTimeout(function() {

    var data = {};
    data.old = posData.old;
    data.new = posData.new;

    self.evaluatePositionInt(data);
    self.runtimeData.evaluatePositionData = undefined;
  }, timerLength);

}

/**
* @function evaluatePositionInt
* @param data
*/
theObject.evaluatePositionInt = function(data) {
    var self = this;
    this.getRoom(function (room) {
      
    if (!room) {
        return;
    }
    
    room.evaluatePositionFor(self, data); 
  });
}

/**
* @function getRoom
* @param {function} callback
*/
theObject.getRoom = function(callback) {
  if (callback == undefined) return console.warn("GeneralObject/server.js getRoom callback is undefined!!");
    
  if (!this.context) return callback(false);

  Modules.ObjectManager.getRoom(this.getAttribute('inRoom'), this.context, function(room) {
      if (room) callback(room);
      else callback(false);
  }, false); 
  
}

/**
* @function getBoundingBox
* @return {undefined}
*/
theObject.getBoundingBox = function() {

  var x = this.getAttribute('x');
  var y = this.getAttribute('y');
  var width = this.getAttribute('width');
  var height = this.getAttribute('height');
  return {'x': x, 'y': y, 'width': width, 'height': height};

}

/**
* @function fireEvent
* @param name
* @param data
*/
theObject.fireEvent = function(name, data) {
  data.context = this.context;

  Modules.EventBus.emit(name, data);
}

/**
 * 
 * @function hasAccess
 * @param {type} user     The user object. (Needs to have user.username)
 * @param {type} right
 * @param {type} callback
 * @returns {undefined}
 */
theObject.hasAccess = function(user, right, callback) {
  Modules.RightManager.hasAccess(this, user, right, callback);
};

theObject.fireEvent.public = true; //Function can be accessed by customObjectFunctionCall
