/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Discussion
 * @class
 * @classdesc Common elements for view and server
 */

var Discussion=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes).
 *
 * @this {Discussion}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.Discussion/view.js 
 * @param {string} type The type of the object
 */
Discussion.register=function(type){
	var that = this;
    // Registering the object
    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);
    
    this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
    this.registerAttribute('font-size',{type:'fontsize',min:10,standard:12,unit:'px',category:'Appearance'});
    this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance'});

    this.standardData.fillcolor='rgb('+240+','+240+','+240+')';
    this.standardData.width=200;
    this.standardData.height=100;

    this.registerAttribute('linesize',{hidden: true});
    this.registerAttribute('linecolor',{hidden: true});

    this.registerAttribute("show_embedded",{
        hidden: true,
        changedFunction: function(object, value) {
            object.switchStateView();
        }
    })

    this.registerAttribute("discussionTitle",{
        hidden: true,
        changedFunction: function(object, value) {
            object.updateHeading(value);
        }
    })

}

/**
 * Changes the size of the object depending on whether the object is embedded or not.
 *
 * @this {Discussion}
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.Discussion/view.js 
 */
Discussion.execute=function(){
    if(!this.getAttribute("show_embedded")){
        this.switchState();
    }
}

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
Discussion.moveByTransform = function(){
   return false
}

Discussion.isCreatable=true;
Discussion.restrictedMovingArea = true;
Discussion.contentURLOnly = false;
Discussion.category='Paint Objects';

Discussion.register('Discussion');

module.exports=Discussion;
