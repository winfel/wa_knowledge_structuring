/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;


theObject.onEnter=function(object,oldData,newData){
    console.log('onEnter' +object);
};

theObject.onClick =function(object, oldData, newData){

}