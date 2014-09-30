/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

var Modules=require('../../server.js');

/**
 * GlobalContainer
 * @class
 * @classdesc Common elements for view and server
 */

var GlobalContainer=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {GlobalContainer}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.GlobalContainer/view.js
 * @param {string} type The type of the object
 */
GlobalContainer.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('width', {type: 'number', min: 410, standard: 475, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

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


	this.registerAttribute('name', {type: 'text', standard: 'GlobalContainer', readonly: true});
	
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
	this.makeSensitive();
	
}

/**
 * TODO
 *
 * @this {GlobalContainer}
 * @see objects/2.GlobalContainer/view.js
 */
GlobalContainer.execute=function(){
	    var destFromURL = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);
		
		this.searchString = destFromURL;
}

/**
 * Changes the name of the object to the given parameter newValue.
 *
 * @this {GlobalContainer}
 * @param {string} newValue
 * @see objects/1.GeneralObject/common.js
 * @see objects/1.GeneralObject/client.js
 */
GlobalContainer.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "GlobalContainer" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}


GlobalContainer.register('GlobalContainer');
GlobalContainer.isCreatable=false;

GlobalContainer.contentURLOnly = false; //content is only accessible via URL

GlobalContainer.category='Container';

module.exports=GlobalContainer;