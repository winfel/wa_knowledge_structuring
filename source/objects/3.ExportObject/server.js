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

var calls = {};
theObject.calls = calls;

/**
 * Exports the associated files of the ExportObject
 * @param type	one of html, txt, pdf or image_*
 * @param position	position in form {x:47, y:11} where the created file should be dropped; optional
 * @param createFile	callback of type function(filename, data, mimeType); optional
 */
theObject.exportAsFile = function(type, position, createFile) {
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
		outputFilename = [],
		outputCount = 0;

	// createFile performs as a callback here
	if(!createFile) {
		createFile = function(filename, data, mimeType) {
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
	}

	/* internal function to add content */
	var addContent = function(object, content) {
		outputContent[inputPaperIds.indexOf(object.getId())] = content;
		outputFilename[inputPaperIds.indexOf(object.getId())] = object.getName();
		if(++outputCount == inputPaperIds.length) {
			// all content is there, create a file object

			var filename = outputFilename.join('+');

			if(type == 'html') {
				// create a html file object
				createFile(filename + '.html', outputContent.join('\r\n'), 'text/html');
			}
			else if(type == 'text') {
				// create plain textfile
				createFile(filename + '.txt', outputContent.join('\r\n'), 'text/plain');
			}
			else if(type == 'pdf') {
				// convert html to pdf
				Modules.EtherpadController.convertToPdf(outputContent.join('\r\n'), function(pdfcontent) {
					// create pdf file object in webarena
					createFile(filename + '.pdf', pdfcontent, 'application/pdf');
				});
			}
			else {
				var imgtype = type.substr(6);

				// convert html to image
				Modules.EtherpadController.convertToImage(outputContent.join('\r\n'), imgtype, function(imgcontent) {

					// create image file object in webarena
					createFile(filename + '.' + imgtype, imgcontent, 'image/' + imgtype);
				});
			}
		}
	};

	/* internal function to add the content of a PaperSpace */
	var getPaperContent = function(object, asText) {
		if(!asText) {
			asText = false;
		}
		var dbData = {'destination':object.getAttribute('destination'), 'key':"paperIDs"};
		Modules.UserManager.getDataOfSpaceWithDestServerSide(dbData, function(chapterPadIDs) {

			if(chapterPadIDs == "error") {
				var errorText = that.translate(that.currentLanguage, "Error: The paper has not any chapters yet.");
				addContent(object, errorText);
				return;
			}

			chapterPadIDs = chapterPadIDs[0].value;
			if(typeof chapterPadIDs == 'string') { // fallback for deprecated string notation
				chapterPadIDs = chapterPadIDs.split(";");
			}
			var cPos = 0;

			var summedText = "";

			chapterPadIDs.forEach(function(chapterPadID) {
				// read the html from etherpad
				Modules.EtherpadController.pad[asText?'getText':'getHTML']( {
					padID : chapterPadID
				}, function(error, data) {
					if(error) {
						console.error("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message);
						//return;
					}

					if(data != null) {
						if(asText) {
							summedText += data.text;
						}
						else {
							summedText += data.html;
						}
					}

					// due to async access it might happen, that the order of chapters is mixed - we'll find a solution later
					if(cPos++ >= chapterPadIDs.length-1) {
						// last round
						addContent(object, summedText);
					}
				});
			}); // end for each paperchapter

		});
	};

	/* internal function to add the content of a PaperChapter */
	var getChapterContent = function(object, asText) {
		if(!asText) {
			asText = false;
		}
		var chapterPadID = object.getAttribute('chapterID');
		// read the html from etherpad
		Modules.EtherpadController.pad[asText?'getText':'getHTML']( {
			padID : chapterPadID,
		}, function(error, data) {
			var text = "";
			if(error) {
				console.error("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message);
				//text = ("PadID "+ chapterPadID + " >> Error pad.getText: ", error.message); // chapter has no content
			}else if(data != null) {
				if(asText) {
					text = data.text;
				}
				else {
					text = data.html;
				}
			}
			addContent(object, text);
		});
	};

	/* internal function to get the content of a File */
	var getFileContent = function(object, asText) {
		if(!asText) {
			asText = false;
		}
		if(object.getType()=='File' &&
			(!!asText && (object.getAttribute('mimeType')=='text/plain' || object.getName().match(/\.txt?$/i))) ||
			(!asText && (object.getAttribute('mimeType')=='text/html' || object.getName().match(/\.html?$/i)))) {
		object.getContentAsString(function(data) {
			var text = "";
			if(data != null) {
				text = data;
			}
			else {
				console.error("File "+ object.getId() + " >> Error in getContentAsString");
			}

			addContent(object, text);
		});
		}
		else {
			addContent(object, 'Files with type ' + object.getAttribute('mimeType') + ' are currently not supported for PDF-Export.');
		}
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
			else if(object.getType()=='File') {
				getFileContent(object, type == 'text');
			}
			else {
				addContent(object, '<div>Object currently not supported!<br />Id: ' + object.getId() + ', Type: ' + object.getType() + '</div>');
			}
		});
	});
};
theObject.exportAsFile.public = true;

/**
 * registers an export job in the global EportObject.calls and returns a url, under which the job is executed
 */
theObject.exportAsUrl = function(type, callback) {
	var that = this;
	// generate a random id for that call
	var callid = '' + (new Date()).getTime() + '-' + (Math.random()*10000000);
	calls[callid] = function(cb) {
		that.exportAsFile(type, false, cb);
		// if delete is enabled, every url works exactly once; on the other hand, without delete the environment could be polluted
		//delete calls[callid];
	};
	callback('/getExport/' + callid);
}
theObject.exportAsUrl.public = true;

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
		return;
	}

	if(inputPapers.indexOf(object.getId()) != -1) {
		return;
	}
	inputPapers.push(object.getId());

	this.getRoom(function(room){
		room.getInventoryAsync(function(inventory){

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

