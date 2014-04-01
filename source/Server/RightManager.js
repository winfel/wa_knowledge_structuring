var db = require('monk')('localhost/WebArena');

var Modules = false;
var DEBUG_OF_RIGHTMANAGEMENT = false;

var fillWithDefaultRights = function() {
  /* one role per default - read only for all users */
  var pushRoles = ['PaperObject#writer#read,write,create',
    'PaperObject#reviewer#read,write'];

  /* push default roles */
  collection = db.get('defroles');
  pushRoles.forEach(function(item) {
    var token = item.split("#");

    var aObject = String(token[0]);
    var aName = String(token[1]);
    var someRights = String(token[2]).split(",");

    collection.find({object: String(aObject), name: String(aName)}, {}, function(e, docs) {
      if (typeof docs == 'undefined' || docs.length === 0) {
        collection.insert({
          object: aObject,
          name: aName,
          rights: someRights});
        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("pushing default object: " + String(aObject));
        }
      } else {
        console.log("default object " + aObject + " was already included");
      }
    });
  });

};

var fillCurrentDbWithLayer0CanvasData = function() {

  if (DEBUG_OF_RIGHTMANAGEMENT) {
    console.log("filling Layer 0 data");
  }

  /* minimal rights possible - CRUD */
  var pushRights = ['1#create', '2#read', '3#update', '4#delete'];

  /* no users per default */
  var pushUsers = [];

  /* one role per default - read only for all users */
  var pushRoles = ['0#0#CanvasLayer#read#overwrite#all'];

  /* push default rights */
  var collection = db.get('rights');
  pushRights.forEach(function(item) {
    var token = item.split("#");

    collection.find({id: String(token[0]), name: String(token[1])}, {}, function(e, docs) {
      if (typeof docs == 'undefined' || docs.length === 0) {
        collection.insert({id: String(token[0]), name: String(token[1])});

        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("pushing default right: " + String(token[1]));
        }
      } else {
        console.log("default right " + token[1] + " was already included");
      }
    });
  });

  /* push default users */
  collection = db.get('users');
  pushUsers.forEach(function(item) {
    var token = item.split("#");

    collection.find({username: String(token[0]), password: String(token[1])}, {}, function(e, docs) {
      if (docs.length === 0) {
        collection.insert({username: String(token[0]), password: String(token[1])});

        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("pushing default user: " + String(token[1]));
        }
      } else {
        console.log("default user " + token[1] + " was already included");
      }
    });
  });

  /* push default roles */
  collection = db.get('roles');
  pushRoles.forEach(function(item) {
    var token = item.split("#");

    var aID = String(token[0]);
    var aContextID = String(token[1]);
    var aName = String(token[2]);
    var someRights = String(token[3]).split(",");
    var aMode = String(token[4]);
    var someUser = String(token[5]).split(",");

    collection.find({name: String(aName), contextID: String(aContextID)}, {}, function(e, docs) {
      if (typeof docs == 'undefined' || docs.length === 0) {
        collection.insert({id: aID,
          contextID: aContextID,
          name: aName,
          rights: someRights,
          mode: aMode,
          users: someUser});
        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("pushing default role: " + String(aName));
        }
      } else {
        console.log("default role " + aName + " was already included");
      }
    });
  });
};

var fillCurrentDbWithTestData = function() {

  if (DEBUG_OF_RIGHTMANAGEMENT) {
    console.log("filling testdata");
  }

  var pushRights = ['Canvas#1#create#You may create something on the canvas',
    'Canvas#2#read#You may read something on the canvas',
    'Canvas#3#update#You may change something on the canvas',
    'Canvas#4#delete#You may delete something on the canvas',
    'PaperObject#5#read#You may read the selected PaperObject',
    'PaperObject#6#update#You may change the selected PaperObject',
    'PaperObject#7#delete#You may delete the selected PaperObject',
    'NumberCreator#8#create#You may create the selected NumberCreater and NumericObjects',
    'NumberCreator#9#update#You may drop something on the PaperObject PaperObject'];
  var pushUsers = ['joerg#12345', 'Vanessa#xyz'];
  var pushRoles = ['1#1#RandomGuys#create,read#overwrite#joerg,vanessa',
    '2#1#Boss#read#overwrite#vanessa'];

  /* clear tables */
  db.get('rights').drop();
  db.get('users').drop();
  db.get('roles').drop();

  /* push test rights */
  var collection = db.get('rights');
  pushRights.forEach(function(item) {
    var token = item.split("#");
    collection.insert({type: String(token[0]), id: String(token[1]), name: String(token[2]), comment: String(token[3])});

    if (DEBUG_OF_RIGHTMANAGEMENT) {
      console.log("pushing testright: " + String(token[1]));
    }
  });

  /* push test users */
  collection = db.get('users');
  pushUsers.forEach(function(item) {
    var token = item.split("#");
    collection.insert({username: String(token[0]), password: String(token[1])});

    if (DEBUG_OF_RIGHTMANAGEMENT) {
      console.log("pushing testuser: " + String(token[0]));
    }
  });

  /* push test roles */
  collection = db.get('roles');
  pushRoles.forEach(function(item) {
    var token = item.split("#");

    var aID = String(token[0]);
    var aContextID = String(token[1]);
    var aName = String(token[2]);
    var someRights = String(token[3]).split(",");
    var aMode = String(token[4]);
    var someUser = String(token[5]).split(",");

    collection.insert({id: aID,
      contextID: aContextID,
      name: aName,
      rights: someRights,
      mode: aMode,
      users: someUser});

    if (DEBUG_OF_RIGHTMANAGEMENT) {
      console.log("pushing testrole: " + aName);
    }
  });
};

var RightManager = function() {
  fillCurrentDbWithTestData();
  fillCurrentDbWithLayer0CanvasData();
  fillWithDefaultRights();

  var possibleAccessRights = [];
  var that = this;

  /**
   *		The function is needed to initialize the RightManager
   *
   */
  this.init = function(theModules) {
    Modules = theModules;
    var Dispatcher = Modules.Dispatcher;

    /* get all exiting access rights from the database */
    var collection = db.get('rights');
    collection.find({}, {}, function(e, docs) {
      if (docs != undefined) {
        docs.forEach(function(entry) {

          if (DEBUG_OF_RIGHTMANAGEMENT) {
            console.log("adding right: " + String(entry.name));
          }

          possibleAccessRights.push(entry.name);
        });
      }
    });

    // Register RightManager related server calls...
    Dispatcher.registerCall('rmHasAccess', function(socket, data, responseID) {
      //var context = Modules.UserManager.getConnectionBySocket(socket);
      //Modules.ObjectController.executeServersideAction(data, context, resultCallbackWrapper(socket, responseID));
      that.hasAccess(data.command, data.object, data.username, function(result) {
        if (result === true) {
          Modules.SocketServer.sendToSocket(socket, "rmAccessGranted" + data.object.id);
        } else {
          Modules.SocketServer.sendToSocket(socket, "rmAccessDenied" + data.object.id);
        }
      });
    });

    Dispatcher.registerCall("rmGetObjectRights", this.getRights);

    console.log("RightManager has been initialized");
  };

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {type}       command     The used command (access right), e.g., read, write (CRUD)
   *	@param {type}       object      The object that should be checked
   *    @param {type}       user        The username of the user
   *    @param {function}   callback    The callback function with one boolean parameter (the answer)
   */
  this.hasAccess = function(command, object, user, callback) {
    /* check if command is feasible */
    var commandIsInPossibleAccessRights = (possibleAccessRights.indexOf(String(command)) != -1);
    if (commandIsInPossibleAccessRights) {

      /* (1) get the roles that include the current command within the context of
       the given object */
      var collection = db.get('roles');
      collection.find({contextID: String(object.id)}, {}, function(e, docs) {
        var found = false;
        docs.forEach(function(item) {
          var commandIsInRights = (String(item.rights).split(",").indexOf(String(command)) != -1);

          if (commandIsInRights) {
            if (DEBUG_OF_RIGHTMANAGEMENT) {
              console.log("Command is used in Role " + item.name);
            }

            /* (2) check if current user is inside of one of these roles */
            var userIsInUserList = (String(item.users).split(",").indexOf(String(user)) != -1);

            if (userIsInUserList) {
              /* (3) if (2) is fulfilled return true */
              found = true;
            }
          }
        });

        if (found) {
          callback(true);
        } else {
          callback(false);
        }

      });

    } else {
      console.log("<<DEBUG INFORMATION>> The given command was not valid");
    }
    //return true;
  };

  /**
   *	The function can be used to grant access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this:  grantAccess("read","AB","reviewer");
   */
  this.grantAccess = function(command, object, role) {
    //FIXME: atm usage of a simple workaround to append 'typeOfThisObject'
    if (object.typeOfThisObject == 'undefined') {
      object.typeOfThisObject = "";
    }

    // granting access
    this.modifyAccess(command, object, role, true);

    // add right also to the right list
    var collection = db.get('rights');
    collection.find({type: String(object.typeOfThisObject), name: String(command)},
    {}, function(e, docs) {

      // FIXME: Get correct id of the right
      if (typeof docs == 'undefined' || docs.length === 0) {
        collection.insert({type: String(object.typeOfThisObject),
          type: String(object.typeOfThisObject),
                  id: String(-1),
          name: String(command),
          comment: "Insert a comment..."});

        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("pushing new right: " + String(token[1]));
        }
      } else {
        if (DEBUG_OF_RIGHTMANAGEMENT) {
          console.log("right " + command + " was already included and has, " +
                  "thus, not been included to the right list");

          console.log(">> The result was: ");
          console.log(docs);
          console.log(">> ---------------- <<");
        }
      }
    });
  };

  /**
   *	The function can be used to revoke access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this: revokeAccess("read","AB","reviewer");
   */
  this.revokeAccess = function(command, object, role) {
    //FIXME: atm usage of a simple workaround to append 'typeOfThisObject'
    if (object.typeOfThisObject == 'undefined') {
      object.typeOfThisObject = "";
    }

    this.modifyAccess(command, object, role, false);

    //FIXME: remove right from db.rights IFF it is not used (=> there is no role that includes that right)

  };

  /**
   *	The function can be used to modify access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type}   role      The role that should be changed
   *	@param {type}   grant     The grant paramter is set to true, if the access right should be
   *        granted. Set false, to revoke access.
   *	A call could look like this: modifyAccess("read","AB","reviewer", true);
   */
  this.modifyAccess = function(command, object, role, grant) {
    /* check if command is feasible */
    var commandIsInPossibleAccessRights = (possibleAccessRights.indexOf(String(command)) != -1);
    if (commandIsInPossibleAccessRights) {

      /* (1) get the current role */
      var collection = db.get('roles');
      collection.find({contextID: String(object.id), name: String(role)}, {}, function(e, docs) {
        docs.forEach(function(item) {
          /* (2) update role */
          if (grant == true) {
            /* store to database */
            collection.update({_id: item._id}, {$addToSet: {rights: command}});
          } else {
            collection.update({_id: item._id}, {$pull: {rights: command}});
          }

        });
      });

    } else {
      console.log("<<DEBUG INFORMATION>> The given command was not valid");
    }
  };

  /**
   * 
   * @param {type} object
   * @returns {undefined}
   */
  this.getRights = function(socket, data) {

    console.log("Serverseite...");
    console.log(data);

    var dbRights = db.get('rights');
    var dbRoles = db.get("roles");

    dbRights.find({type: String(data.object.type)}, {}, function(e, docsRights) {
      // We need to make sure that both data are send to the client in one step...
      dbRoles.find({contextID: String(data.object.id), name: String(data.role)}, {}, function(e, docsRoles) {
        // Both arrays will be merged on the client side. Why should the server do all the work ;).
        console.log(docsRights);
        console.log(docsRoles);
        
        var dataRights = {
          "availableRights": docsRights,
          "checkedRights": docsRoles[0].rights
        };

        Modules.SocketServer.sendToSocket(socket, "rmObjectRights" + data.object.id, dataRights);
      });
    });
  };
};

module.exports = new RightManager();