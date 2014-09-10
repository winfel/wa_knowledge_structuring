/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *	 GeneralObject client component
 *
 */

GeneralObject.content = false;
GeneralObject.contentFetched = false;
GeneralObject.hasContent = false;
GeneralObject.normalOpacity = 1;

/**
 * @function setContent
 * @param content
 */
GeneralObject.setContent = function(content) {
  this.content = content;
  this.contentFetched = true;

  this.serverCall('setContent', content, this.afterSetContent);
};

/**
 * Call RPC-Method on server-side. Could be called like:
 *
 * this.serverCall("rpcMethod", arg1, arg2, arg3, ..., optionalCallback)
 * 
 * @param{...mixed} - 
 * 		remoteFnName : Name of the function that should be called
 * 		...args :  arbitrary number of arguments
 * 		callback: if the last element is a function, it is used as a callback. 
 */
GeneralObject.serverCall = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = false;

  //Look if last element is function 
  //don't use pop directly, because function
  //can be called without callback.
  var lastArg = args[args.length - 1];
  if (_.isFunction(lastArg)) {
    callback = lastArg;
    args.pop();
  }

  //check if all needed arguments are present
  //and of right type
  var remoteFnName = args.shift();

  if (remoteFnName === undefined)
    throw "Function name is missing.";
  if (remoteFnName && !_.isString(remoteFnName))
    throw "Function names can be strings only.";

  var remoteCall = {
    roomID: this.getRoomID(),
    objectID: this.getId(),
    fn: {
      name: remoteFnName,
      params: args
    }
  };

  if (callback)
    Modules.Dispatcher.query('serverCall', remoteCall, callback);
  else
    Modules.Dispatcher.query('serverCall', remoteCall);

};

/**
 * @function fetchContent
 * @param worker
 * @param forced
 */
GeneralObject.fetchContent = function(worker, forced) {

  if (this.contentURLOnly)
    return;

  if (!worker)
    worker = function(data) {
      //console.log(data);
    };

  if (this.contentFetched && forced !== true) {
    worker(this.content);
    return;
  }

  var that = this;
  //Do not use "this" in response fucntions as they do not refer to the object in there!

  var functionLoadedCallback = function(newContent) {
    that.content = newContent;
    that.contentFetched = true;
    worker(newContent);
    return;
  };

  this.serverCall('getContent', functionLoadedCallback);
};

/**
 * @function getContentAsString
 * @return {undefined}
 */
GeneralObject.getContentAsString = function(callback) {
  if (callback === undefined) {
    if (!this.contentFetched) {
      alert('Synchronous content access before it has been fetched! Inform the programmer about this issue!');
      return false;
    }
    return GeneralObject.utf8.parse(this.content);
  } else {
    this.fetchContent(function(content) {
      callback(GeneralObject.utf8.parse(content));
    });
  }
};

/**
 * @function getContentAsString
 * @return {Boolean}
 */
GeneralObject.hasContent = function() {
  return this.getAttribute('hasContent');
};

/**
 * @function contentUpdated
 */
GeneralObject.contentUpdated = function() {
  var that = this;
  this.contentFetched = false;
  this.fetchContent(function() {
    that.draw();
  }, true);
};



/**
 * Triggered by non local change of values
 * @function refresh
 */
GeneralObject.refresh = function() {

  //do not trigger a draw if the refreshed object is the room object
  if (this.id == this.getAttribute('inRoom'))
    return;

  if (this.moving)
    return;
  this.draw(true);
};

/**
 * @function getPreviewContentURL
 * @return {String}
 */
GeneralObject.getPreviewContentURL = function() {
  return "/getPreviewContent/" + this.getRoomID() + "/" + this.id + "/" + this.getAttribute('contentAge') + "/" + ObjectManager.userHash;
};

/**
 * @function getContentURL
 * @return {String}
 */
GeneralObject.getContentURL = function() {
  return "/getContent/" + this.getRoomID() + "/" + this.id + "/" + this.getAttribute('contentAge') + "/" + ObjectManager.userHash;
};

/**
 * @function create
 * @param atrributes
 */
GeneralObject.create = function(attributes) {

  if (attributes === undefined) {
    var attributes = {
    };
  } else {

  }

  ObjectManager.createObject(this.type, attributes);

};

/**
 * @function removeRepresentation
 */
GeneralObject.removeRepresentation = function() {

  var rep = this.getRepresentation();

  this.deselect();

  $(rep).remove();

};

/**
 * @function getIconPath
 * @return {String}
 */
GeneralObject.getIconPath = function() {
  return "/objectIcons/" + this.getType();
};

/**
 * @function justCreated
 */
GeneralObject.justCreated = function() {
  //react on client side if an object has just been created and needs further input
  GUI.rightmanagerDialog.show(this);
};

/**
 * @function getRoom
 * @return {undefined}
 */
GeneralObject.getRoom = function() {
  return Modules.ObjectManager.getCurrentRoom();
};

/**
 * @function getCurrentUserName
 * @return {undefined}
 */
GeneralObject.getCurrentUserName = function() {
  return Modules.ObjectManager.getUser().username;
};

/**
 *	Determine if the current object intersects with the square x,y,width,height
 * @function boxInsersectsWith
 * @param otherx
 * @param othery
 * @param otherwidth
 * @param otherheight
 * return {Boolean}
 */
GeneralObject.boxIntersectsWith = function(otherx, othery, otherwidth, otherheight) {
  if (!this.isGraphical)
    return false;

  var thisx = this.getViewBoundingBoxX();
  var thisy = this.getViewBoundingBoxY();
  var thisw = this.getViewBoundingBoxWidth();
  var thish = this.getViewBoundingBoxHeight();

  if (otherx + otherwidth < thisx)
    return false;
  if (otherx > thisx + thisw)
    return false;
  if (othery + otherheight < thisy)
    return false;
  if (othery > thisy + thish)
    return false;

  return true;

};

/**
 * Determine if the current object intersects with oanother object
 * @function intersectsWith
 * @param other
 * @return {Boolean}
 */
GeneralObject.intersectsWith = function(other) {
  var otherx = other.getViewBoundingBoxX();
  var othery = other.getViewBoundingBoxY();
  var otherw = other.getViewBoundingBoxWidth();
  var otherh = other.getViewBoundingBoxHeight();

  return this.boxIntersectsWith(otherx, othery, otherw, otherh);

};

/**
 * @function hasPixelAt
 * @param x
 * @param y
 * @return {Boolean}
 */
GeneralObject.hasPixelAt = function(x, y) {

  //assume, that the GeneralObject is full of pixels.
  //override this if you can determine better, where there
  //object is nontransparent

  return this.boxIntersectsWith(x, y, 0, 0);
};

GeneralObject.hasPixelAt = function(x, y) {

  //assume, that the GeneralObject is full of pixels.
  //override this if you can determine better, where there
  //object is nontransparent

  return this.boxIntersectsWith(x, y, 0, 0);
};

/**
 *	The function passes a boolean value to the callback
 *	that represents if the current user has the right 
 *	to perform a specific command or not.
 * 
 * @param {type} right
 * @param {type} callback
 * @returns {undefined}
 */
GeneralObject.hasAccess = function(right, callback) {
  Modules.RightManager.hasAccess(this, right, callback);
};

GeneralObject.boxContainsPoint = GeneralObject.hasPixelAt;
