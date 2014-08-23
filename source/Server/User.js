/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 @class User
*/

"use strict";

/**
*	@constructor
*	@param UserManager
*/
var User=function(UserManager){
	
	this.username=false;
	this.home=false;
	this.preferredLanguage = false;
}

module.exports=User;