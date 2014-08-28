/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

var Modules=require('../../server.js');

/**
 * ReferenceContainer
 * @class
 * @classdesc Common elements for view and server
 */

var ReferenceContainer=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {ReferenceContainer}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.ReferenceContainer/view.js
 * @param {string} type The type of the object
 */
ReferenceContainer.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
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


	this.registerAttribute('name', {type: 'text', standard: 'References', changedFunction: function(object, value) {
		var obj = {id:object.id, name:value}; 
		object.rename(value);
		
    }});
	
	//this.registerAttribute('sortingCriterion', {type: 'text', standard: 'By Name', hidden: true});
	//this.registerAttribute('sortingOrder', {type: 'text', standard: 'From A to Z', hidden: true});
	//this.registerAttribute('searchString', {type: 'text', hidden: true});
	//this.registerAttribute('searchByName', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchByTag', {type: 'boolean', hidden: true, standard: false});
	//this.registerAttribute('searchForPDF', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchForHTML', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchForImage', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchForAudio', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchForVideo', {type: 'boolean', hidden: true, standard: true});
	//this.registerAttribute('searchForText', {type: 'boolean', hidden: true, standard: true});
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
}

/**
 * TODO
 *
 * @this {ReferenceContainer}
 * @see objects/2.ReferenceContainer/view.js
 */
ReferenceContainer.execute=function(){

}

/**
 * Changes the name of the object to the given parameter newValue.
 *
 * @this {ReferenceContainer}
 * @param {string} newValue
 * @see objects/1.GeneralObject/common.js
 * @see objects/1.GeneralObject/client.js
 */
ReferenceContainer.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "References" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}


ReferenceContainer.register('ReferenceContainer');
ReferenceContainer.isCreatable=true;

ReferenceContainer.contentURLOnly = false; //content is only accessible via URL

ReferenceContainer.category='Active';
ReferenceContainer.menuItemLabel = 'Reference container';

module.exports=ReferenceContainer;