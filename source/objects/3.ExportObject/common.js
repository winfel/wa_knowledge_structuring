/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * ExportObject
 * @class
 * @classdesc Common elements for view and server
 */

var ExportObject=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {ExportObject}
 * @see objects/2.IconObject/common.js
 * @see objects/2.IconObject/view.js
 * @see objects/1.GeneralObject/view.js
 * @see objects/3.ExportObject/client.js
 * @see objects/1.GeneralObject/client.js
 * @param {string} type The type of the object
 */
ExportObject.register = function(type) {

    // Registering the object

    IconObject = Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this, type);

    this.makeSensitive();

    this.registerAttribute('exportFormat', {type: 'selection', standard: 'text', 
        options: [ 'text', 'pdf', 'html', 'image_png', 'image_jpg', 'image_svg' ], category: 'Basic'});
};

ExportObject.register('ExportObject');
ExportObject.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
ExportObject.moveByTransform = function(){return true;};

ExportObject.category='Active';

module.exports=ExportObject;