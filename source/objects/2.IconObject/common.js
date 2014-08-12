/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * IconObject
 * @class
 * @classdesc Common elements for view and server
 */

var IconObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

IconObject.isCreatable=false;

IconObject.category='Objects';

/**
 * Registers the object (attributes).
 *
 * @this {IconObject}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see common/AttributeManager.js 
 * @see objects/2.IconObject/view.js
 * @param {string} type The type of the object
 */
IconObject.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type); //super call
	
	this.attributeManager.registerAttribute('layer',{hidden: true});
	this.registerAttribute('bigIcon',{type:'boolean',standard:true, changedFunction: function(object) { object.updateIcon(); }});
	this.registerAttribute('verybigIcon',{type:'boolean',standard:false, changedFunction: function(object) { object.updateIcon(); }});
	this.registerAttribute('width',{hidden:true});
	this.registerAttribute('height',{hidden:true});
	this.registerAttribute('fillcolor',{hidden:true});
	//this.registerAttribute('linecolor',{hidden:true});
	//this.registerAttribute('linesize',{hidden:true});
	this.unregisterAction('to back');
	this.unregisterAction('to front');
	
}

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
IconObject.isResizable=function(){
	return false;
}

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
IconObject.moveByTransform = function(){return true;};

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
IconObject.alwaysOnTop = function() {return true;};

IconObject.register('IconObject');

module.exports=IconObject;