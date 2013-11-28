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

theObject.onLeave=function(object,oldData,newData){
	};

theObject.onEnter=function(object,oldData,newData){
	updateLog(object);
	move(object);
	//setTimeout("move(object)",2000);
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};

function updateLog(object){
	
    var inventory=object.getRoom().getInventory();
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }
	
	var insertText=function(logger,object){
		var text=chooseText();
		logger.setContent(text);
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

function chooseText(){
	var texts = ["No chance", "Not with me", "PUT IT OUT", "Oh no! No, no no, no.", "Go away, leave me empty."]
	return texts[Math.floor(Math.random() * texts.length)];
}

function sleep(ms)
{
	var dt = new Date();
	dt.setTime(dt.getTime() + ms);
	while (new Date().getTime() < dt.getTime());
}
	
function move(object){
	var uw=theObject.getAttribute('width');
	var uh=theObject.getAttribute('height');
	var x=object.getAttribute('x');
	var y=object.getAttribute('y');
	object.setAttribute('x',(x+uw)*1.5);
	object.setAttribute('y',(y+uh)*1.5);
}