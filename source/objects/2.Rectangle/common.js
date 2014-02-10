/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Rectangle
 * @class
 * @classdesc Common elements for view and server
 */

var Rectangle=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object.
 *
 * @this {Rectangle}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Rectangle.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

}

Rectangle.register('Rectangle');
Rectangle.isCreatable=true;

module.exports=Rectangle;