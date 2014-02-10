/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Polygon
 * @class
 * @classdesc Common elements for view and server
 */

var Polygon=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Polygon.duplicateWithLinkedObjects = false; //duplicate this object if a linked object gets duplicated
Polygon.duplicateLinkedObjects = true; //duplicate linked objects if this object gets duplicated

/**
 * Registers the object (attributes).
 *
 * @this {Polygon}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Polygon.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	// Registering attributes circle

	this.registerAttribute('edges',{type:'number',standard:6,min:3,category:'Appearance'});
	this.registerAttribute('rotation',{type:'number',standard:0,min:0,category:'Appearance'});

}

Polygon.register('Polygon');
Polygon.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
Polygon.moveByTransform = function(){return true;};

module.exports=Polygon;