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

/**
* @fucntion onEnter
* @param object
* @param oldData
* @param newData
*/
theObject.onEnter=function(object,oldData,newData){
	
	var data = {
		objectId : object.id,
		ContainerId : theObject.standardData.id
	};
	
	Modules.SocketServer.sendToSocket(object.context.socket, 'newObjectForCustomContainer', data);
			
	this.fireEvent('enter',object);		
			
 }