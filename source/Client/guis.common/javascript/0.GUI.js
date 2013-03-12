"use strict";

var GUI={};

GUI.currentLanguage='de';


GUI.translationManager=Object.create(TranslationManager);
GUI.translationManager.init(undefined);


GUI.setTranslations=function(language,data){
	return this.translationManager.addTranslations(language, data);
}

GUI.translate=function(text){
	
	return this.translationManager.get(this.currentLanguage, text);
	
}



GUI.isTouchDevice = false;




GUI.updateGUI = function(webarenaObject) {
	
	var rep = webarenaObject.getRepresentation();
	


}



GUI.initResizeHandler = function() {

	$(document).bind("resize", function() {
		GUI.adjustContent();
	});
	
}


GUI.adjustContent = function(webarenaObject) {
	
	if (webarenaObject != undefined) {

		if (!webarenaObject.isGraphical) return;

		/* check if new position of webarenaObject needs a new room width/height */

		var currentRoom = ObjectManager.getCurrentRoom();
		
		var maxX = Math.round(webarenaObject.getViewBoundingBoxX()+webarenaObject.getViewBoundingBoxWidth())+300;
		var maxY = Math.round(webarenaObject.getViewBoundingBoxY()+webarenaObject.getViewBoundingBoxHeight())+300;

		if (maxX > currentRoom.getAttribute("width")) {
			GUI.setRoomWidth(maxX);
		}

		if (maxY > currentRoom.getAttribute("height")) {
			GUI.setRoomHeight(maxY);
		}

		
	} else {
		/* set room width/height */
		var currentRoom = ObjectManager.getCurrentRoom();
		if (!currentRoom) return;
		
		var width = currentRoom.getAttribute("width");
		var height = currentRoom.getAttribute("height");
		
		var maxX = 0;
		var maxY = 0;
		
		$.each(ObjectManager.getObjects(), function(key, object) {

			var mx = Math.round(object.getAttribute("x")+object.getAttribute("width"));
			var my = Math.round(object.getAttribute("y")+object.getAttribute("height"));
			
			if (mx > maxX) {
				maxX = mx;
			}
			
			if (my > maxY) {
				maxY = my;
			}

		});

		maxX += 300;
		maxY += 300;
		
		if (maxX < width) {
			width = maxX;
		}
		
		if (maxY < height) {
 			height = maxY;
		}
		
		GUI.setRoomWidth(width);
		GUI.setRoomHeight(height);
		
	}
	
}


GUI.setRoomWidth = function(width) {
	
	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	currentRoom.setAttribute("width", width);
	
	if (width < $(window).width()) {
		width = $(window).width();
	}
	
	$("#content").css("width", width);
	$("#content > svg").css("width", width);
	
}

GUI.setRoomHeight = function(height) {

	var currentRoom = ObjectManager.getCurrentRoom();
	if (!currentRoom) return;
	
	currentRoom.setAttribute("height", height);

	if (height < $(window).height()) {
		height = $(window).height();
	}
	
	$("#content").css("height", height);
	$("#content > svg").css("height", height);
	
}


/* object selection */

GUI.deselectAllObjects = function() {
	
	$.each(ObjectManager.getSelected(), function(index, object) {
		object.deselect();
	});
	
}






/* multi selection */

GUI.shiftKeyDown = false;

GUI.initShiftKeyHandling = function() {

    $(document).click(function(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

	$(document).bind("keydown", function(event) {
		
		if (event.keyCode == 16) {
			GUI.shiftKeyDown = true;
		}
		
	});
	
	$(document).bind("keyup", function(event) {
		
		if (event.keyCode == 16) {
			GUI.shiftKeyDown = false;
		}
		
	});
	
}



/* move by keyboard */

GUI.blockKeyEvents = false;

GUI.initMoveByKeyboard = function() {

	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) != undefined) return;
	
		if (GUI.shiftKeyDown) {
			var d = 10;
		} else {
			var d = 1;
		}
	
		$.each(ObjectManager.getSelected(), function(index, object) {
			
			if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) {
				event.preventDefault();
			} else {
				return;
			}
			
			GUI.hideActionsheet();
			
			if (event.keyCode == 37) {
				object.moveBy(d*(-1), 0);
			}
			
			if (event.keyCode == 39) {
				object.moveBy(d, 0);
			}
			
			if (event.keyCode == 38) {
				object.moveBy(0, d*(-1));
			}
			
			if (event.keyCode == 40) {
				object.moveBy(0, d);
			}
			
		});
		
	});
	
}




GUI.initObjectDeletionByKeyboard = function() {
	
	$(document).bind("keydown", function(event) {
		
		if ($("input:focus,textarea:focus").get(0) == undefined) {
		
			if (event.which == 8 || event.which == 46) {

				event.preventDefault();

				/* delete selected objects */
				$.each(ObjectManager.getSelected(), function(key, object) {

					if ($(object.getRepresentation()).data("jActionsheet")) {
						$(object.getRepresentation()).data("jActionsheet").remove();
					}

					object.deleteIt();

				});
			}
			
		}
		
	});
	
}




/* mouse handler */
GUI.initMouseHandler = function() {


	if (GUI.isTouchDevice) {
		
		var touchHandler = function(event) {
			
			jPopoverManager.hideAll();
			
			var contentPosition = $("#content").offset();

			var x = event.pageX-contentPosition.left;
			var y = event.pageY-contentPosition.top;
			
			if (event.touches.length > 1) {
				var x = event.touches[event.touches.length-1].pageX-contentPosition.left;
				var y = event.touches[event.touches.length-1].pageY-contentPosition.top;
			}
			
			/* find objects at this position */
			var clickedObject = GUI.getObjectAt(x, y);

			if (clickedObject && event.target != $("#content>svg").get(0)) {
				event.preventDefault();
				event.stopPropagation();
				clickedObject.click(event);
			} else {
				GUI.deselectAllObjects();
				GUI.updateInspector();
			}
			
		}
		
		$("#content>svg").get(0).addEventListener("touchstart", touchHandler, false);
		
	} else {
		
		var mousedown = function(event) {
			jPopoverManager.hideAll();

			var contentPosition = $("#content").offset();

			/* find objects at this position */
			var clickedObject = GUI.getObjectAt(event.pageX-contentPosition.left, event.pageY-contentPosition.top);

			if (clickedObject && event.target != $("#content>svg").get(0)) {
                event.preventDefault();
                event.stopPropagation();
				clickedObject.click(event);
			} else {
				/* clicked on background */
                event.preventDefault();
                event.stopPropagation();
				GUI.rubberbandStart(event);
			}

		}
		
		$("#content>svg").bind("mousedown", mousedown);
		
	}
	
}


/* get the topmost object at point x,y which is visible */
GUI.getObjectAt = function(x,y) {
	
	var clickedObject = false;
	
	$.each(ObjectManager.getObjectsByLayer(), function(key, object) {

		var rep = object.getRepresentation();

		if (!object.getAttribute("visible") && !$(rep).hasClass("webarena_ghost")) return;

		if (object.hasPixelAt(x,y)) {
			clickedObject = object;
			return;
		}

	});
	
	return clickedObject;
	
}







GUI.previewableMimeTypes = undefined;

GUI.loadListOfPreviewableMimeTypes=function() {
	/* get list of inline displayable mime types */
			
	Modules.Dispatcher.query('getPreviewableMimeTypes',{},function(list){
		GUI.previewableMimeTypes = list;
	});
	
}

GUI.mimeTypeIsPreviewable=function(mimeType) {
	
	if (GUI.previewableMimeTypes == undefined) {
		GUI.loadListOfPreviewableMimeTypes();
		return false;
	} else {
		if (GUI.previewableMimeTypes[mimeType]) {
			return true;
		} else {
			return false;
		}
	}
	
}



GUI.disconnected = function() {
	
	GUI.showDisconnected();
	GUI.isLoggedIn = false;
	
}

GUI.connected = function() {

	if (GUI.relogin === true) {
		GUI.relogin = false;
		GUI.login();
	}
	
}


GUI.showDisconnected = function() {
	
	if ($("#disconnected_message").length == 0)
	$("body").append('<div id="disconnected_message"><div>Die Verbindung wurde getrennt.</div></div>');

	GUI.isLoggedIn = false;
	GUI.relogin = true;
	
}




GUI.startNoAnimationTimer = function() {
	GUI.noAnimation = window.setTimeout(function() {
		GUI.noAnimation = undefined;
	}, 2000);
}