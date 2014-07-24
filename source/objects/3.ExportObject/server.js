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

	if(object.get('type')=='PaperSpace')
	{
		if(this.getAttribute('exportFormat')=='html')
		{
			var dbData = {'destination':object.getAttribute('destination'), 'key':"paperIDs"};
			Modules.UserManager.getDataOfSpaceWithDestServerSide(dbData, function(i){
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
								// create html file object
								createFile(object.getName() + '.html', summedText, 'text/html');
							}
						});
				});

			});


        } else if (this.getAttribute('exportFormat') == 'pdf') {
            
			// first read the html from etherpad
            Modules.EtherpadController.pad.getHTML({
                padID : object.getAttribute('padID')
            }, function(error, data) {
				if(error) {
                    console.error("Error pad.getText: ", error.message);
					return;
				}

				// convert html to pdf
				Modules.EtherpadController.convertToPdf(data.html, function(pdfcontent){
					// create pdf file object in webarena
					createFile(object.getName() + '.pdf', pdfcontent, 'application/pdf');
                });

				});
        } else if (this.getAttribute('exportFormat').substr(0, 5) == 'image') {
			var imgtype = this.getAttribute('exportFormat').substr(6);
            
			// first read the html from etherpad
            Modules.EtherpadController.pad.getHTML({
                padID : object.getAttribute('padID')
            }, function(error, data) {
                
				if(error) {
                    console.error("Error pad.getText: ", error.message);
					return;
				}

				// convert html to image
				Modules.EtherpadController.convertToImage(data.html, imgtype, function(imgcontent){

					// create image file object in webarena
					createFile(object.getName() + '.' + imgtype, imgcontent, 'image/' + imgtype);
				});
			});
        } else {
            Modules['EtherpadController'].pad.getText({
                padID : object.getAttribute('padID')
            }, function(error, data) {
				if(error) {
                    console.error("Error pad.getText: ", error.message);
					return;
				}

				// create plain textfile
				createFile(object.getName() + '.txt', data.text, 'text/plain');
			});
		}
	}
    
	this.fireEvent('enter',object);
}

module.exports = theObject;

