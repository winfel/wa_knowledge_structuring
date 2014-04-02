/**
 * Provides API methods for Object related tasks
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

EtherpadController.init = function(theModules) {
	Modules = theModules;
};

EtherpadController.convertToPdf = function(html, callback) {
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'webArena_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err){
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
				callback(data.toString());
			});

		});
	});
}

EtherpadController.convertToImage = function(html, imgtype, callback) {
	var execf = require('child_process').execFile,
	child,
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	tmpFilename = 'webArena_' + (Math.random()*100000);

	// we first have to save the html to a temporary file
	fs.writeFile(ostmpdir + '/' + tmpFilename + '.html', html, function(err){
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
				callback(data.toString());
			});
		});
	});
}

EtherpadController.pad = etherpad;

module.exports = EtherpadController;
