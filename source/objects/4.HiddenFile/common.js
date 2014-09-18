/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * HiddenFile
 * @class
 * @classdesc Possibility to store additional file with content without bothering the users with new objects
 */

var HiddenFile=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {HiddenFile}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see Client/guis.common/javascript/1.svg.js
 * @see Client/guis.common/javascript/0.GUI.js
 * @see objects/1.GeneralObject/view.js
 * @see objects/1.GeneralObject/client.js
 * @param {string} type The type of the object
 */
HiddenFile.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('mimeType',{type:'text',standard:'text/plain'});
	this.registerAttribute('belongsTo',{type:'text',standard:'text/plain'}); // object id
	this.registerAttribute('highlights', {type: 'text', standard: ''});
	this.registerAttribute('preview',{type:'boolean',standard:false,category:'Basic',hidden:true});

}

HiddenFile.register('HiddenFile');
HiddenFile.isGraphical = false;
HiddenFile.isCreatable = false;
HiddenFile.duplicateWithLinkedObjects = false;

module.exports=HiddenFile;