"use strict";
/**
* @class Callbackcollector
* @function call
* @function checkCallback
* @param total
* @param callback
*/
var CallbackCollector = function(total, callback){
	
	var self = this;
	
	this.total = total;
	this.callback = callback;
	
	this.counter = 0;
	
	this.call = function() {
		self.counter++;
		self.checkCallback();
	}
	
	this.checkCallback = function() {
		if (self.counter == self.total) {
			self.callback();
		}
	}
	
	if (total == 0) callback();
	
}	

module.exports=CallbackCollector;