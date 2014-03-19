/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Writer=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Writer.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('paper', {type:'text', standard:'[somepaperid]'});
	
	this.standardData.width=210*3;
	this.standardData.height=297*3;
	
	this.registerAction('De/Activate', function()
	{
		alert('Just deactive the embedded Etherpad.');
	}, true);
}

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

Writer.restrictedMovingArea = true;
Writer.isCreatable=true;
Writer.category='Texts';

Writer.register('Writer');

module.exports=Writer;