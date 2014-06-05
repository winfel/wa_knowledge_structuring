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
			Modules.Connector.copyContentFromFile(data.object.inRoom, data.object.id + '.html', outputfile, data.object.context, callback);
		});

		converter.error(function(error) {
		  console.log("conversion error: " + error);
		});

		converter.progress(function(ret) {
		  console.log ((ret.current*100.0)/ret.total + " %");
		});

		converter.convert();

	},

	init: function (theModules) {
		Modules = theModules;
	},
};

module.exports=PdfEdit;