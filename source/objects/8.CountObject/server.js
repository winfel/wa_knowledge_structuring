/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

var count = 0;

theObject.onLeave=function(object,oldData,newData){

	var inventory=object.getRoom().getInventory();
    
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }
	
	var loggertext = loggingObject.getContentAsString();
	count = parseInt(loggertext);

	count--;
	console.log('onLeave' +object);
	updateLog(object);
};

theObject.onEnter=function(object,oldData,newData){

	var inventory=object.getRoom().getInventory();
    
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }
	
	var loggertext = loggingObject.getContentAsString();
	count = parseInt(loggertext);

	count++;
	console.log('onEnter' +object);
	updateLog(object);
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};


function insertText(logger,object){
	console.log('insertText '+logger+' '+object);
	var text=count.toString();
	logger.setContent(text);
	}


function updateLog(object){
	console.log('updateLog '+object);

    var inventory=object.getRoom().getInventory();
    
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }

	
	if (loggingObject){
		insertText(loggingObject,object);
	} else {
		console.log('Creating logger');
		object.getRoom().createObject('Textarea',function(err,obj){
			obj.setAttribute('name','logger');
			insertText(obj,object);
		});
	}
}