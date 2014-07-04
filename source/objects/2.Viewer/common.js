/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Viewer=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Viewer.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
  this.registerAttribute('file', {type:'text', standard:'[somefileid]'});
	this.registerAttribute('highlights', {type:'text', standard:'', changedFunction: function(object, value) {
		object.loadHighlights();
	}});
	
	this.standardData.width=210*3;
	this.standardData.height=297*3;
	
};

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

Viewer.restrictedMovingArea = true;
Viewer.isCreatable=true;
Viewer.category='Texts';

Viewer.register('Viewer');

module.exports=Viewer;