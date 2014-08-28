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

theObject.getAllReferenceFileObjects = function(conId, name, cb){

	var fileObjects = new Array();
	var references = new Array();
	
	var dat = {
		destination : name,
		key :	"references",
	};	
		
	Modules.UserManager.getDataOfSpaceWithDestServerSide(dat, function(d){
		
		if(d == "error"){
			
		}
		else{
			references = d[0].value;
		}
	
		if(typeof references === "undefined" || references.length == 0){
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
						if(inventory[k].type == "File" && inventory[k].inRoom != "trash" && references.indexOf(inventory[k].id) != -1){
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
	});
}

theObject.getAllReferenceFileObjects.public = true;