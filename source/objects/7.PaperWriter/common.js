/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

var Modules = require('../../server.js');

/**
 * PaperWriter
 * 
 * @class
 * @classdesc Common elements for view and server
 */

var PaperWriter = Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

/**
 * Registers the object.
 * 
 * @this {PaperWriter}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperWriter.register = function(type) {

    // Registering the object
    HtmlObject = Modules.ObjectManager.getPrototype('HtmlObject');
    HtmlObject.register.call(this, type);
    
    this.registerAttribute('paperId',{type:'string', standard: "changeit"});

}

PaperWriter.register('PaperWriter');
PaperWriter.isCreatable = true;

PaperWriter.contentURLOnly = false;

// set restrictedMovingArea to true, if you want to enable interface interaction
// within
// the HTML element. This is useful if you want to use buttons, links or even
// canvas elements.
// when set to true, you must specify an area where the object can be moved.
// This area must
// have its class set to "moveArea". Set restrictedMovingArea to false if you
// use the HTML
// element for diplaying purposes only.

PaperWriter.restrictedMovingArea = true;
PaperWriter.category = 'Paper';

module.exports = PaperWriter;