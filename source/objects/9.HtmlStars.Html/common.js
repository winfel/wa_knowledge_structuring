/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var HtmlStars=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

HtmlStars.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
}

HtmlStars.score = 0; // current filled stars

HtmlStars.register('HtmlStars');
HtmlStars.isCreatable=true;

HtmlStars.contentURLOnly = false;



//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

HtmlStars.restrictedMovingArea = true;
HtmlStars.category='Texts';

module.exports=HtmlStars;