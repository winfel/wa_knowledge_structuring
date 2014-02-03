/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Paint
 * @class
 * @classdesc Common elements for view and server
 */

var Paint=Object.create(Modules.ObjectManager.getPrototype('ImageObject'));

/**
 * Registers the object (attributes and actions)
 *
 * @this {Paint}
 * @see Client/ObjectManager.js
 * @see objects/2.ImageObject/common.js
 * @see Common/AttributeManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/3.Paint/client.js
 * @param {string} type The type of the object
 */
Paint.register=function(type){
	
	// Registering the object
	
	ImageObject=Modules.ObjectManager.getPrototype('ImageObject');
	ImageObject.register.call(this,type);
	
	this.attributeManager.registerAttribute('width',{hidden: true});
	this.attributeManager.registerAttribute('height',{hidden: true});

	this.attributeManager.registerAttribute('fillcolor',{hidden: true});
	this.attributeManager.registerAttribute('linecolor',{hidden: true});
	this.attributeManager.registerAttribute('linesize',{hidden: true});

	this.registerAction('Edit',function(obj){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
}

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
Paint.isResizable=function(){
	return true;
}

Paint.removeObjectWithoutContent = true;

Paint.register('Paint');
Paint.isCreatable=false;

Paint.category='Paintings';

module.exports=Paint;