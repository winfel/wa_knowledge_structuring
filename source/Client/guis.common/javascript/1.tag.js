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
	
	
	var dom = $('');
	dom.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			dom.parent().parent().find(".ui-button-text").click();
		}
	});
	
	var buttons = {};
	
	
	buttons[GUI.translate("SWT")] = function(domContent,buttonsec,width,passThrough,style){
		var buttonsec = {};
		var tagValue;
		var domsec = $('<input type="text" name="textedit" value="" placeholder="" style="'+style+'" />');

	buttonsec[GUI.translate("save")] = function(domContent){

domsec.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			domsec.parent().parent().find(".ui-button-text").click();
			 tagValue = $(domContent).find("input").val();
			 }
		
	});
		
	
	webarenaObject.setAttribute('secondaryTags', tagValue);

	webarenaObject.setAttribute('mainTag', 'SWT');
		
	};
GUI.dialog("Set Sec Tag", domsec, buttonsec, width, passThrough);

	


		
	};
	buttons[GUI.translate("HCI")] = function(domContent){
		var buttonsec = {};
		var tagValue;
		var domsec = $('<input type="text" name="textedit" value="" placeholder="" style="'+style+'" />');

	buttonsec[GUI.translate("save")] = function(domContent){

domsec.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			domsec.parent().parent().find(".ui-button-text").click();
			 tagValue = $(domContent).find("input").val();
			 }
		
	});
		
	
	webarenaObject.setAttribute('secondaryTags', tagValue);

	webarenaObject.setAttribute('mainTag', 'HCI');
		
	};
GUI.dialog("Set Sec Tag", domsec, buttonsec, width, passThrough);		
	
		
	};
	buttons[GUI.translate("ALG")] = function(domContent){
		var buttonsec = {};
		var tagValue;
		var domsec = $('<input type="text" name="textedit" value="" placeholder="" style="'+style+'" />');

	buttonsec[GUI.translate("save")] = function(domContent){

domsec.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			domsec.parent().parent().find(".ui-button-text").click();
			 tagValue = $(domContent).find("input").val();
			 }
		
	});
		
	
	webarenaObject.setAttribute('secondaryTags', tagValue);

	webarenaObject.setAttribute('mainTag', 'ALG');
		
	};
GUI.dialog("Set Sec Tag", domsec, buttonsec, width, passThrough);

	


		
	
		
	};
	
	buttons[GUI.translate("EMB")] = function(domContent){
		var buttonsec = {};
		var tagValue;
		var domsec = $('<input type="text" name="textedit" value="" placeholder="" style="'+style+'" />');

	buttonsec[GUI.translate("save")] = function(domContent){

domsec.bind("keyup", function(event) {
		if (event.keyCode == 13) {
			domsec.parent().parent().find(".ui-button-text").click();
			 tagValue = $(domContent).find("input").val();
			 }
		
	});
		
	
	webarenaObject.setAttribute('secondaryTags', tagValue);

	webarenaObject.setAttribute('mainTag', 'EMB');
		
	};
GUI.dialog("Set Sec Tag", domsec, buttonsec, width, passThrough);

	


		
	
		
	};
	
	GUI.dialog("Set Main Tag", dom, buttons, width, passThrough);
	
}