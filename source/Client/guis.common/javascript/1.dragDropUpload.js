"use strict";
/**
 * @file 1.dragDropupload.js
 */

/**
 * Upload of files via drag and drop (HTML5)
 */
$(function() {

	/**
	 * called when an object was dropped
	 * @function drop
	 * @param {event} event The drop event
	 */
	var drop = function(event) {
		
		if ($(".ui-tabs-active").children().first().attr('title') == "Global Space") {
			alert(GUI.translate("upload.globalspace.error"));
		} else {
		
			/* get position of drop */
			var x = event.clientX+parseInt($("body").scrollLeft());
			var y = event.clientY+parseInt($("body").scrollTop())-$("#content").offset().top;

			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy'; //show that this is a copy
			
			/* get dropped files */
			var files = event.dataTransfer.files;
			
	/**
	 * @function upload
	 * @param file
	 * @param {int} x
	 * @param {int} y
	 * @param callback
	 */

			var upload = function(file, x, y, callback){
					
				var progressBarId = GUI.progressBarManager.addProgress(GUI.translate("Create file object"));
				
				var filename = file.name;
				var mimeType = file.type;

				/* create new File object and set position */
				ObjectManager.createObject("File",{
					"x": x,
					"y": y,
					"name": filename,
					"hasContent":true //prevent calling justCreated() after object creation (would display file upload dialog)
				},false,function(newObject) {
					/* object created --> upload content */
					
					//GUI.tagAssigner.open(newObject, 600, 600, false);
					
					var fd=new FormData();
					fd.append("file", file); // Append the file
					
					var xhr = new XMLHttpRequest();
					
					xhr.upload.addEventListener("progress",function(evt) {
						if (evt.lengthComputable){
							
							var percentComplete=Math.round(evt.loaded * 100 / evt.total);
							GUI.progressBarManager.updateProgress(progressBarId, percentComplete);
							
						}
					}, false);
					
					xhr.addEventListener("load",function() {
						GUI.progressBarManager.updateProgress(progressBarId, 100, GUI.translate("Upload completed"), true);
						
					},false);
					
					xhr.addEventListener("error",function() {
						GUI.progressBarManager.error(progressBarId, GUI.translate("Error while uploading file"));
					},false);
					
					xhr.addEventListener("abort",function() {
						GUI.progressBarManager.error(progressBarId, GUI.translate("Upload aborted"));
					},false);
					
					xhr.open("POST", "/setContent/"+newObject.getCurrentRoom()+"/"+newObject.getAttribute('id')+"/"+ObjectManager.userHash);
					xhr.send(fd);
				
				
					GUI.progressBarManager.updateProgress(progressBarId, 0, GUI.translate("Upload file"));
					
					newObject.setAttribute('mimeType', mimeType);
					newObject.setAttribute('name', filename);
					
					GUI.tagAssigner.open(newObject, 600, 600, false, function(){
						callback();
					});
					
				});
					
			}
			
	/**
	 * @function doRecursion
	 * @param {int} i
	 */

	
			var doRecursion = function(i){
				if (i < files.length) {
					if(i != 0){
						x += 70;
						y += 30;
					}
					upload(files[i], x, y, function(){
						doRecursion(i + 1);
					});
					
				}
			}
			
			if (files != undefined && files != null && files.length > 0) {
				/* files dropped */

				//for (var i=0; i < files.length; i++) {
					//upload(files[i]);					
				//}
				doRecursion(0, x, y);
			}
		}
	}
		
	/**
	 * register event handlers for drag and drop events (using body to ensure all events are captured)
	 */
	$("body").get(0).addEventListener("drop", drop, false);
	
	
	$("body").get(0).addEventListener("dragenter", function(e) {
		e.stopPropagation();
		  e.preventDefault();
	}, false);
	
	$("body").get(0).addEventListener("dragover", function(e) {
		e.stopPropagation();
		  e.preventDefault();
	}, false);
	
});