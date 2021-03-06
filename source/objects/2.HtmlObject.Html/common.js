/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * HtmlObject
 * @class
 * @classdesc Common elements for view and server
 */

var HtmlObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object.
 *
 * @this {HtmlObject}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
HtmlObject.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
}

HtmlObject.register('HtmlObject');


//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

HtmlObject.restrictedMovingArea = true;
HtmlObject.isCreatable=false;

module.exports=HtmlObject;