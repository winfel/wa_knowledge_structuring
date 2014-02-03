/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Ellipse
 * @class
 * @classdesc Common elements for view and server
 */

var Ellipse=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Ellipse.register('Ellipse');
Ellipse.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
Ellipse.moveByTransform = function(){return true;}

module.exports=Ellipse;