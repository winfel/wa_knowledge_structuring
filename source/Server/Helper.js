"use strict";
var _ = require("lodash");

/**
 * @class Helper
 * A bunch of helper methods
 * @requires lodash
 */
var Helper = new function () {


	/**
     *  getCloneOfObject - public method
     *
     *  returns a clone of the given object
     *
     *  @param  oldObject   the object that should be cloned
     *  @return {object}    the clone of the object
     */
	this.getCloneOfObject = function (oldObject) {
		var tempClone = {};

		if (typeof(oldObject) == "object")
			for (var prop in oldObject)
				// for array use private method getCloneOfArray
				if ((typeof(oldObject[prop]) == "object") &&
					(oldObject[prop]).__isArray)
					tempClone[prop] = this.getCloneOfArray(oldObject[prop]);
				// for object make recursive call to getCloneOfObject
				else if (typeof(oldObject[prop]) == "object")
					tempClone[prop] = this.getCloneOfObject(oldObject[prop]);
				// normal (non-object type) members
				else
					tempClone[prop] = oldObject[prop];

		return tempClone;
	}

    /**
     *  getCloneOfObject - private method (to copy array of objects) - getCloneOfObject will use this internally
     *
     *  returns a clone of the given array
     *
     *  @param  oldArray    the array that should be cloned
     *  @return {array}    the clone of the array
     */
	this.getCloneOfArray = function (oldArray) {
		var tempClone = [];

		for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
			if (typeof(oldArray[arrIndex]) == "object")
				tempClone.push(this.getCloneOfObject(oldArray[arrIndex]));
			else
				tempClone.push(oldArray[arrIndex]);

		return tempClone;
	}

	/**
	 * assure - assure type security.
	 *
	 * Test, if a variable is set. If the variable is undefined
	 * an exception is thrown.
	 *
	 * If a datatype is provided, the variable is checked against
	 * that type, forcing an exception in case of a wrong type.
	 *
	 * Name is used for debugging purposes
     *
     *  @param  variable    the variable that should be checked
     *  @param  name        the name of the variable
     *  @param  datatype    the datatype of the variable (the datatype it should have ;-))
	 **/
	this.assure = function (variable, name, datatype) {

		if (!name) name = '';

		if (variable === undefined) {
			throw 'missing variable ' + name;
		}

		if (!datatype) return true;

		if (typeof variable !== datatype) {
			throw 'variable ' + name + ' is not of type ' + datatype;
		}


	}


	this.getRandom = _.random


	this.array_unique = function (arrayName) {
		var newArray = new Array();
		label:for (var i = 0; i < arrayName.length; i++) {
			for (var j = 0; j < newArray.length; j++) {
				if (newArray[j] == arrayName[i])
					continue label;
			}
			newArray[newArray.length] = arrayName[i];
		}
		return newArray;
	}


	this.utf8 = {};

	this.utf8.toByteArray = function (str) {
		var byteArray = [];
		for (var i = 0; i < str.length; i++)
			if (str.charCodeAt(i) <= 0x7F)
				byteArray.push(str.charCodeAt(i));
			else {
				var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
				for (var j = 0; j < h.length; j++)
					byteArray.push(parseInt(h[j], 16));
			}
		return byteArray;
	};

	this.utf8.parse = function (byteArray) {
		var str = '';
		for (var i = 0; i < byteArray.length; i++)
			str += byteArray[i] <= 0x7F ?
				byteArray[i] === 0x25 ? "%25" : // %
					String.fromCharCode(byteArray[i]) :
				"%" + byteArray[i].toString(16).toUpperCase();
		try {
			return decodeURIComponent(str);
		} catch (e) {
		}
		return '';
	};
	
	
	/**
     * Add a slash to the end of the pad if not presented
     *
     *
     *  @param  path (String) the path that should be checked
     **/
	this.addTrailingSlash = function(path) {
	    return path.replace(/\/?(\?|#|$)/, '/$1');
	}


}


module.exports = Helper;
