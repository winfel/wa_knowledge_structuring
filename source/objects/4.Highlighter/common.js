/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Highlighter
 * @class
 * @classdesc Common elements for view and server
 */

var Highlighter=Object.create(Modules.ObjectManager.getPrototype('Paint'));



Highlighter.register('Highlighter');
Highlighter.isCreatable=false;

Highlighter.category='Highlighters';

module.exports=Highlighter;