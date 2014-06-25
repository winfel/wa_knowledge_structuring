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

	this.registerAttribute('name', {type: 'text', standard: 'Container', changedFunction: function(object, value) {
		var obj = {id:object.id, name:value}; 
		object.rename(value);
		
    }});
	
	this.registerAttribute('sortingCriterion', {type: 'text', standard: 'By Name', hidden: true});
	this.registerAttribute('sortingOrder', {type: 'text', standard: 'From A to Z', hidden: true});
	this.registerAttribute('searchString', {type: 'text', hidden: true});
	this.registerAttribute('searchBy', {type: 'text', hidden: true});
	this.registerAttribute('searchFor', {type: 'text', hidden: true});
	
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


Container.register('Container');
Container.isCreatable=true;

Container.contentURLOnly = false; //content is only accessible via URL

Container.category='Active';

module.exports=Container;