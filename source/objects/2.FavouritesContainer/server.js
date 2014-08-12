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

theObject.getAllFavouriteFileObjects = function(conId, userId, cb){

	var fileObjects = new Array();
	var favourites = new Array();
	var connections = Modules.UserManager.connections;
		
	for (var i in connections) {
		if(connections[i].user.id == userId){
			favourites = connections[i].user.favourites;
		}
	}
	
	if(typeof favourites === "undefined"){
		fileObjects.push(conId);
		var t = JSON.stringify(fileObjects);
		cb(t);
		return;
	}
		
	Modules.Connector.listRooms(function(n, rooms){
		var l = rooms.length;
		var counter = 0;
		var key;
		for(key in rooms){
			Modules.Connector.getInventory(rooms[key].id, true, function(inventory){
				var k;
				for(k in inventory){
					if(inventory[k].type == "File" && inventory[k].inRoom != "trash" && favourites.indexOf(inventory[k].id) != -1){
						fileObjects.push(inventory[k]);
					}
				}
	
				counter++;
	
				if(counter == l){
					fileObjects.push(conId);
					var s = JSON.stringify(fileObjects);
					cb(s);
					return;
				}
			
			});
		}
	});
}

theObject.getAllFavouriteFileObjects.public = true;