/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *    
 *    @class WebServer
 *    @classdesc Web Server that manages http requests 
 *    
 */

"use strict";

var path    = require('path');
var Q       = require('q');
var fs      = require('fs');
var _       = require('lodash');

var everyauth = require('everyauth');
var hbs     = require('hbs');
var express = require('express');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var validator    = require('validator');

var app     = express();

var Modules   = false;
var WebServer = {};

var userHash = false;
var context  = false;

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
WebServer.init = function (theModules) {
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
    .authenticate( function (login, password) {
        var errors = [];
        if (!login) errors.push('Missing username');
        if (!password) errors.push('Missing password');
        if (errors.length) return errors;
        
        var promise = this.Promise();
        Modules.UserDAO.usersByUserName(login, function (err, doc) {
            if (err) {
                return promise.fulfill([err]);
            } else if (doc.length === 0) {
                return promise.fulfill(['Username not found']);
            } else {
                var user = doc[0];
                if (user.password != password) {
                    return promise.fulfill(['Wrong password']);
                }
                
                promise.fulfill(doc[0]); 
            }
        });
        
        return promise;
    })
    .loginSuccessRedirect('/room/public') // Where to redirect to after a login
    
    .getRegisterPath('/login') // Uri path to the registration page
    .postRegisterPath('/register') // The Uri path that your registration form POSTs to
    .registerView('login.html')
    .validateRegistration(function(newUserAttributes) {
        var errors = [];
        
        if (!newUserAttributes.login) errors.push('Missing username');
        else if (!validator.isLength(newUserAttributes.login, 3, 8)) errors.push('Username should be 3 to 8 characters long');
        if (!newUserAttributes.password) errors.push('Missing password');
        else if (!validator.isLength(newUserAttributes.password, 4, 8)) errors.push('Password should be 4 to 8 characters long');
        if ((newUserAttributes.e_mail) && (!validator.isEmail(newUserAttributes.e_mail))) errors.push('A valid email is required');
        
        return errors;
    })
    .registerUser(function(newUserAttributes) {
         var promise = this.Promise();
         Modules.UserDAO.createUsers(newUserAttributes, function (err, user) {
             if (err) return promise.fulfill([ err ]);
             promise.fulfill(user);
         });
         
         return promise;
    })
    .registerSuccessRedirect('/room/public'); // Where to redirect to after a successful registration

everyauth.password.extractExtraRegistrationParams(function (req) {
    return {
        e_mail: req.body.e_mail
    };
  });

everyauth.everymodule.findUserById(function (id, callback) {
    Modules.UserDAO.usersById(id, callback);
});

// key field in the User collection
everyauth.everymodule.userPkey('_id');

app.use('/Common', express.static('Common'))
    .use(express.static('Client'))
    .set('views', path.resolve(__dirname, '../Client/views'))    
    .set('view engine', 'html')
    .engine('html', hbs.__express)
    .use(bodyParser())
    .use(cookieParser())
    .use(session({ secret: 'keyboard gato', key: 'sid'}))
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
                userHash = req.path.slice(userHashIndex + 1);
                context = Modules.UserManager.getConnectionByUserHash(userHash);
            } else {
                userHash = false;
                context = false;
            }
            
            next();
        } else {
            res.redirect('/login');
        }
    }
});

app.get('/', function(req, res, next) {
    var filePath = path.resolve(__dirname, '../Client/views/' + Modules.config.homepage);
    res.sendfile(filePath);
});

app.get('/room/:id', function(req, res, next) {
    //console.log("user -> " + JSON.stringify(req.user));
    var userName = (req.user !== undefined) ? req.user.username : "";
    
    var indexFilename = '../Client/guis/desktop/index.html';
    res.render(path.resolve(__dirname, indexFilename), {start_room: req.params.id, username: userName});
});

app.get('/getRoomHierarchy', function(req, res, next) {
    var roomId = req.query.id;
    Modules.Connector.getRoomHierarchy(roomId, false, function(hierarchy) {
        var result = [];

        if (roomId === "") {
            for (var key in hierarchy.roots) {
                var node = {};
                node.data = hierarchy.rooms[hierarchy.roots[key]];
                node.attr = { "id" : hierarchy.roots[key] };
                if (hierarchy.relation[hierarchy.roots[key]] != undefined) {
                    node.state = "closed";
                }
                result.push(node);
            }
        } else {
            for (var key in hierarchy.relation[roomId]) {
                var node = {};
                node.data = hierarchy.rooms[hierarchy.relation[roomId][key]];
                node.attr = { "id" : hierarchy.relation[roomId][key]};
                if (hierarchy.relation[hierarchy.relation[roomId][key]] != undefined) {
                    node.state = "closed";
                }
                result.push(node);
            }
        }

        res.send(200, JSON.stringify(result));
    });
});

app.get('/getContent/:roomID/:objectID/:p3/:hash', function(req, res, next) {
    Modules.ObjectManager.getObject(req.params.roomID, req.params.objectID, context, function(object) {
       
        if (!object) {
            Modules.Log.warn('Object not found (roomID: ' + req.params.roomID + ' objectID: ' + req.params.objectID + ')');
            return res.send(404, 'Object not found');
        }

        var mimeType = object.getAttribute('mimeType') || 'text/plain';
        
        res.set('Content-Type', mimeType + '; charset=ISO-8859-1');
        res.set('Content-Disposition', 'inline; filename="' + object.getAttribute("name") + '"');
        
        if (Modules.Connector.getContentStream !== undefined) {
            var objStream = Modules.Connector.getContentStream(req.params.roomID, req.params.objectID, context);
            objStream.pipe(res);
            objStream.on("end", function() {
                try {
                    res.send(200);
                } catch(Ex) {
                 // console.log("paintings ex: " + err);
                }
            })
        } else {
            var data = object.getContent();
            res.send(200, new Buffer(data));
        }
    });
});

app.get('/getPreviewContent/:roomID/:objectID/:p3/:hash', function(req, res, next) {
    Modules.ObjectManager.getObject(req.params.roomID, req.params.objectID, context, function(object) {
        
        if (!object) {
            return  res.send(404, 'Object not found'); 
        }
        
        object.getInlinePreviewMimeType(function (mimeType) {
            object.getInlinePreview(function (data) {

                if (!data) {
                    Modules.Log.warn('no inline preview found (roomID: ' + req.params.roomID + ' objectID: ' + req.params.objectID + ')');
                    if (mimeType.indexOf("image/") >= 0) {
                        fs.readFile(__dirname + '/../Client/guis.common/images/imageNotFound.png', function (err, data) {

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
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
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
        files.sort(function (a, b) {
            return parseInt(a) - parseInt(b);
        });
        var fileReg = /[0-9]+\.[a-zA-Z]+\.js/;

        files = _.filter(files, function (fname) {
            return fileReg.test(fname);
        })

        var etag = "";

        files.forEach(function (file) {
            var stats = fs.statSync('Client/guis.common/javascript/' + file);
            etag += stats.size + '-' + Date.parse(stats.mtime);
        })

        if (req.get('if-none-match') === etag) {
            res.send(304);
        } else {
            var readFileQ = Q.denodeify(fs.readFile);

            var promises = files.map(function(filename) {
                return readFileQ('Client/guis.common/javascript/' + filename)
            })

            var combinedJS = "";

            // Go on if all files are loaded
            Q.allSettled(promises).then(function(results) {
                results.forEach(function(result) {
                    combinedJS += result.value + "\n";
                })

                var mimeType = 'application/javascript';
                res.set({'Content-Type': mimeType,'ETag': etag});
                res.send(200, combinedJS);
            })
        }
    })
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
    var roomID = req.params.roomID
    var objectID = req.params.objectID
    
    var object = Modules.ObjectManager.getObject(roomID, objectID, context);
    var historyEntry = {
        'objectID' : roomID,
        'roomID' : roomID,
        'action' : 'setContent'
    }
    Modules.ObjectManager.history.add(
            new Date().toDateString(), context.user.username, historyEntry)

    if (!object) {
        Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
        return res.send(404, 'Object not found');
    }
    
    var formidable = require('formidable');
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {

        object.copyContentFromFile(files.file.path, function () {

            object.set('hasContent', true);
            object.set('contentAge', new Date().getTime());
            object.set('mimeType', files.file.type);

            /* check if content is inline displayable */
            if (Modules.Connector.isInlineDisplayable(files.file.type)) {

                object.set('preview', true);
                object.persist();

                /* get dimensions */
                Modules.Connector.getInlinePreviewDimensions(roomID, objectID, files.file.type, true, function (width, height) {

                    if (width != false)  object.setAttribute("width", width);
                    if (height != false) object.setAttribute("height", height);

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
    });
});

app.get('/paintings/:roomID/:user/:picID/:hash', function(req, res, next) {
    if (Modules.Connector.getPaintingStream !== undefined) {
        var objStream = Modules.Connector.getPaintingStream(req.params.roomID, req.params.user, context);
        objStream.pipe(res);
        objStream.on("end", function() {
            try {
                res.attachment(req.params.user + '.png');
                res.send(200);
            } catch (err) {
                // console.log("paintings ex: " + err);
            }
        })
    } else {
        res.set('Content-Type', 'text/plain');
        res.send(200, 'Connector does not support PaintingStreams');
    }       
});

module.exports = WebServer;