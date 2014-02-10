/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * BidExit
 * @class
 * @classdesc Common elements for view and server
 */

var BidExit=Object.create(Modules.ObjectManager.getPrototype('BidFile'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {BidExit}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/4.BidFile/client.js
 * @param {string} type The type of the object
 */
BidExit.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('fillcolor',{hidden: true});
	
	this.registerAction(this.translate(this.currentLanguage, "Change destination"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	});
	
	this.registerAction('Follow',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.execute();
			
		}
		
	},true);
	
}

/**
 * Loads a new room by calling the method 'loadRoom' (in Client/ObjectManager.js) with the help of the attribute 'destination'.
 * If the destination is not set the method 'upload' (in objects/4.BidFile/client.js) is called.
 *
 * @this {BidExit}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/4.BidFile/client.js
 * @return {}
 */
BidExit.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.upload();
	}
	
	ObjectManager.loadRoom(destination);
	
}


BidExit.register('BidExit');
BidExit.isCreatable=true;

//BidExit.moveByTransform = function(){return true;};

BidExit.category='Rooms';

module.exports=BidExit;