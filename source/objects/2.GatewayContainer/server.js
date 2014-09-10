/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var async = require("async");
module.exports=theObject;

var TRASH_ROOM = 'trash';
var targets = ['Subroom'];

theObject.getAllGatewayObjects = function(user, cb) {
	
	Modules.Connector.getObjectDataByQuery({type: { $in: targets }, inRoom: {$nin:[TRASH_ROOM] } }, function(data){
	
		var objects = new Array();
	
		var arr = new Array();
		
		var counter = -1;
		
		var funcs = new Array();
	
		for(var i = 0; i<data.length; i++){
			
			objects[i] = data[i];
			
			funcs.push(function(callback){ 
				counter++;
				
				//console.log("call");
				//console.log(objects[counter]);
				//console.log(user);
				
				Modules.RightManager.hasAccess(objects[counter], {username : user}, "enter", function(d){
				
					//console.log("back");
					//console.log(d);
				
					if(d != false){
						callback(null, true);
					}
					else{
						callback(null, false);
					}
				});
			});
		}
			
		async.series(funcs, function(err, results){
			
			//console.log("results");
			//console.log(results);
			
			for(var j = 0; j < results.length; j++){
			
				if(results[j]){
					arr.push(data[j]);
				}
			
			}
			
			cb(arr);
			
		});
	
	});

}


theObject.getAllGatewayObjects.public = true;