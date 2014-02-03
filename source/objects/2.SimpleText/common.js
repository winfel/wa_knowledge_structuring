/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * SimpleText
 * @class
 * @classdesc Common elements for view and server
 */

var SimpleText=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {SimpleText}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.SimpleText/view.js
 * @see Common/AttributeManager.js
 * @param {string} type The type of the object
 */
SimpleText.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,max:80,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('font-color', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});

    this.registerAttribute('rotation', {type:'number', category: 'Dimensions'});
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);

	
}

/**
 * Calls the method 'editText' in SimpleText/view.js.
 *
 * @this {SimpleText}
 * @see objects/2.SimpleText/view.js
 */
SimpleText.execute=function(){
	
	this.editText();
	
}

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
SimpleText.isResizable=function(){
	return false;
}

/**
 * Changes the name of the object to the given parameter newValue.
 *
 * @this {SimpleText}
 * @param {string} newValue
 * @see objects/1.GeneralObject/common.js
 * @see objects/1.GeneralObject/client.js
 */
SimpleText.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "SimpleText" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

SimpleText.register('SimpleText');
SimpleText.isCreatable=true;

SimpleText.contentURLOnly = false; //content is only accessible via URL

SimpleText.content='Neuer Text';

SimpleText.category='Texts';

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
SimpleText.moveByTransform = function(){return true;};

/**
 * Sets an initial content ('No text yet!').
 *
 * @this {SimpleText}
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 */
SimpleText.justCreated=function(){
	this.setContent(this.translate(this.currentLanguage, 'No text yet!'));
}

module.exports=SimpleText;