/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

theObject.onEnter=function(object,oldData,newData){
	var that = this;

	var createFile = function(filename, data, mimeType) {
        Modules.ObjectManager.createObject(that.getRoomID(), "File", {
				x: 80,
				y: 60,
            hasContent : true,  // prevent calling justCreated() after object
                                // creation (would display file upload dialog)
				name: filename,
        }, data, that.context, function(dummy, newObject) {
				newObject.set('mimeType',mimeType);
				newObject.persist();
        });
	};

	var exportToSth = function(object,fileExtension){
		var dbData = {'destination':object.getAttribute('destination'), 'key':"paperIDs"};
		Modules.UserManager.getDataOfSpaceWithDestServerSide(dbData, function(i){
		
			if(i == "error"){
				var errorText = "Error: You don't have created a chapter that could be exported right now. <br> To use"+
				" the export object, you need to create a chapter, write something into it and, as soon as you wan't to export something, "+
				"double click a chapter to run the ordering algorithm (this last step will be fixed in the final release of "+
				" the CoW aka HackArena aka HackATron...)";
				createFile(object.getName() + '.html', errorText, 'text/html');
				return;
			}

			var token = i[0].value.split(";"); 
			var cPos = 0;

			var summedText = "";

			token.forEach(function(i2){
						// read the html from etherpad
						Modules.EtherpadController.pad.getHTML({
							padID : i2
						}, function(error, data) {
							if(error) {
								console.error("PadID "+ object.getAttribute('padID') + " >> Error pad.getText: ", error.message);
								//return;
							}

							if(cPos < token.length-1){
								if(data != null){
									summedText +=  data.html;
								}
								cPos++;
							}else{
								if(data != null){
									summedText +=  data.html;
								}
									// create a file object

									if(fileExtension == '.html'){
										// create a html file object
										createFile(object.getName() + fileExtension/*'.html'*/, summedText, 'text/html');
									}else if(fileExtension == '.txt'){
										// create plain textfile
										createFile(object.getName() + fileExtension, summedText, 'text/plain');
									}else if(fileExtension == '.pdf'){
										// convert html to pdf
										Modules.EtherpadController.convertToPdf(summedText, function(pdfcontent){
											// create pdf file object in webarena
											createFile(object.getName() + fileExtension, pdfcontent, 'application/pdf');
						                });
									}else{
										var imgtype = that.getAttribute('exportFormat').substr(6);

										// convert html to image
										Modules.EtherpadController.convertToImage(summedText, imgtype, function(imgcontent){

											// create image file object in webarena
											createFile(object.getName() + '.' + imgtype, imgcontent, 'image/' + imgtype);
										});
									}

								}
							});
					});

		});
	};

	if(object.get('type')=='PaperSpace')
	{
		if(this.getAttribute('exportFormat')=='html')
		{
			exportToSth(object,'.html');

        } else if (this.getAttribute('exportFormat') == 'pdf') 
        {
            exportToSth(object,'.pdf');

        } else if (this.getAttribute('exportFormat').substr(0, 5) == 'image') 
        {
        	exportToSth(object,'.image');

        } else {
            exportToSth(object,'.txt');
		}
	}
    
	this.fireEvent('enter',object);
}

module.exports = theObject;

