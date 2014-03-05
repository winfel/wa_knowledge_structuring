/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

var Modules = require('../../server.js');

/**
 * PaperObject
 * 
 * @class
 * @classdesc Common elements for view and server
 */

var PaperObject = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperObject.register = function(type) {

    // Registering the object
    IconObject = Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this, type);
    
    this.registerAttribute('isMain', {type:'boolean', hidden:true});
    this.registerAttribute('contentType', {type:'text', value:"MUI"});
    this.registerAttribute('bigIcon',{hidden:true});
}

PaperObject.register('PaperObject');
PaperObject.isCreatable = true;

PaperObject.category = 'Paper';

module.exports = PaperObject;