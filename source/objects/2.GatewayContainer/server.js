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
var p = 'PaperSpace';
var s = 'Subroom';

theObject.getAllGatewayObjects = function(user, cb) {
	
	Modules.Connector.getObjectDataByQuery({type: { $in: [ p, s ] }, inRoom: {$nin:[TRASH_ROOM] } }, function(data){
	
		var objects = new Array();
	
		var arr = new Array();
		
		var counter = -1;
		
		var funcs = new Array();
	
		for(var i = 0; i<data.length; i++){
			
			var o = {
				id : data[i].attributes.id,
				type : data[i].type
			}
			
			objects[i] = o;
			
			funcs.push(function(callback){ 
				counter++;
				Modules.RightManager.hasAccess("read", objects[counter], {username : user}, function(d){
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