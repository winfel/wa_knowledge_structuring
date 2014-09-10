"use strict";
/**
 * @class string
 */

/** 
 * Splits a string into string parts of length L - last string part can be shorter than L.
 * @function splitSubstr
 * @param {string} str	Item that should be split
 * @param {int} len	Length of resulting string parts
 * @returns {Array.<String>} Array of string parts
 */
function splitSubstr(str, len) {
    var ret = [ ];
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
        ret.push(str.substr(offset, len));
    }
    return ret;
}

/**
 * Replaces special characters with html representations
 * @function htmlEscape
 * @param {string} str	String that should be escaped
 * @returns {string} Escaped string
 */
function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

/**
 * Replaces a newline with html <br /> tag
 * @function nl2br
 * @param {string} str
 * @returns {string} 
 */
function nl2br(str){
	return str.replace(/\n/g, '<br />');
}

/**
 *
 * Replaces special characters with html representations and replaces a newline with html <br /> tag
 * @function htmlEncode
 * @param {string} str
 * @returns {string} 
 */
function htmlEncode(str){
    return nl2br(htmlEscape(str));
}

/**
 *
 * Converts a string that is HTML-encoded into a decoded string
 * @function htmlDecode
 * @param {string} str
 * @returns {string}
 */
function htmlDecode(str){
	return $("<div>").html(str.replace(/<br[\s\/]*>/gi, '\n')).text()
}