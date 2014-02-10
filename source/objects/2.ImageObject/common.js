/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * ImageObject
 * @class
 * @classdesc Common elements for view and server
 */

var ImageObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes).
 *
 * @this {ImageObject}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
ImageObject.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('mimeType',{type:'text',standard:'image/png',readonly:true});
	
}

/**
 * Calls 'uploadFile' in main.js. 
 *
 * @this {ImageObject}
 * @see Client/guis/desktop/main.js
 * @see objects/1.GeneralObject/common.js
 */
ImageObject.execute=function(){
	
	var that=this;
	
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "please select an image"));

}

/**
 * Returns always true. 
 *
 * @return {boolean} true
 */
ImageObject.isProportional=function(){
	return true;
}

/**
 * Returns always true. 
 *
 * @return {boolean} true
 */
ImageObject.resizeProportional=function(){
	return true;
}

/**
 * Checks if the object is resizeable (not resizeable without content).
 *
 * @this {ImageObject}
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 * @return {boolean} 
 */
ImageObject.isResizable=function(){
	if (this.hasContent() == false) return false;
	return GeneralObject.isResizable.call(this);
}

ImageObject.register('ImageObject');
ImageObject.isCreatable=false;

/**
 * Returns always true. 
 *
 * @return {boolean} true
 */
ImageObject.moveByTransform = function(){return true;};

ImageObject.category='Images';

module.exports=ImageObject;