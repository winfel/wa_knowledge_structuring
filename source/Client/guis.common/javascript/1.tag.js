"use strict";

/**
 * Edit a text using a dialog
 * @param {webarenaObject} webarenaObject The web arena object
 * @param {int} width Width of the dialog
 * @param {int} [height] Height of the dialog
 * @param {bool} [passThrough] Additional options for the dialog
 */
GUI.setTag = function(webarenaObject, width, height, passThrough) {
	
	var style = 'font-family: '+webarenaObject.getAttribute("font-family")+'; ';
	style += 'color: black; '
	style += 'font-size: '+webarenaObject.getAttribute("font-size")+'px; ';
	style += 'resize:none; ';
	style += 'width: 100%; ';
	
	if (height) {
		style += 'height: '+height+'px; ';
	} else {
		style += 'height: 100%; ';
	}
	
	
	var dom = $('<input type="text" name="textedit" value="" placeholder="" style="'+style+'" />');
	dom.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			dom.parent().parent().find(".ui-button-text").click();
		}
	});
	
	var buttons = {};
	
	buttons[GUI.translate("save")] = function(domContent){
		
		
	var tagValue = $(domContent).find("input").val();
	webarenaObject.setAttribute('mainTag', tagValue);
		
	};
	
	GUI.dialog("Set Tag", dom, buttons, width, passThrough);
	
}