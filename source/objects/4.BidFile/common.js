/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * BidFile
 * @class
 * @classdesc Common elements for view and server
 */

var BidFile=Object.create(Modules.ObjectManager.getPrototype('File'));

/**
 * Registers the object.
 *
 * @this {BidFile}
 * @see Client/ObjectManager.js
 * @see objects/3.File/common.js
 * @param {string} type The type of the object
 */
BidFile.register=function(type){
	
	// Registering the object
	
	File=Modules.ObjectManager.getPrototype('File');
	File.register.call(this,type);
	

	
}


BidFile.register('BidFile');
BidFile.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
BidFile.moveByTransform = function(){return true;};

BidFile.category='Files';

module.exports=BidFile;