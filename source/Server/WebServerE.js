/**
 *    CoW - A web application for responsive graphical knowledge work
 *
 *    @author University of Paderborn, 2014
 *    
 *    @class WebServer
 *    @classdesc Web Server that manages http requests 
 *    
 */

"use strict";

var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');

var everyauth = require('everyauth');
var hbs = require('hbs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var validator = require('validator');

var app = express();

var Modules = false;
var WebServer = {};

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
WebServer.init = function(theModules) {
  Modules = theModules;

  var server = require('http').createServer(app);
  WebServer.server = server;

  server.listen(global.config.port); // start server (port set in config)
};

everyauth.password
        .loginFormFieldName('username')
        .passwordFormFieldName('password')
        .getLoginPath('/login')  // Uri path to the login page
        .postLoginPath('/login') // Uri path that your login form POSTs to
        .loginView('login.html')
        .authenticate(function(login, password) {
            var errors = [];

            if (!login) {
                errors.push('Missing username');
            }
        
            if (!password) {
                errors.push('Missing password');
            }
        
            if (errors.length) return errors;
        
            var promise = this.Promise();
            Modules.UserDAO.usersByUserName(login, function(err, doc) {
                if (err) {
                    return promise.fulfill([ err ]);
                } else if (doc.length === 0) {
                    return promise.fulfill([ 'Username not found' ]);
                } else {
                    var user = doc[0];
                    if (user.password != password) {
                        return promise.fulfill([ 'Wrong password' ]);
                    }
        
                    promise.fulfill(doc[0]);
                }
            });
        
            return promise;
        })
        .loginSuccessRedirect('/room/public') // Where to redirect to after a
                                              // login

        .getRegisterPath('/login') // Uri path to the registration page
        .postRegisterPath('/register') // The Uri path that your registration form POSTs to
        .registerView('login.html')
        .validateRegistration(function(newUserAttributes) {
            var errors = [];

            if (!newUserAttributes.login) {
                errors.push('Missing username');
            } else if (!validator.isLength(newUserAttributes.login, 3, 10)) {
                errors.push('Username should be 3 to 10 characters long');
            }
            
            if (!newUserAttributes.password) {
                errors.push('Missing password');
            } else if (!validator.isLength(newUserAttributes.password, 3, 8)) {
                errors.push('Password should be 3 to 8 characters long');
            }
            
            if ((newUserAttributes.e_mail) && (!validator.isEmail(newUserAttributes.e_mail))) {
                errors.push('A valid email is required');
            }

            return errors;
        })
        .registerUser(function(newUserAttributes) {
            var promise = this.Promise();
            
            Modules.UserDAO.usersByUserName(newUserAttributes.login, function(err, user) {
                if (err) return promise.fulfill([err]);
                else {
                    
                    if ((user != null) && (user.length > 0)) {
                        return promise.fulfill(["A user with the same name already exists. Use a different name"]);
                    }
                    
                    Modules.UserDAO.createUsers(newUserAttributes, function(err, user) {
                        if (err) return promise.fulfill([err]);
                        promise.fulfill(user);
                    });
                }
            });
            
            return promise;
        })
        .registerSuccessRedirect('/room/public'); // Where to redirect to
                                                    // after a successful
                                                    // registration

everyauth.password.extractExtraRegistrationParams(function(req) {
  return {
    e_mail: req.body.e_mail
  };
});

everyauth.everymodule.findUserById(function(id, callback) {
  Modules.UserDAO.usersById(id, callback);
});

// key field in the User collection
everyauth.everymodule.userPkey('_id');

app.use('/Common', express.static(path.resolve(__dirname, '../Common')))
        .use(express.static(path.resolve(__dirname, '../Client')))
        .set('views', path.resolve(__dirname, '../Client/views'))
        .set('view engine', 'html')
        .engine('html', hbs.__express)
        .use(bodyParser.urlencoded({
          extended: true
        }))
        .use(bodyParser.json())
        .use(cookieParser())
        .use(session({secret: 'keyboard gato', key: 'sid', resave: true, saveUninitialized: true}))
        .use(everyauth.middleware(app));

// invoked for any requested passed to this router
app.use(function(req, res, next) {
  var agent = req.get('user-agent');

  if (agent && agent.indexOf('MSIE') > 0) {
    var data = '<h1>WebArena does not work with Microsoft Internet Explorer</h1><p>This is experimental software. Please use the most recent versions of Firefox or Chrome.</p>';
    res.send(data);
  } else {

    if (req.loggedIn) {

      /* get userHash */
      var userHashIndex = req.path.indexOf("/___");
      if (userHashIndex > -1) {

        /* userHash found */
        var userHash = req.path.slice(userHashIndex + 1);
        var context = Modules.UserManager.getConnectionByUserHash(userHash);
      } else {
        var context = false;
      }

      req.context = context;
      next();
    } else {
      res.redirect('/login');
    }
  }
});

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

app.get('/', function(req, res, next) {
  var filePath = path.resolve(__dirname, '../Client/views/' + Modules.config.homepage);
  res.sendfile(filePath);
});

app.get('/room/:id', function(req, res, next) {
  //console.log("user -> " + JSON.stringify(req.user));
  var userName = (req.user !== undefined) ? req.user.username : "";
  var password = (req.user !== undefined) ? req.user.password : "";

  var indexFilename = '../Client/guis/desktop/index.html';
  res.render(path.resolve(__dirname, indexFilename), {start_room: req.params.id, username: userName, password: password});
});

app.get('/getRoomHierarchy', function(req, res, next) {
  var roomId = req.query.id;
  Modules.Connector.getRoomHierarchy(roomId, false, function(hierarchy) {
    var result = [];

    if (roomId === "") {
      for (var key in hierarchy.roots) {
        var node = {};
        node.data = hierarchy.rooms[hierarchy.roots[key]];
        node.attr = {"id": hierarchy.roots[key]};
        if (hierarchy.relation[hierarchy.roots[key]] != undefined) {
          node.state = "closed";
        }
        result.push(node);
      }
    } else {
      for (var key in hierarchy.relation[roomId]) {
        var node = {};
        node.data = hierarchy.rooms[hierarchy.relation[roomId][key]];
        node.attr = {"id": hierarchy.relation[roomId][key]};
        if (hierarchy.relation[hierarchy.relation[roomId][key]] != undefined) {
          node.state = "closed";
        }
        result.push(node);
      }
    }

    res.send(200, JSON.stringify(result));
  });
});

app.get("/getPaper/:roomID/:objectID/:hash", function(req, res, next) {
	var context = {username: "dummy"};
	res.set('Content-Type', 'text/html');
	res.set('Content-Disposition', 'inline; filename="paper.html"');
	if (req.params.objectID != '0')
	{
		Modules.Connector.getContent(req.params.roomID, req.params.objectID + '.html', req.context, function(data) {
			if(data === false)
			{
				res.send(404, "no html content");
				return;
			}

			res.send(200, new Buffer(data));
		});
	}
	else
	{
		var data;
		data = '<!DOCTYPE html>' +
				'<html><head><title>Drag a document in here!</title></head>' +
				'<body><div style="width: 388px; margin: 0 auto;">' +
				'<img src="/guis.common/images/dragDocument.png" alt="Drag a document in here!" title="Drag a document in here!">' +
				'</div></body></html>';

		res.send(200, new Buffer(data));
	}
	return;
});

// p3 might specify a content age
app.get('/getContent/:roomID/:objectID/:p3/:hash', function(req, res, next) {

	// pdf file html preview
  var objectAdditionalContent = req.params.objectID.match(/(.+?)\.(.+)/);
  if (objectAdditionalContent) {
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'inline; filename="preview.html"');
		Modules.Connector.getContent(req.params.roomID, req.params.objectID, req.context, function(data) {
			if(data === false)
			{
				res.send(404, "no html content");
				return;
			}
			res.send(200, new Buffer(data));
		});
    return;
  }

  Modules.ObjectManager.getObject(req.params.roomID, req.params.objectID, req.context, function(object) {

  if (!object) {
    Modules.Log.warn('Object not found (roomID: ' + req.params.roomID + ' objectID: ' + req.params.objectID + ')');
    return res.send(404, 'Object not found');
  }

  var mimeType = object.getAttribute('mimeType') || 'text/plain';

  res.set('Content-Type', mimeType + '; charset=ISO-8859-1');
  res.set('Content-Disposition', 'inline; filename="' + object.getAttribute("name") + '"');

  if (Modules.Connector.getContentStream !== undefined) {
      var objStream = Modules.Connector.getContentStream(req.params.roomID, req.params.objectID, req.context);
    objStream.pipe(res);
    objStream.on("end", function() {
      try {
        res.send(200);
      } catch (Ex) {
        // console.log("paintings ex: " + err);
      }
    });
  } else {
    var data = object.getContent();
    res.send(200, new Buffer(data));
  }
});
});

/**
 * returns the contents of the files associated with an export object, converted
 * calls a predefined prepared call in ExportObject
 */
app.get('/getExport/:requestId', function(req, res, next) {
	var ExportObject = Modules.ObjectManager.getPrototype('ExportObject');
	if(!ExportObject.calls[req.params.requestId]) {
		res.send(404, 'Not found');
	}

	// call deferred export
	ExportObject.calls[req.params.requestId](function(filename, data, mimetype) {
		res.set('Content-Type', mimetype);
		res.set('Content-Disposition', 'inline; filename="' + filename + '"');
		res.send(200, new Buffer(data));
	});
});

app.get('/getPreviewContent/:roomID/:objectID/:p3/:hash', function(req, res, next) {
  Modules.ObjectManager.getObject(req.params.roomID, req.params.objectID, req.context, function(object) {

  if (!object) {
    return  res.send(404, 'Object not found');
  }

  object.getInlinePreviewMimeType(function(mimeType) {
    object.getInlinePreview(function(data) {

      if (!data) {
        Modules.Log.warn('no inline preview found (roomID: ' + req.params.roomID + ' objectID: ' + req.params.objectID + ')');
        if (mimeType.indexOf("image/") >= 0) {
          fs.readFile(__dirname + '/../Client/guis.common/images/imageNotFound.png', function(err, data) {

            if (err) {
              Modules.Log.warn("Error loading imageNotFound.png file (" + req.path + ")");
              return res.send(404, '404 Error loading imageNotFound.png file');
            }

            res.set({'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
            res.send(200, data);
          });
        } else {
          res.send(404, 'Object not found');
        }
      } else {
        res.set({'Content-Type': 'text/plain', 'Content-Disposition': 'inline'});
        res.send(200, new Buffer(data));
      }
    }, mimeType, true);
  });
});
});

// TODO: test this
// get external session data
app.post('/pushSession', function(req, res, next) {
  var qs = require('querystring');
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    var post = qs.parse(data);

    var home = post.home;
    if (!home) {
      home = "";
    }
    if (Modules.Connector.addExternalSession !== undefined) {
      Modules.Connector.addExternalSession({
        "id": post.id,
        "username": post.username,
        "password": post.password,
        "home": home
      });
    }
  });
});

// Combine all javascript files in guis.common/javascript
app.get('/defaultJavascripts', function(req, res, next) {
  Q.nfcall(fs.readdir, 'Client/guis.common/javascript').then(function(files) {
    files.sort(function(a, b) {
      return parseInt(a) - parseInt(b);
    });
    var fileReg = /[0-9]+\.[a-zA-Z]+\.js/;

    files = _.filter(files, function(fname) {
      return fileReg.test(fname);
    });

    var etag = "";

    files.forEach(function(file) {
      var stats = fs.statSync('Client/guis.common/javascript/' + file);
      etag += stats.size + '-' + Date.parse(stats.mtime);
    });

    if (req.get('if-none-match') === etag) {
      res.send(304);
    } else {
      var readFileQ = Q.denodeify(fs.readFile);

      var promises = files.map(function(filename) {
        return readFileQ('Client/guis.common/javascript/' + filename);
      });

      var combinedJS = "";

      // Go on if all files are loaded
      Q.allSettled(promises).then(function(results) {
        results.forEach(function(result) {
          combinedJS += result.value + "\n";
        });

        var mimeType = 'application/javascript';
        res.set({'Content-Type': mimeType, 'ETag': etag});
        res.send(200, combinedJS);
      });
    }
  });
});

app.get('/objects', function(req, res, next) {
  var code = Modules.BuildTool.getClientCode();

  res.set('Content-Type', 'application/javascript');
  res.send(200, code);
});

app.get('/objectIcons/:objectType/:section?', function(req, res, next) {
  var obj = Modules.ObjectManager.getPrototype(req.params.objectType);

  if (!obj) {
    return res.send(404, 'Object not found ' + req.params.objectType);
  }

  res.sendfile(path.resolve(__dirname, obj.localIconPath(req.params.section)));
});


app.post('/setContent/:roomID/:objectID/:hash', function(req, res, next) {
  var roomID = req.params.roomID;
  var objectID = req.params.objectID;

  var historyEntry = {
    'objectID': roomID,
    'roomID': roomID,
    'action': 'setContent'
  };

  Modules.ObjectManager.history.add(new Date().toDateString(), req.context.user.username, historyEntry)
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

    Modules.ObjectManager.getObject(roomID, objectID, req.context, function(object) {
  if (!object) {
    Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
    return res.send(404, 'Object not found');
  }

    if (files.file.type.match(/^application\//i)) {
      // firefox does not specify mime type, so guess from file ending
      if (files.file.name.match(/\.pdf$/i)) {
        files.file.type = 'application/pdf';
      }
    }

    object.copyContentFromFile(files.file.path, function() {

      object.set('hasContent', true);
      object.set('contentAge', new Date().getTime());
      object.set('mimeType', files.file.type);

      /* check if content is inline displayable */
      if (Modules.Connector.isInlineDisplayable(files.file.type)) {

        object.set('preview', true);
        object.persist();

        /* get dimensions */
        Modules.Connector.getInlinePreviewDimensions(roomID, objectID, files.file.type, true, function(width, height) {

          if (width != false)
            object.setAttribute("width", width);
          if (height != false)
            object.setAttribute("height", height);

          //send object update to all listeners
          object.persist();
          object.updateClients('contentUpdate');

          res.send(200);
        });

      } else {
        object.set('preview', false);

        //send object update to all listeners
        object.persist();
        object.updateClients('contentUpdate');

        res.send(200);
      }
    });

    // convert pdf to html if neccessary
    if (files.file.type == 'application/pdf') {
      Modules.EventBus.emit('pdfAdded', {object: object, file: files.file});
    }
  });
});

});

app.get('/paintings/:roomID/:user/:picID/:hash', function(req, res, next) {
  if (Modules.Connector.getPaintingStream !== undefined) {
    var objStream = Modules.Connector.getPaintingStream(req.params.roomID, req.params.user, req.context);
    objStream.pipe(res);
    objStream.on("end", function() {
      try {
        res.attachment(req.params.user + '.png');
        res.send(200);
      } catch (err) {
        // console.log("paintings ex: " + err);
      }
    });
  } else {
    res.set('Content-Type', 'text/plain');
    res.send(200, 'Connector does not support PaintingStreams');
  }
});

app.get('/write', function(req, res, next) {
    res.set('Content-Type', 'text/plain');
    res.send(200, 'Please create a chapter to write anything... \n(at the moment you need to reload the room)');
});


module.exports = WebServer;