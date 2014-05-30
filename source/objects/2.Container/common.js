/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

var Modules=require('../../server.js');

/**
 * Container
 * @class
 * @classdesc Common elements for view and server
 */

var Container=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {Container}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.Container/view.js
 * @param {string} type The type of the object
 */
Container.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
		
    this.standardData.width=475;
    this.standardData.height=325;

	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
}

/**
 * TODO
 *
 * @this {Container}
 * @see objects/2.Container/view.js
 */
Container.execute=function(){
	
}

/**
 * Changes the name of the object to the given parameter newValue.
 *
 * @this {Container}
 * @param {string} newValue
 * @see objects/1.GeneralObject/common.js
 * @see objects/1.GeneralObject/client.js
 */
Container.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "Container" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
Container.isResizable=function(){
	return false;
}

Container.register('Container');
Container.isCreatable=true;

Container.contentURLOnly = false; //content is only accessible via URL

Container.category='Active';

module.exports=Container;