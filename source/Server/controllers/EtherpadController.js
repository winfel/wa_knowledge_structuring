/**
 * Provides API methods for Object related tasks
 */

"use strict";

var api = require('etherpad-lite-client'),
	etherpad = api.connect({
		apikey: global.config.etherpadlite.apikey,
		host: global.config.etherpadlite.host,
		port: global.config.etherpadlite.port,
	});

var EtherpadController = {};

var Modules = false;

EtherpadController.init = function(theModules) {
	Modules = theModules;
};

EtherpadController.convertToPdf = function(html, callback) {
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'webArena_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err){
		if (err) throw err;

		// the temporary html file is written, now call wkhtmltopdf on it
		child = execf(global.config.wkhtmltopdf.path,
		[
			tmpFilename + '.html',
			tmpFilename + '.pdf',
		], // args
		{
			cwd:ostmpdir, 
		}, // options
		function (error, stdout, stderr) {
			// wkhtmltopdf has finished
			//console.log('stdout: ' + stdout);
			//console.warn('stderr: ' + stderr);
			if (error !== null) {
				console.error('exec error: ' + error);
				return;
			}

			// read temporary pdf file again
			fs.readFile(ostmpdir + '/' + tmpFilename + '.pdf', function (err, data) {
				if (err) throw err;
				// pdf is read
				callback(data);
			});

		});
	});
}

EtherpadController.convertToImage = function(html, imgtype, callback) {
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'webArena_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err){
		if (err) throw err;


		// the temporary html file is written, now call wkhtmltoimage on it
		child = execf('C:/Program Files/wkhtmltopdf/bin/wkhtmltoimage',
		[
			//'-f ' + imgtype,
			tmpFilename + '.html',
			tmpFilename + '.' + imgtype,
		], // args
		{
			cwd:ostmpdir, 
		}, // options
		function (error, stdout, stderr) {
			// wkhtmltoimage has finished
			//console.log('stdout: ' + stdout);
			//console.warn('stderr: ' + stderr);
			if (error !== null) {
				console.error('exec error: ' + error);
				return;
			}

			// read temporary img file again
			fs.readFile(ostmpdir + '/' + tmpFilename + '.' + imgtype, function (err, data) {
				if (err) throw err;
				// img is read
				callback(data);
			});
		});
	});
}

EtherpadController.pad = etherpad;

module.exports = EtherpadController;

/*
	etherpad.createGroup(function(error, data) {
		if(error) console.error('Error creating group: ' + error.message)
		else console.log('New group created: ' + data.groupID)
	})
























var fs = require('fs');
var _ = require('lodash');
var async = require("async");
var Q = require("q");

var ObjectController = {};

var Modules = false;
var ObjectManager = false;

ObjectController.init = function(theModules) {
  Modules = theModules;
  ObjectManager = Modules.ObjectManager;
};

ObjectController.createObject = function(data, context, callback) {

  var roomID = data.roomID;
  var type = data.type;
  var attributes = data.attributes;
  var content = data.content;

  var afterRightsCheck = function(err, mayInsert) {
    if (err) {
      callback(err, null);
    } else {
      if (mayInsert) {
        Modules.ObjectManager.createObject(roomID, type, attributes, content, context, function(err, obj) {
          // we are only interested in the object id.
          callback(err, obj.id);
        });
      } else {
        callback(new Error("No rights to write into room: " + roomID), null);
      }
    }
  };

  Modules.Connector.mayInsert(roomID, context, afterRightsCheck)
};

ObjectController.executeServersideAction = function(data, context, cb) {
  var roomID = data.roomID;
  var objectID = data.objectID;

  if (!roomID) {
    cb(new Error("Room id is missing."), null);
    return;
  }

  var serverFunction = data.fn.name;
  var serverFunctionParams = data.fn.params;

  var probableTransactionInfo = serverFunctionParams[serverFunctionParams.length - 1];
  if (probableTransactionInfo && probableTransactionInfo.transactionId) {
    serverFunctionParams.pop();
  }

  Modules.EventBus.emit("room::" + roomID + "::" + objectID, data);

  var responseCallback = function(data) {
    cb(null, data);
  };

  var object = ObjectManager.getObject(roomID, objectID, context);

  serverFunctionParams.push(responseCallback);

  var fn = object[serverFunction];

  if (!fn.public) {
    cb(new Error("Tried to access non-public method. Request will be aborted."), null);
  }

  var callbackStack = [];

  //check needed rights
  if (fn.neededRights && fn.neededRights.write)
    callbackStack.push(function(cb) {
      Modules.Connector.mayWrite(roomID, objectID, context, cb);
    });
  if (fn.neededRights && fn.neededRights.read)
    callbackStack.push(function(cb) {
      Modules.Connector.mayRead(roomID, objectID, context, cb);
    });
  if (fn.neededRights && fn.neededRights.delete)
    callbackStack.push(function(cb) {
      Modules.Connector.mayDelete(roomID, objectID, context, cb);
    });

  async.series(callbackStack, function(err, res) {
    if (err) {
      console.log(err);
      cb(err, null);
      return;
    }
    if (serverFunction === "setAttribute") {
      var oldValue = object.getAttribute(serverFunctionParams[0]);
      var historyEntry = {
        'action': "setAttribute",
        'objectID': objectID,
        'roomID': roomID,
        'attribute': serverFunctionParams[0],
        'old': oldValue,
        'new': serverFunctionParams[1]
      };

      ObjectManager.history.add(probableTransactionInfo.transactionId, probableTransactionInfo.userId, historyEntry);
    } else if (serverFunction === "setContent") {
      var historyEntry = {
        'objectID': roomID,
        'roomID': roomID,
        'action': 'setContent'
      };
      ObjectManager.history.add(
              new Date().toDateString(), context.user.username, historyEntry
              );
    }
    fn.apply(object, serverFunctionParams);
  });
};

module.exports = ObjectController;
*/
