/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * HtmlTest
 * @class
 * @classdesc Common elements for view and server
 */

var HtmlTest=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

/**
 * Registers the object.
 *
 * @this {HtmlTest}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
HtmlTest.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
}

HtmlTest.register('HtmlTest');
HtmlTest.isCreatable=true;

HtmlTest.contentURLOnly = false;

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

HtmlTest.restrictedMovingArea = true;
HtmlTest.category='Texts';

module.exports=HtmlTest;