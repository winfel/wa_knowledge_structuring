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
	var uw=this.getAttribute('width');
	var uh=this.getAttribute('height');
	var ux=this.getAttribute('x');
	var uy=this.getAttribute('y');
	//var divide = Math.floor(Math.random() * 10)+1;
/*	if(divide == 7|divide == 8|divide == 9|divide == 6){
		questionnaire(object);
		answer(object,ux,uy,uw,uh);
	}
	else{*/
		updateLog(object);
		move(object,ux,uy,uw,uh);
	//}
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};

function questionnaire(object){

    var inventory=object.getRoom().getInventory();
    var questionObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='question') questionObject=candidate;
    }
	
	var insertText=function(question,object){
		var text='What is the meaning of life?';
		question.setContent(text);
	}
	
	if (questionObject){
		insertText(questionObject,object);
	} else {
		object.getRoom().createObject('Textarea',function(err,obj){
			obj.setAttribute('name','question');
			obj.setAttribute('x','40');
			obj.setAttribute('y','200');
			insertText(obj,object);
		});
	}
}
function answer(object,ux,uy,uw,uh){
	var inventory=object.getRoom().getInventory();
    var answerObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='answer') answerObject=candidate;
    }
	var getAnswer=function(answer,object){
		answer.setContent();
	}
	if (answerObject){
		console.log(answerObject.getContentAsString());
	} else {
		object.getRoom().createObject('Textarea',function(err,obj){
			obj.setAttribute('name','answer');
			obj.setAttribute('x','40');
			obj.setAttribute('y','270');
			getAnswer(obj,object);
		});
	}
}

function updateLog(object){
	
    var inventory=object.getRoom().getInventory();
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }
	
	var insertText=function(logger,object){
		logger.setContent(chooseText());
	}
	
	if (loggingObject){
		insertText(loggingObject,object);
	} else {
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
	
function move(object,ux,uy,uw,uh){
	//sleep(Math.floor(Math.random() * 5000)+1000);
	var number = randomNumber(uh);
	object.setAttribute('x',(ux+uw+Math.random()*100) +20);
	object.setAttribute('y',(uy+number));
	
}

function randomNumber(uh) {
    var random = Math.floor(Math.random() * 400) - 200;
    if ((uh==0 & random < 0) | (uh+random <0)) return 0;
    return random;
}


theObject.setContent=function(content,callback){
	
	if ((typeof content) != "object" && content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}

	Modules.Connector.saveContent(this.inRoom, this.id, content, callback, this.context);
	
	this.set('hasContent',!!content);
	this.set('contentAge',new Date().getTime());

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
}
theObject.setContent.public = true;
theObject.setContent.neededRights = {
    write : true
}
