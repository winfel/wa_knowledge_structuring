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

theObject.getAllFileObjects = function(id, cb){

	var fileObjects = new Array();
	
	Modules.Connector.listRooms(function(n, rooms){
		var l = rooms.length;
		var counter = 0;
		var key;
		for(key in rooms){
			Modules.Connector.getInventory(rooms[key].id, true, function(inventory){
				var k;
				for(k in inventory){
					if(inventory[k].type == "File" && inventory[k].inRoom != "trash"){
						fileObjects.push(inventory[k]);
					}
				}
	
				counter++;
	
				if(counter == l){
					fileObjects.push(id);
					var s = JSON.stringify(fileObjects);
					cb(s);
				}
			
			});
		}
	});
}

theObject.getAllFileObjects.public = true;

theObject.changeMainTag = function(d){

	Modules.ObjectManager.getObject(d.room, d.id, true, function(o){
		o.setAttribute('mainTag', d.tag);
	});

}

theObject.changeMainTag.public = true;