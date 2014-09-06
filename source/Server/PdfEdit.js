/**
*    Webarena - A web application for responsive graphical knowledge work
*
*	 @class PdfEdit
*/

"use strict";

var pdftohtml = require('pdftohtmljs'),
	ostmpdir = require('os').tmpdir(),
	fs = require('fs'),
	Modules = false;

var PdfEdit = {
	/**
	*	converts a file or content of a pdf object to html and adds the new contents to the given object
	*	@param data {file:{path:'path/to/file'}, object:object} or {object:object}
	*/
	convertToHtml : function(data, callback){
		//console.dir(data);
		callback = callback || data.callback || function(){};

		var inputfile;
		if( data.file && data.file.path) {
			inputfile = data.file.path;
		}
		else {
			inputfile = ostmpdir + '/' + data.object.id + '.pdf.content';
			// we first have to save the pdf content to a temporary file
			fs.writeFile(inputfile, data.object.getContent(), function(err){
					if (err) throw err;
					data.file = {path:inputfile};
					// after having written the file call this function again
					convertToHtml(data, callback);
			});
			return;
		}
		var outputfilename = data.object.id + '.html.content';
		var outputfile = ostmpdir + '/' + outputfilename;
		var converter = new pdftohtml(inputfile, outputfilename);

		//converter.preset('default');
		converter.add_options([
				'--zoom 1.33',
				'--font-format woff',
				'--dest-dir ' + ostmpdir,
			]);

		converter.success(function() {
			//data.object.setContentFromFile(outputfile);
			if(!callback)
				callback = function(){};
			Modules.ObjectManager.createObject(
				data.object.inRoom,
				'HiddenFile',
				{
					hasContent: true,
					mimeType: 'text/html',
					name: data.object.id + '.html',
				},
				false,
				data.object.context,
				function(alwaysFalse, newObject){
					//newObject.setAttribute("link", data.object.id); // produces many errors
					newObject.copyContentFromFile(outputfile, callback);
				});
			// TODO: remove this line! only for temporary backward compatibility
			Modules.Connector.copyContentFromFile(data.object.inRoom, data.object.id + '.html', outputfile, data.object.context, callback);
		});

		converter.error(function(error) {
		  console.log("conversion error: " + error);
		});

		converter.progress(function(ret) {
			//console.log ((ret.current*100.0)/ret.total + " %");
			data.object.setAttribute('progress', ret.current/ret.total);
		});

		converter.convert();

	},

	/**
	* @param theModules
	*/
	init: function (theModules) {
		Modules = theModules;
	},
};

module.exports=PdfEdit;