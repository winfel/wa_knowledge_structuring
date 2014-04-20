/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Highlight
 * @class
 * @classdesc Common elements for view and server
 */

var Highlight=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object.
 *
 * @this {Highlight}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Highlight.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	this.registerAction('AddMarkup', function(object) {
          
	ObjectManager.createObject("MarkUp",{
			"x":object.getAttribute("x")+object.getAttribute("width")+5,
			"y":object.getAttribute("y")-object.getAttribute("height")
		});
  });

}

Highlight.register('Highlight');
Highlight.isCreatable=true;

module.exports=Highlight;