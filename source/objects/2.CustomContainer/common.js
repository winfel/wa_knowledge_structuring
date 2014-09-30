/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

var Modules=require('../../server.js');

/**
 * CustomContainer
 * @class
 * @classdesc Common elements for view and server
 */

var CustomContainer=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {CustomContainer}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.CustomContainer/view.js
 * @param {string} type The type of the object
 */
CustomContainer.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.makeSensitive();
	
	this.registerAttribute('width', {type: 'number', min: 420, standard: 475, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

      if (object.resizeProportional()) {
        object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
      }

      return true;

    }});

  this.registerAttribute('height', {type: 'number', min: 200, standard: 325, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

      if (object.resizeProportional()) {
        object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
      }

      return true;

    }});


	this.registerAttribute('name', {type: 'text', standard: 'CustomContainer', changedFunction: function(object, value) {
		var obj = {id:object.id, name:value}; 
		object.rename(value);
		
    }});
	
	
	this.registerAttribute('files', {type: 'list', multiple: true, hidden: true});
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
}

/**
 * TODO
 *
 * @this {CustomContainer}
 * @see objects/2.CustomContainer/view.js
 */
CustomContainer.execute=function(){

}

/**
 * Changes the name of the object to the given parameter newValue.
 *
 * @this {CustomContainer}
 * @param {string} newValue
 * @see objects/1.GeneralObject/common.js
 * @see objects/1.GeneralObject/client.js
 */
CustomContainer.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "CustomContainer" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}


CustomContainer.register('CustomContainer');
CustomContainer.isCreatable=true;

CustomContainer.contentURLOnly = false; //content is only accessible via URL

CustomContainer.category='Container';
CustomContainer.menuItemLabel = 'custom.container';

module.exports=CustomContainer;