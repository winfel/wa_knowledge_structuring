/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * Line
 * @class
 * @classdesc Common elements for view and server
 */

var Line=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * Registers the object (attributes).
 *
 * @this {Line}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @see common/AttributeManager.js
 * @param {string} type The type of the object
 */
Line.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('width',{type:'number',min:0,standard:100,unit:'px',category:'Dimensions'});
	this.registerAttribute('height',{type:'number',min:0,standard:100,unit:'px',category:'Dimensions'});
	
	this.registerAttribute('direction',{type:'number',standard:1,readonly:false,hidden:true});
	
    this.attributeManager.registerAttribute('linesize',{type:'number',min:4,standard:4,category:'Appearance'});
    this.attributeManager.registerAttribute('linestyle',{type:'selection',standard:'stroke',options:['stroke','dotted','dashed'],category:'Appearance'});
	this.attributeManager.registerAttribute('linecolor',{standard:'black'});
	

	this.registerAttribute('fillcolor',{hidden:true});

}

Line.register('Line');
Line.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
Line.moveByTransform = function() { return true; }

/**
 * Returns if control is allowed in a specific direction.
 *
 * @this {Line}
 * @see objects/1.GeneralObject/common.js
 * @param {string} control The desired direction (xy1, xy2, xy3 or xy4)
 * @return {boolean} 
 */
Line.controlIsAllowed = function(control) {
	var list = {
		"xy1" : (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
		"xy2" : (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4),
		"xy3" : (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
		"xy4" : (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4)
	};
	return (list[control]);
}

Line.ignoreMinDimensions = true;



module.exports=Line;