/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var ActiveObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

ActiveObject.register('ActiveObject');
ActiveObject.category = 'Active';
ActiveObject.isCreatable=false;

module.exports=ActiveObject;