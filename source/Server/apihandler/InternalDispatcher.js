/**
* @class InternalDispatcher
* @classdesc
 * InternalDispatcher is used to provide an API for
 * Plugins in the same NodeJS process.
 *
 *@requires ./EventBus
 *@requires ./controllers/RoomController
 *@requires ./controllers/ObjectController
 *@requires lodash JavaScript utility library
 */
'use strict';

var InternalDispatcher = {};
var Modules = false;
var _ = require('lodash');

/**
* 
* @function init 
* @param {object} theModules Associative array containing all modules loaded by require
*/
InternalDispatcher.init = function(theModules){
	Modules = theModules;

	Modules.EventBus.on("copyRoom", function(data){
		data.objects = "ALL";

		Modules.RoomController.duplicateRoom(data, data.context, data.callback);
	});

    Modules.EventBus.on("createObject", function(data){
        Modules.ObjectController.createObject(data, data.context, data.callback);
    });
    
    Modules.EventBus.on('pdfAdded', function(data){
		Modules.PdfEdit.convertToHtml(data);
    });
};


module.exports = InternalDispatcher;