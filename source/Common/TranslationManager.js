"use strict";

/**
* @class TranslationManager
* @classdesc This is the TranslationManager
*
*/


var TranslationManager = Object.create(Object);

TranslationManager.proto = false;
TranslationManager.attributes = false;

/**
* @function init
* @param proto
*/
TranslationManager.init = function(proto) {
    this.proto = proto;
    this.data = {};
}

/**
* @function toString
* @return {String}
*/
TranslationManager.toString = function() {
    if (!this.proto) return 'Translation Manager';

    return 'Translation Manager for ' + this.proto;
}

/**
* @function addTranslations
* @param language
* @param translations
* @return {TranslationManager}
*/
TranslationManager.addTranslations = function(language, translations) {
    this.data[language] = translations;

    return this;
}

/**
* @function get
* @param language
* @param text
* @return {TranslationManager}
*/
TranslationManager.get = function(language, text) {
	if(language == 'cow') {
		return Math.random()<=0.5?('M' + new Array( Math.round(2+Math.random()*8) ).join('u') + 'h'):('mo' + new Array( Math.round(2+Math.random()*8) ).join('o'));
	}

    if (this.data[language] && this.data[language][text]) {
        return this.data[language][text];
    } 

    // try to get it on the prototype
    if (this.proto && this.proto.parent && this.proto.parent.translationManager) {
        return this.proto.parent.translationManager.get(language, text);
    }

    return text;

}

module.exports = TranslationManager;