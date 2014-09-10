// This is the CLIENT side RightManager

"use strict";

/**
 * Object providing functions for object management
 */
var RightManager = new function() {
  var that = this;
  var Dispatcher = null;

  var supportedObjects = new Array();
  var rights = {};
  var rightObjects = {};

  var listener = {};

  /**
   * This function initializes the RightManager object.
   * 
   * @function init
   * @param {type} theModules   All available modules...
   */
  this.init = function(theModules) {
    Dispatcher = theModules.Dispatcher;

    Dispatcher.registerCall("rmSupportedObjects", function(data) {
      supportedObjects = data.sort();
    });

    Modules.SocketClient.serverCall('rmGetSupportedObjects');

    Dispatcher.registerCall("rmModifiedRole", function(data) {
      try {
        // Iterate over all listeners...
        for (var i = 0; i < listener["rolechange"].length; i++)
          listener["rolechange"][i](data);
      } catch (e) {
        // No listener...
      }
    });

    Dispatcher.registerCall("rmModifiedUser", function(data) {
      try {
        // Iterate over all listeners...
        for (var i = 0; i < listener["userchange"].length; i++)
          listener["userchange"][i](data);
      } catch (e) {
        // No listener...
      }
    });

    Dispatcher.registerCall("rmModifiedAccess", function(data) {
      try {
        // Iterate over all listeners...
        for (var i = 0; i < listener["rightchange"].length; i++)
          listener["rightchange"][i](data);
      } catch (e) {
        // No listener...
      }
    });
  };

  /**
   * Registers a listener. Very simple...
   * 
   * @function listen
   * @param {type} event      The event to listen for.
   * @param {type} callback   The function to execute.
   */
  this.listen = function(event, callback) {
    if (!listener[event])
      listener[event] = new Array();

    listener[event].push(callback);
  };

  /**
   * Reduces an object to its most important attributes.
   * 
   * For a subroom the destination is also crucial!
   * 
   * @function reduceObject
   * @param {type} object
   * @returns {undefined}
   */
  this.reduceObject = function(object) {
    var dataObject = {id: object.id, type: object.type};
    if (object.getAttribute && object.getAttribute("destination"))
      dataObject.destination = object.getAttribute("destination");

    // This is a special case for the tabs, which are stored in a cache...
    // Those cache items do not have a type, but a dest variable.
    if (!object.type && object.dest) {
      dataObject.type = "Subroom";
      dataObject.destination = object.dest;
    }

    return dataObject;
  };

  /**
   * Registers a right for an object.
   * 
   * @function registerRight
   * @param {type} object
   * @param {type} name
   * @param {type} comment
   * @returns {undefined}
   */
  this.registerRight = function(object, name, comment) {
    var dataObject = this.reduceObject(object);
    var rightObject = {name: name, comment: comment};

    if (rights[dataObject.type]) {
      if (rights[dataObject.type].indexOf(name) < 0) {
        rights[dataObject.type].push(name);
        rightObjects[dataObject.type].push(rightObject);
      }
    } else {
      rights[dataObject.type] = new Array(name);
      rightObjects[dataObject.type] = new Array(rightObject);
    }
  };

  /**
   * Checks whether the right manager supports the given object or not.
   * 
   * @function supports
   * @param object
   * @returns {Boolean}
   */
  this.supports = function(object) {
    var dataObject = this.reduceObject(object);

    return supportedObjects.indexOf(dataObject.type) >= 0;
  };

  /**
   * Returns the names of the supported objects.
   * 
   * @function getSupportedObjects
   * @returns {Array}
   */
  this.getSupportedObjects = function() {
    return supportedObjects;
  };

  /**
   * Returns the available rights for the current data object.
   * 
   * @function getAvailableRights
   * @param {type}	object    The object that needs to be checked
   * @returns {Array}
   */
  this.getAvailableRights = function(object) {
    var dataObject = this.reduceObject(object);
    return rightObjects[dataObject.type] || [];
  };

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@function hasAccess
   *	@param {type}	object    The object that needs to be checked
   *	@param {type} right     The right that needs to be checked. E.g., read, write (CRUD)
   *	@param {type} callback  The callback function that uses the result.
   */
  this.hasAccess = function(object, right, callback) {
    var dataObject = this.reduceObject(object);

    Dispatcher.registerCall("rmHasAccessResult" + dataObject.id, function(data) {
      // call the callback
      callback(data);
      // deregister
      Dispatcher.removeCall("rmHasAccessResult" + dataObject.id);
    });

    Modules.SocketClient.serverCall('rmHasAccess', {
      'right': right,
      'object': dataObject
    });
  };

  /**
   * The function can be used to grant access rights
   * 
   * @function grantAccess
   * @param {type}	object    The object that should be used to change the access right
   * @param {type}	right     The used command (access right), e.g., read, write (CRUD)
   * @param {type} role      The role that should be changed
   */
  this.grantAccess = function(object, right, role) {
    this.modifyAccess(object, right, role, true);
  };

  /**
   * The function can be used to revoke access rights
   * 
   * @function revokeAccess
   * @param {type}	object    The object that should be used to change the access right
   * @param {type}	right     The used command (access right), e.g., read, write (CRUD)
   * @param {type}  role      The role that should be changed
   */
  this.revokeAccess = function(object, right, role) {
    this.modifyAccess(object, right, role, false);
  };

  /**
   * The function can be used to modify access rights
   *	
   * @function modifyAccess
   * @param {type}	object    The object that should be used to change the access right
   * @param {type}	right     The used command (access right), e.g., read, write (CRUD)
   * @param {type} role       The role that should be changed
   * @param {type} grant      The grant paramter is set to true, if the access right should be
   *                          granted. Set false, to revoke access.
   *	A call could look like this: modifyAccess("AB", "read", "reviewer", true);
   */
  this.modifyAccess = function(object, right, role, grant) {
    var dataObject = this.reduceObject(object);

    Modules.SocketClient.serverCall('rmModifyAccess', {
      'object': dataObject,
      'right': right,
      'role': role,
      'grant': grant
    });
  };

  /**
   * Returns the available roles for the current data object.
   * 
   * @function getRoles
   * @param {type} object    The object that needs to be checked
   * @param {type} callback
   */
  this.getRoles = function(object, callback) {
    var dataObject = this.reduceObject(object);

    Dispatcher.registerCall("rmRoles" + dataObject.id, function(data) {
      // Sort rights and users.
      for (var i = 0; i < data.length; i++) {
        data[i].rights = data[i].rights.sort();
        data[i].users = data[i].users.sort();
      }

      // Finally sort the roles and pass it to the callback.
      callback(data.sort(function(a, b) {
        return a.name > b.name;
      }));
      Dispatcher.removeCall("rmRoles" + dataObject.id);
    });

    Modules.SocketClient.serverCall('rmGetRoles', {
      'object': dataObject
    });
  };

  /**
   * This function can be used to add a user to a certain role.
   * 
   * @function addUser
   * @param {type} object   The object where the role is stored.
   * @param {type} user     The user to add.
   * @param {type} role     The role to modify.
   * @returns {undefined}
   */
  this.addUser = function(object, user, role) {
    this.modifyUser(object, user, role, true);
  };

  /**
   * This function can be used to remove a user from a certain role.
   * 
   * @function removeUser
   * @param {type} object   The object where the role is stored.
   * @param {type} user     The user to remove.
   * @param {type} role     The role to modify.
   * @returns {undefined}
   */
  this.removeUser = function(object, user, role) {
    this.modifyUser(object, user, role, false);
  };

  /**
   * This function modifies the users of a certain role.
   * 
   * @function modifyUser
   * @param {type} object   The object where the role is stored.
   * @param {type} user     The user to add or remove.
   * @param {type} role     The role to modify.
   * @param {type} add      The add paramter is set to true, if the user should be
   *                        added. Set false, to remove the user. If omitted: true.
   * @returns {undefined}
   */
  this.modifyUser = function(object, user, role, add) {
    var dataObject = this.reduceObject(object);

    if (add == undefined)
      add = true;

    Modules.SocketClient.serverCall('rmModifyUser', {
      'object': dataObject,
      'user': user,
      'role': role,
      'add': add
    });
  };

  /**
   * This function modifies the roles of a certain object.
   * 
   * @function modifyRole
   * @param {type} object     The object where the role is stored.
   * @param {type} rolename   The role name.
   * @param {type} add        The add paramter is set to true, if the user should be
   *                          added. Set false, to remove the user. If omitted: true.
   * @param {type} deletable  
   */
  this.modifyRole = function(object, rolename, add, deletable) {
    var dataObject = this.reduceObject(object);

    if (add == undefined)
      add = true;

    if (deletable == undefined)
      deletable = true;

    Modules.SocketClient.serverCall('rmModifyRole', {
      'object': dataObject,
      'rolename': rolename,
      'add': add,
      'deletable': true
    });
  };
};
