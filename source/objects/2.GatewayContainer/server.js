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

theObject.getAllGatewayObjects = function(user, cb) {
	
	Modules.Connector.getObjectDataByQuery({type: { $in: [ p, s ] }, inRoom: {$nin:[TRASH_ROOM] } }, function(data){
	
		var arr = new Array();
	
		for(var key in data){
			
			var o = {
				id : data[key].attributes.id,
				type : data[key].type
			}
			
			Modules.RightManager.hasAccess("read", o, user, function(d){
				
				if(d != false){
					console.log("push");
					arr.push(data[key]);
				}
			
			})
			
		}
	
		cb(arr);
	
	});
	
}


theObject.getAllGatewayObjects.public = true;