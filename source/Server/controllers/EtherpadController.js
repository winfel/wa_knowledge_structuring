/**
 * Provides API methods for Object related tasks
 */

/**
* @class EtherpadController
* @classdesc This is the EtherpadController
*/
"use strict";

var api = require('etherpad-lite-client'),
	etherpad = api.connect({
		apikey: global.config.etherpadlite.apikey,
		host: global.config.etherpadlite.host,
		port: global.config.etherpadlite.port,
	});

var EtherpadController = {};
var Modules = false;

/**
* @param theModules
*/
EtherpadController.init = function(theModules) {
	Modules = theModules;
	
	if (global.config.etherpadlite.apikey == '') {
		console.error('\x1B[31;1metherpadlite.apikey is not defined in config.local.js.\nCopy the appropriate settings from config.default.js and add the string from etherpadfolder/APIKEY.txt.\x1B[39m');
	}
};

/**
* @param html
* @param callback
*/
EtherpadController.convertToPdf = function(html, callback) {
    
	if (global.config.wkhtmltox.path == '') {
		console.error('\x1B[31;1mwkhtmltox.path is not defined in config.local.js.\nTo export to PDF install http://wkhtmltopdf.org , copy the appropriate settings from config.default.js and add the path (use / or \\\\ as separator) to bin folder.\x1B[39m');
		return;
	}
	
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'CoW_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err) {
		if (err) throw err;

		// the temporary html file is written, now call wkhtmltopdf on it
		child = execf(Modules.Helper.addTrailingSlash(global.config.wkhtmltox.path) + "wkhtmltopdf",
        		[
        			tmpFilename + '.html',
        			tmpFilename + '.pdf',
        		], // args
        		{
        			cwd:ostmpdir, 
        		}, // options
        		function (error, stdout, stderr) {
        			// wkhtmltopdf has finished
        			//console.log('stdout: ' + stdout);
        			//console.warn('stderr: ' + stderr);
        			if (error !== null) {
        				console.error('exec error: ' + error);
        				return;
        			}
        
        			// read temporary pdf file again
        			fs.readFile(ostmpdir + '/' + tmpFilename + '.pdf', function (err, data) {
        				if (err) throw err;
        				// pdf is read
        				callback(data);
        			});
        
        		});
	});
}

/**
* @param html
* @param imgtype
* @param callback
*/
EtherpadController.convertToImage = function(html, imgtype, callback) {
    
	if (global.config.wkhtmltox.path == '') {
		console.error('\x1B[31;1mwkhtmltox.path is not defined in config.local.js.\nTo export to an image install http://wkhtmltopdf.org , copy the appropriate settings from config.default.js and add the path (use / or \\\\ as separator) to bin folder.\x1B[39m');
		return;
	}
	
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'CoW_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err) {
		if (err) throw err;

		// the temporary html file is written, now call wkhtmltoimage on it
		child = execf(Modules.Helper.addTrailingSlash(global.config.wkhtmltox.path) + "wkhtmltoimage",
		[
			//'-f ' + imgtype,
			tmpFilename + '.html',
			tmpFilename + '.' + imgtype,
		], // args
		{
			cwd:ostmpdir, 
		}, // options
		function (error, stdout, stderr) {
			// wkhtmltoimage has finished
			//console.log('stdout: ' + stdout);
			//console.warn('stderr: ' + stderr);
			if (error !== null) {
				console.error('exec error: ' + error);
				return;
			}

			// read temporary img file again
			fs.readFile(ostmpdir + '/' + tmpFilename + '.' + imgtype, function (err, data) {
				if (err) throw err;
				// img is read
				callback(data);
			});
		});
	});
}

EtherpadController.pad = etherpad;

module.exports = EtherpadController;
