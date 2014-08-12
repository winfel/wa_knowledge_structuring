/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

theObject.onEnter=function(object,oldData,newData) {
	var that = this;
	
	//Modules.

	var createFile = function(filename, data, mimeType) {
		var bbox = that.getBoundingBox();
		Modules.ObjectManager.createObject(that.getRoomID(), "File", {
			x: bbox.x + bbox.width,
			y: bbox.y + bbox.height,
			hasContent : true,	// prevent calling justCreated() after object
								// creation (would display file upload dialog)
			name: filename,
		}, data, that.context, function(dummy, newObject) {
			newObject.set('mimeType',mimeType);
			newObject.persist();
		});
	};

	var exportToSth = function(object,fileExtension) {
		var dbData = {'destination':object.getAttribute('destination'), 'key':"paperIDs"};
		Modules.UserManager.getDataOfSpaceWithDestServerSide(dbData, function(chapterPadIDs) {

			if(chapterPadIDs == "error") {
				var errorText = "Error: You don't have created a chapter that could be exported right now. <br> To use"+
				" the export object, you need to create a chapter, write something into it and, as soon as you wan't to export something, "+
				"double click a chapter to run the ordering algorithm (this last step will be fixed in the final release of "+
				" the COW aka HackArena aka HackATron...)";
				createFile(object.getName() + '.html', errorText, 'text/html');
				return;
			}

			var token = chapterPadIDs[0].value.split(";"); 
			var cPos = 0;

			var summedText = "";

			token.forEach(function(chapterPadID) {
				// read the html from etherpad
				Modules.EtherpadController.pad.getHTML( {
					padID : chapterPadID
				}, function(error, data) {
					if(error) {
						console.error("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message);
						//return;
					}

					if(cPos < token.length-1) {
						if(data != null) {
							summedText += data.html;
						}
						cPos++;
					}
					else {
						if(data != null) {
							summedText += data.html;
						}

						// create a file object

						if(fileExtension == '.html') {
							// create a html file object
							createFile(object.getName() + fileExtension/*'.html'*/, summedText, 'text/html');
						}
						else if(fileExtension == '.txt') {
							// create plain textfile
							createFile(object.getName() + fileExtension, summedText, 'text/plain');
						}
						else if(fileExtension == '.pdf') {
							// convert html to pdf
							Modules.EtherpadController.convertToPdf(summedText, function(pdfcontent) {
								// create pdf file object in webarena
								createFile(object.getName() + fileExtension, pdfcontent, 'application/pdf');
							});
						}
						else {
							var imgtype = that.getAttribute('exportFormat').substr(6);

							// convert html to image
							Modules.EtherpadController.convertToImage(summedText, imgtype, function(imgcontent) {

								// create image file object in webarena
								createFile(object.getName() + '.' + imgtype, imgcontent, 'image/' + imgtype);
							});
						}

					}
				});
			}); // end for each paperchapter

		});
	};

	// exporting of PaperSpaces to some format
	if(object.get('type')=='PaperSpace') {
		if(this.getAttribute('exportFormat')=='html') {
			exportToSth(object,'.html');
		}
		else if(this.getAttribute('exportFormat') == 'pdf') {
			exportToSth(object,'.pdf');
		}
		else if(this.getAttribute('exportFormat').substr(0, 5) == 'image') {
			exportToSth(object,'.image');
		}
		else {
			exportToSth(object,'.txt');
		}
	}

	// exporting of html-File-Objects to pdf
	else if(object.get('type')=='File' && (object.getAttribute('mimeType')=='text/html' || object.getName().match(/\.html?$/i))) {
		if(this.getAttribute('exportFormat')=='pdf') {
			console.log('exporting normal html-file to pdf');
			var html = object.getContentAsString();
			// convert html to pdf
			Modules.EtherpadController.convertToPdf(html, function(pdfcontent) {
				// create pdf file object in webarena
				createFile(object.getName().replace(/(\.html?)?$/i, '.pdf'), pdfcontent, 'application/pdf');
			});
		}
	}

	this.fireEvent('enter',object);
			}

module.exports = theObject;

