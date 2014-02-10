/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Arrow
 * @class
 * @classdesc Common elements for view and server
 */

var Arrow=Object.create(Modules.ObjectManager.getPrototype('Line'));

/**
 * Registers the object (attributes).
 *
 * @this {Arrow}
 * @see Client/ObjectManager.js
 * @see objects/2.Line/common.js
 * @see Common/AttributeManager.js
 * @param {string} type The type of the object
 */
Arrow.register=function(type){
	
	// Registering the object
	
	Line=Modules.ObjectManager.getPrototype('Line');
	Line.register.call(this,type);
	
	
	this.attributeManager.registerAttribute('markerStart',{type:'boolean',standard:false,category:'Appearance'});
	this.attributeManager.registerAttribute('markerEnd',{type:'boolean',standard:true,category:'Appearance'});
	
}

Arrow.register('Arrow');
Arrow.isCreatable=true;

module.exports=Arrow;