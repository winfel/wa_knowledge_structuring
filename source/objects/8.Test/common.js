/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js');

/**
 * Test
 * @class
 * @classdesc Common elements for view and server
 */

var Test=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

/**
 * Registers the object (attributes).
 *
 * @this {Test}
 * @see Client/ObjectManager.js
 * @see objects/2.Rectangle/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Test.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeSensitive();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Test.isCreatable=true; 
Test.category = 'Active';


module.exports=Test;