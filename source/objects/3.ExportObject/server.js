/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var exportableTypes = ['PaperSpace', 'PaperChapter', 'PaperObject']; // , 'File'

theObject.exportAsFile = function(type, position) {
	var that = this;
	if(!type) {
		type = this.getAttribute('exportFormat');
	}
	if(!position) {
		var bbox = that.getBoundingBox();
		position = {
			x: bbox.x + bbox.width + 53,
			y: bbox.y,
		};
	}
	var inputPaperIds = this.getAttribute('inputPapers'),
		outputContent = [],
		outputCount = 0;

	var createFile = function(filename, data, mimeType) {
		Modules.ObjectManager.createObject(that.getRoomID(), "File", {
			x: position.x,
			y: position.y,
			hasContent : true,	// prevent calling justCreated() after object
								// creation (would display file upload dialog)
			name: filename,
			visible: false,
		}, data, that.context, function(dummy, newObject) {
			newObject.set('mimeType',mimeType);
			newObject.set('visible', true);
			newObject.persist();
		});
	};

	var addContent = function(object, content) {
		outputContent[inputPaperIds.indexOf(object.getId())] = content;
		if(++outputCount == inputPaperIds.length) {
			// all content is there, create a file object

			if(type == 'html') {
				// create a html file object
				createFile(that.getId() + '.html', outputContent.join('\r\n'), 'text/html');
			}
			else if(type == 'txt') {
				// create plain textfile
				createFile(that.getId() + '.txt', outputContent.join('\r\n'), 'text/plain');
			}
			else if(type == 'pdf') {
				// convert html to pdf
				Modules.EtherpadController.convertToPdf(outputContent.join('\r\n'), function(pdfcontent) {
					// create pdf file object in webarena
					createFile(that.getId() + '.pdf', pdfcontent, 'application/pdf');
				});
			}
			else {
				var imgtype = type.substr(6);

				// convert html to image
				Modules.EtherpadController.convertToImage(outputContent.join('\r\n'), imgtype, function(imgcontent) {

					// create image file object in webarena
					createFile(object.getName() + '.' + imgtype, imgcontent, 'image/' + imgtype);
				});
			}
		}
	};

	var getPaperContent = function(object, asText) {
		if(!asText) {
			asText = false;
		}
		var dbData = {'destination':object.getAttribute('destination'), 'key':"paperIDs"};
		Modules.UserManager.getDataOfSpaceWithDestServerSide(dbData, function(chapterPadIDs) {

			if(chapterPadIDs == "error") {
				var errorText = "Error: You don't have created a chapter that could be exported right now. <br> To use"+
				" the export object, you need to create a chapter, write something into it and, as soon as you wan't to export something, "+
				"double click a chapter to run the ordering algorithm (this last step will be fixed in the final release of "+
				" the CoW aka HackArena aka HackATron...)";
				addContent(object, errorText);
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
						// last round
						if(data != null) {
							summedText += data.html;
						}
						addContent(object, summedText);
					}
				});
			}); // end for each paperchapter

		});
	};

	var getChapterContent = function(object, asText) {
		if(!asText) {
			asText = false;
		}
		var chapterPadID = object.getAttribute('chapterID');
		// read the html from etherpad
		Modules.EtherpadController.pad.getHTML( {
			padID : chapterPadID,
		}, function(error, data) {
			var text = "";
			if(error) {
				console.error("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message);
				text = ("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message);
			}else if(data != null) {
				text = data.html;
			}
			addContent(object, text);
		});
	};

	// get the real objects of input papers
	this.getInputPapers(function(objects) {
		objects.forEach(function(object) {
			// for each object call getContent / addContent
			if(object.getType()=='PaperSpace') {
				getPaperContent(object, type == 'text');
			}
			else if(object.getType()=='PaperChapter') {
				getChapterContent(object, type == 'text');
			}
			else if(object.getType()=='File' && type != 'text' && (object.getAttribute('mimeType')=='text/html' || object.getName().match(/\.html?$/i))) {
				addContent(object, object.getContentAsString());
			}
			else if(object.getType()=='File' && type == 'text' && (object.getAttribute('mimeType')=='text/plain' || object.getName().match(/\.txt?$/i))) {
				addContent(object, object.getContentAsString());
			}
			else {
				addContent(object, '<div>Object currently not supported!<br />Id: ' + object.getId() + ', Type: ' + object.getType() + '</div>');
			}
		});
	});
};
theObject.exportAsFile.public = true;

/**
 * gives the connected inputPapers as ordered object array to the callback
 * because a lot of callbacks are needed to get the input papers of the current room
 */
theObject.getInputPapers = function(callback) {
	var that = this;
	var inputPapers = this.getAttribute('inputPapers'); // array of object ids
	this.getRoom(function(room){
		room.getInventoryAsync(function(inventory){

			var returnObjects = [];
			inventory.forEach(function(i) {
				if(inputPapers.indexOf(i.getId()) != -1) {
					returnObjects[inputPapers.indexOf(i.getId())] = i;
				}
			});
			callback(returnObjects);

		});
	});
};

theObject.onEnter = function(object,oldData,newData) {
	var that = this;
	var inputPapers = this.getAttribute('inputPapers');

	if(exportableTypes.indexOf(object.getType()) == -1) {
		console.log('no paper');
		return;
	}

	if(inputPapers.indexOf(object.getId()) != -1) {
		return;
	}
	inputPapers.push(object.getId());

	this.getRoom(function(room){
		console.log('async sucks');
		room.getInventoryAsync(function(inventory){
			console.log('really sucks');

			// sort papers by y coordinate
			var y_coordinates = {};
			inventory.forEach(function(i) {
				y_coordinates[i.getId()] = i.get('y');
			});
			inputPapers.sort(function(a, b) {
				return y_coordinates[a] - y_coordinates[b];
			});

			that.setAttribute('inputPapers', inputPapers);
			that.persist();
		});
	});
	this.fireEvent('enter',object);
};

theObject.onLeave = function(object,oldData,newData) {
	var that = this;
	var inputPapers = this.getAttribute('inputPapers');

	if(inputPapers.indexOf(object.getId()) == -1) {
		return;
	}
	inputPapers.splice(inputPapers.indexOf(object.getId()), 1);

	that.setAttribute('inputPapers', inputPapers);
	that.persist();
};

/**
 * returns near papers; on server only async with callback
 */
theObject.getSurroundingPapers = function(callback) {
	if(callback) {
		this.getRoom().getInventory(function(inventory){
			var papers = new Array();
			for(var i in inventory) {
				if(inventory[i].getType() == 'PaperSpace'
					|| inventory[i].getType() == 'PaperChapter'
					|| inventory[i].getType() == 'PaperObject')
				papers.push(inventory[i]);
			}
			callback(papers);
		});
	}
	return [];
};

module.exports = theObject;

