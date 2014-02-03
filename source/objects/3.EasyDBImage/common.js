/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * EasyDBImage
 * @class
 * @classdesc Common elements for view and server
 */

var EasyDBImage=Object.create(Modules.ObjectManager.getPrototype('ImageObject'));

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
EasyDBImage.isResizable=function(){
    //if (this.getAttribute('remote_url') == false) return false;
    return true;
}

/**
 * Registers the object (attributes).
 *
 * @this {EasyDBImage}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
EasyDBImage.register=function(type){
    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);
    var that = this;

    var notNull = function(attrName){
        return function(object){
            if(object.get(attrName) && object.get(attrName) !== "null"){
                return object.get(attrName)
            } else {
                return "";
            }
        }
    }

    this.registerAttribute('easydbtitel',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbtitel")});
    this.registerAttribute('easydbkuenstler',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbkuenstler")});

    this.registerAttribute('easydbstandort',{type:'metadata', category:'Meta Data',  getFunction: notNull("easydbstandort")});
    this.registerAttribute('easydbdargestellter_ort',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbdargestellter_ort")});
    this.registerAttribute('easydbdatierung',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbdatierung")});


    this.registerAttribute('linesize',{hidden: true});
    this.registerAttribute('linecolor',{hidden: true});
    this.registerAttribute('fillcolor',{hidden: true});

    this.registerAttribute('name',{hidden: true});

    
}

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;
EasyDBImage.restrictedMovingArea = false;
EasyDBImage.category='Images';

module.exports=EasyDBImage;

