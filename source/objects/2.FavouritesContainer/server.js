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
var f = 'File';

/**
* @function getAllFileObjects
* @param cb
*/
theObject.getAllFileObjects = function(cb) {
    
	Modules.Connector.getObjectDataByQuery({type: f, inRoom: {$nin:[TRASH_ROOM] } }, cb);
	
}


theObject.getAllFileObjects.public = true;


/**
* @function onEnter
* @param object
* @param oldData
* @param newData
*/
theObject.onEnter=function(object,oldData,newData){
	
	var data = {
		destination : object.context.user.username,
		key : "favourites"
	}
	
	Modules.UserManager.getDataOfSpaceWithDestServerSide(data, function(d) {
	
		var arr = new Array();
						
		if (d != "error") {
			var key;
			for(key in d[0].value) {
				arr.push(d[0].value[key]);
			}
			Modules.UserManager.removeDataOfSpaceWithDestServerSide(data);
		}
		
		if (arr.indexOf(object.id) == -1) {
			arr.push(object.id);
		}
				
		data.value = arr;
				
		setTimeout(function(){ 
			Modules.UserManager.setDataOfSpaceWithDestServerSide(data);
		
			var t = {
				type : "favourite",
				objectId : object.id,
				ContainerId : theObject.standardData.id
			};
	
			Modules.SocketServer.sendToSocket(object.context.socket, 'newObjectForContainer', t);
		
		}, 500);
	});
	
	this.fireEvent('enter',object);		
	
 }