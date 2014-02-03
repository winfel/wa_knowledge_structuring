/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Button
 * @class
 * @classdesc Common elements for view and server
 */

var Button = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes).
 *
 * @this {Button}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
Button.register = function (type) {
	GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this, type);

	this.registerAttribute('linesize', {hidden: true});
	this.registerAttribute('linecolor', {hidden: true});
	this.registerAttribute('fillcolor', {hidden: true});
	this.registerAttribute('width', {hidden: true});
	this.registerAttribute('height', {hidden: true});
	this.registerAttribute('event', {type: 'text', standard: '', category: 'Selection'});
}

Button.register('Button');
Button.isCreatable = true;

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
Button.moveByTransform = function () {
	return false;
}

/**
 * Returns always false.
 *
 * @return {boolean} false
 */
Button.isResizable=function(){
	return false;
}

module.exports = Button;
