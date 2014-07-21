/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Room
 * @class
 * @classdesc Common elements for view and server
 */

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (attributes).
 *
 * @this {Room}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Room.register=function(type){
	
	var ObjectManager=this.ObjectManager;
	
    // Registering the object
    IconObject=Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this,type);
    
	this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
	this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});

	this.registerAttribute('chatMessages',{hidden: true, readonly:true, standard: []});
    
	//Hide unnecessary attributes (at least for now)
    
    this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
    this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});
	this.registerAttribute('showUserPaintings',{type:"boolean", standard:true, changedFunction: function(object, value) {object.showUserPaintings(value);}});
    
    this.registerAction('Store in Tab-List', function(object) {

    GUI.tabs.addTab(object.getAttribute('name')+" (Room)",object.getAttribute('destination'));
    GUI.tabs.redrawTabContent();

  }, true);
}

/**
 * Calls the method 'loadRoom' in Client/ObjectManager.js by using the id of the room object which called this function.
 *
 * @this {Room}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 */
Room.execute = function() {
	var destination = this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

/**
 * Checks if the desired object is already in the inventory of the room.
 *
 * @this {Room}
 * @see objects/3.Room/client.js
 * @param {object} obj
 * @return {boolean} 
 */
Room.hasObject = function(obj) {
    this.getInventoryAsync(function (inventory) {
        for (var i in inventory) {
            if (inventory[i].id == obj.id) return true;
        }
        return false;
    });
}

/**
 * Returns a string with the room id, user name and user hash.
 *
 * @this {Room}
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 * @see Client/ObjectManager.js
 * @param {string} user
 * @return {string} 
 */
Room.getPaintingURL = function(user) {
	if (!user) user=this.getCurrentUserName();
	
	//maybe it is necessary to add a time here to get rid of cache issues
	
	return "/paintings/"+this.getRoomID()+"/"+user+"/"+ObjectManager.userHash;
}

/**
 * Shows or hides user paintings by calling the methods 'paintingUpdate' (in Client/ObjectManager.js) or 'remove' (in objects/1.GeneralObject/common.js).
 *
 * @this {Room}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {boolean} value
 */
Room.showUserPaintings = function(value)
{
	if ( value )
	{ ObjectManager.paintingUpdate(); }
	else
	{ $('img[id^="userPainting_"]').remove(); }
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

module.exports=Room;