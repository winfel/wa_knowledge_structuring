/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Subroom
 * @class
 * @classdesc Common elements for view and server
 */

var Subroom=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 *
 * @this {Subroom}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Subroom.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	var self=this;
	
	this.registerAction('Follow',function(object){
		
		object.execute();
		
	},true);
	
	this.registerAction('Open in new window',function(object){
		
		object.execute(true);
		
	},true);
	
	this.registerAction('Store in Tab-List', function(object) {
    var destination = object.getAttribute('destination');

    if (!destination) {
      var random = new Date().getTime() - 1296055327011;

      object.setAttribute('destination', random);
      destination = random;
    }

    GUI.tabs.addTab(object.getAttribute('name')+" (Room)",object.getAttribute('destination'),object.id);
    GUI.tabs.redrawTabContent();

  }, true);
}

/**
 * Opens a new room with the help of the attribute 'destination'.
 * If the destination is not set the destination will choose randomly.
 *
 * @this {Subroom}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {boolean} openInNewWindow
 */
 Subroom.execute = function(openInNewWindow) {
    
    var destination = this.getAttribute('destination');
    var that = this;

    // TODO this must be done serverside in the connector
    if (!destination) {
        var random = new Date().getTime() - 1296055327011;        
        this.setAttribute('destination', random.toString());
        destination = random;
        
        GUI.tabs.addTab(this.getAttribute('name')+" (Room)",this.getAttribute('destination'),this.id);
        GUI.tabs.redrawTabContent();
    }

    if (openInNewWindow) {
    	GUI.tabs.addTab(this.getAttribute('name')+" (Room)",this.getAttribute('destination'),this.id);
        GUI.tabs.redrawTabContent();
        window.open(destination);

    } else {

        Modules.RightManager.hasAccess("read", { id: this.id, type: this.type}, GUI.username, function(result) {
          if(result) {
            ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(that.getAttribute('id')));
        }else{
            var audio = new Audio('/guis.common/sounds/cant_touch_this.mp3');
            audio.play();
        }
        });
        
    }
}

Subroom.register('Subroom');
Subroom.isCreatable=true;

Subroom.category='Rooms';

module.exports=Subroom;