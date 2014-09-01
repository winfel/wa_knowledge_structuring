/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

var TRASH_ROOM = 'trash';
var p = 'PaperSpace';
var s = 'Subroom';

theObject.getAllGatewayObjects = function(cb) {
	
	Modules.Connector.getObjectDataByQuery({type: { $in: [ p, s ] }, inRoom: {$nin:[TRASH_ROOM] } }, cb);
	
}


theObject.getAllGatewayObjects.public = true;