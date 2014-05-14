var db = false;
var Modules = false;

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
        Modules.Log.debug("pushing default object: " + String(aObject));
      } else {
        Modules.Log.debug("default object " + aObject + " was already included");
      }
    });
  });
};

var fillCurrentDbWithLayer0CanvasData = function() {

  Modules.Log.debug("filling Layer 0 data");

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

        Modules.Log.debug("pushing default right: " + String(token[1]));
      } else {
        Modules.Log.debug("default right " + token[1] + " was already included");
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

        Modules.Log.debug("pushing default user: " + String(token[1]));
      } else {
        Modules.Log.debug("default user " + token[1] + " was already included");
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
        Modules.Log.debug("pushing default role: " + String(aName));
      } else {
        Modules.Log.debug("default role " + aName + " was already included");
      }
    });
  });
};

var fillCurrentDbWithTestData = function() {

  Modules.Log.debug("filling testdata");

  var pushRights = ['Canvas#1#create#You may create something on the canvas',
    'Canvas#2#read#You may read something on the canvas',
    'Canvas#3#update#You may change something on the canvas',
    'Canvas#4#delete#You may delete something on the canvas',
    'PaperObject#5#read#You may read the selected PaperObject',
    'PaperObject#6#update#You may change the selected PaperObject',
    'PaperObject#7#delete#You may delete the selected PaperObject',
    'NumberCreator#8#create#You may create the selected NumberCreater and NumericObjects',
    'NumberCreator#9#update#You may drop something on the PaperObject PaperObject'];
  var pushUsers = [
    'Joerg#12345',
    'Vanessa#xyz',
    "Shari#345",
    "Oliver#345",
    "Steven#345",
    "Lisa#123",
    "Mohammad#345",
    "Alejandro#345",
    "Sharath#345",
    "Ivan#345",
    "Siby#345",
    "Brice#345",
    "Manasa#345",
    "Nitesh#345",
    "Patrick#234"
  ];
  var pushRoles = [
    '1#1#RandomGuys#create,read#overwrite#',
    '2#1#Boss#read#overwrite#'
  ];

  /* clear tables */
  db.get('rights').drop();
  db.get('users').drop();
  db.get('roles').drop();

  /* push test rights */
  var collection = db.get('rights');
  pushRights.forEach(function(item) {
    var token = item.split("#");
    collection.insert({type: String(token[0]), id: String(token[1]), name: String(token[2]), comment: String(token[3])});

    Modules.Log.debug("pushing testright: " + String(token[1]));
  });

  /* push test users */
  collection = db.get('users');
  pushUsers.forEach(function(item) {
    var token = item.split("#");
    collection.insert({username: String(token[0]), password: String(token[1])});

    Modules.Log.debug("pushing testuser: " + String(token[0]));
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

    Modules.Log.debug("pushing testrole: " + aName);
  });
};

var RightManager = function() {

  var possibleAccessRights = [];
  var that = this;

  /**
   * The function gets all rights from the database and stores them in an internal array
   */
  this.initRights = function() {
    possibleAccessRights = [];

    /* get all exiting access rights from the database */
    var collection = db.get('rights');
    collection.find({}, {}, function(e, docs) {
      if (typeof docs != 'undefined' && docs.length > 0) {
        docs.forEach(function(entry) {

          Modules.Log.debug("adding right: " + String(entry.name));

          possibleAccessRights.push(entry.name);
        });
      }
    });
  };

  /**
   * Initializes the right manager on the server,
   * 
   * @param {type} theModules
   * @returns {undefined}
   */
  this.init = function(theModules) {
    Modules = theModules;

    db = require('monk')(Modules.MongoDBConfig.getURI());
    
    var Dispatcher = Modules.Dispatcher;

    fillCurrentDbWithTestData();
    fillCurrentDbWithLayer0CanvasData();
    fillWithDefaultRights();

    this.initRights();

    // Register RightManager related server calls...
    Dispatcher.registerCall('rmHasAccess', function(socket, data, responseID) {
      var connection = Modules.UserManager.getConnectionBySocket(socket);
      
      that.hasAccess(data.command, data.object, connection.user, function(result) {
        if (result === true) {
          Modules.SocketServer.sendToSocket(socket, "rmAccessGranted" + data.object.id);
        } else {
          Modules.SocketServer.sendToSocket(socket, "rmAccessDenied" + data.object.id);
        }
      });
    });

    Dispatcher.registerCall('rmGrantAccess', function(socket, data, responseID) {
      that.grantAccess(data.command, data.object, data.role);
    });

    Dispatcher.registerCall('rmRevokeAccess', function(socket, data, responseID) {
      that.revokeAccess(data.command, data.object, data.role);
    });

    Dispatcher.registerCall("rmGetObjectRoles", function(socket, data) {
      var dbRights = db.get('defroles');

      dbRights.find({object: String(data.object.type)}, {}, function(e, docs) {
        Modules.SocketServer.sendToSocket(socket, "rmObjectRoles" + data.object.id, docs);
      });
    });

    Dispatcher.registerCall("rmGetAllUsers", function(socket, data) {
      var dbRights = db.get('users');

      dbRights.find({}, {}, function(e, docs) {
        Modules.SocketServer.sendToSocket(socket, "rmUsers", docs);
      });
    });

    Dispatcher.registerCall("rmGetObjectRights", this.getRights);

    Modules.Log.info("RightManager has been initialized");
  };

  /**
   *   The function can be used to put a right into the db.right document space.
   *   If it is already included, the call will do nothing but log this fact.
   *
   *   @param {type} command   The used command (access right), e.g., read, write (CRUD)
   *   @param {type} object    The object that should be used to change the access right
   */
  this.addRightToRightTableIfItIsNotThere = function(command, object) {
    var collection = db.get('rights');
    collection.find({type: String(object.type), name: String(command)},
    {}, function(e, docs) {

      var options = {"limit": 1, "sort": [['id', 'desc']]};
      collection.find({}, options, function(e2, rightWithMaxID) {

        if (typeof docs == 'undefined' || docs.length === 0) {
          var newID = Number(rightWithMaxID[0].id) + 1;

          collection.insert({
            type: String(object.type),
            id: String(newID),
            name: String(command),
            comment: "Insert a comment..."});

          Modules.Log.debug("pushing new right: " + String(command));
        } else {
          Modules.Log.debug("right " + command + " was already included and has, " +
                  "thus, not been included to the right list");
          Modules.Log.debug(">> The result was: ");
          Modules.Log.debug(docs);
          Modules.Log.debug(">> ---------------- <<");
        }
      });
    });
  };

  /**
   * This method returns the parent of this object
   * If the parent cannot be determined it returns the root (i.e., the canvas element)
   *   
   * @param {type} obj
   * @returns {RightManager.getParentOfObject.Anonym$26}
   */
  this.getParentOfObject = function(obj) {
    var parentHasBeenFound = false;

    if (!parentHasBeenFound) {
      return {id: 0, type: "Canvas"};
    }
  };

  /**
   *	The function returns a boolean value that 
   *	represents if the current user has the right 
   *	to perform a specific command.
   *	
   *	@param {type}       command     The used command (access right), e.g., read, write (CRUD)
   *	@param {type}       object      The object that should be checked
   *  @param {type}       user        The user object
   *  @param {function}   callback    The callback function with one boolean parameter (the answer)
   */
  this.hasAccess = function(command, object, user, callback) {
    var that = this;
    // add right also to the right list
    this.addRightToRightTableIfItIsNotThere(command, object);

    // re-init possible rights
    this.initRights();

    /* (0) Check if rights are set up for this object. If not: call update for parent */
    var collection = db.get('roles');
    collection.find({contextID: String(object.id)}, {}, function(e, docs) {
      if (typeof docs == 'undefined' || docs.length === 0) {
        var parent = that.getParentOfObject(object);

        // call method for parent
        parent.hasAccess(command, parent, user, callback);
      } else {
        /* (1) get the roles that includes the current command within the context of
         the given object */
        var found = false;
        docs.forEach(function(item) {
          var commandIsInRights = (String(item.rights).split(",").indexOf(String(command)) != -1);

          if (commandIsInRights) {
            Modules.Log.debug("Command is used in Role " + item.name);

            /* (2) check if current user is inside of one of these roles */
            var userIsInUserList = (String(item.users).split(",").indexOf(String(user.username)) != -1);

            /* (2') check if 'all' is included in the user list */
            var userDoesNotMatter = (String(item.users).split(",").indexOf(String("all")) != -1);

            if (userIsInUserList || userDoesNotMatter) {
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
      }
    });
    //return true;
  };

  /**
   *  The function can be used to grant access rights
   *  @param {type} command   The used command (access right), e.g., read, write (CRUD)
   *  @param {type} object    The object that should be used to change the access right
   *  @param {type} role      The role that should be changed
   *  A call could look like this:  grantAccess("read","AB","reviewer");
   */
  this.grantAccess = function(command, object, role) {
    // granting access
    this.modifyAccess(command, object, role, true);
  };

  /**
   *	The function can be used to revoke access rights
   *	@param {type}	command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}	object    The object that should be used to change the access right
   *	@param {type} role      The role that should be changed
   *	A call could look like this: revokeAccess("read","AB","reviewer");
   */
  this.revokeAccess = function(command, object, role) {
    this.modifyAccess(command, object, role, false);
    //FIXME: remove right from db.rights IFF it is not used (=> there is no role that includes that right)
  };

  /**
   *	The function can be used to modify access rights
   *	@param {type}   command   The used command (access right), e.g., read, write (CRUD)
   *	@param {type}   object    The object that should be used to change the access right
   *	@param {type}   role      The role that should be changed
   *	@param {type}   grant     The grant paramter is set to true, if the access right should be
   *        granted. Set false, to revoke access.
   *	A call could look like this: modifyAccess("read","AB","reviewer", true);
   */
  this.modifyAccess = function(command, object, role, grant) {
    /* (1) get the current role */
    Modules.Log.debug(command + " " + object.id + " " + role.name + " " + grant);

    var collection = db.get('roles');
    collection.find({contextID: String(object.id), name: String(role.name)}, {}, function(e, docs) {
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
  };

  /**
   * 
   * @param {type} socket
   * @param {type} data
   * @returns {undefined}
   */
  this.getRights = function(socket, data) {
    var dbRights = db.get('rights');
    var dbRoles = db.get("roles");

    dbRights.find({type: String(data.object.type)}, {}, function(e, docsRights) {
      // We need to make sure that both data are send to the client in one step...
      dbRoles.find({contextID: String(data.object.id), name: String(data.role.name)}, {}, function(e, docsRoles) {
        // Both arrays will be merged on the client side. Why should the server do all the work ;).
        var dataRights = {
          "availableRights": docsRights,
          "checkedRights": (docsRoles.length > 0 ? docsRoles[0].rights : [])
        };

        Modules.SocketServer.sendToSocket(socket, "rmObjectRights" + data.object.id, dataRights);
      });
    });
  };
};

module.exports = new RightManager();