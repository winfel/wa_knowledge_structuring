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

theObject.getAllFileObjects = function(cb){
	var that = this;
	var fileObjects = new Array();
	var containerTag = that.getAttribute('name');

	Modules.Connector.listRooms(function(n, rooms){
		var l = rooms.length-1;
		var counter = 0;
		for(var key in rooms){
			if(rooms[key].id == 'trash') {
				continue;
			}
			Modules.Connector.getInventory(rooms[key].id, true, function(inventory){
				for(var k in inventory){
					if(inventory[k].type == "File" && containerTag == inventory[k].attributes.mainTag){
						fileObjects.push(inventory[k]);
					}
				}

				counter++;

				if(counter == l){
					cb(fileObjects);
				}
			
			});
		}
	});
}

theObject.getAllFileObjects.public = true;

theObject.changeMainTag = function(d){

	Modules.ObjectManager.getObject(d.room, d.id, true, function(o){
		o.setAttribute('mainTag', d.tag);
		o.setAttribute('secondaryTags', []);
	});

}

theObject.changeMainTag.public = true;