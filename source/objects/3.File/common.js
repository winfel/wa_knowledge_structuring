/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

/**
 * File
 * @class
 * @classdesc Common elements for view and server
 */

var File=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (attributes and actions).
 *
 * @this {File}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/2.IconObject/view.js
 * @see Client/guis.common/javascript/1.svg.js
 * @see Client/guis.common/javascript/0.GUI.js
 * @see objects/1.GeneralObject/view.js
 * @see objects/3.File/client.js
 * @see objects/1.GeneralObject/client.js
 * @param {string} type The type of the object
 */
File.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	this.makeSensitive();
	
	this.registerAttribute('bigIcon',{type:'boolean',standard:true,changedFunction: function(object) { 
		object.updateIcon(); 
	}, checkFunction: function(object, value) {
		if (object.getAttribute("preview")) return "icon size not changeable when preview is shown";
	}});

	this.registerAttribute('mimeType',{type:'text',standard:'text/plain',readonly:true});

	this.registerAttribute('fillcolor',{hidden: true});
	this.registerAttribute('width',{hidden: true});
	this.registerAttribute('height',{hidden: true});
	this.registerAttribute('progress',{hiddhen: true, standard:0.0});
	this.registerAttribute('mainTag',{type:'text', standard:""});
	this.registerAttribute('secondaryTags',{type: 'list', multiple: true});
  
  // Stores the previous position of this object, while it is moved outside a viewer object.
  this.registerAttribute("xPrev", {type: 'number', hidden: true, standard: 0, category: "Dimensions"});
  this.registerAttribute("yPrev", {type: 'number', hidden: true, standard: 0, category: "Dimensions"});

	this.registerAttribute('preview',{type:'boolean',standard:false,category:'Basic',changedFunction: function(object, value, local) {
		if (local) {
			object.updateIcon();
			GUI.updateLayers();
			GUI.deselectAllObjects();
			object.select(true);
		}
	}, checkFunction: function(object, value) {
		
		if (!value) return true; //turning preview off is always a good choice =)
		
		if (object.isPreviewable()) {
			return true;
		} else {
			return "this file is not previewable";
		}
		
	}});
	
	this.registerAction('to front',function(){
	
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")+999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);
	
	this.registerAction('to back',function(){
		
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")-999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);

	this.registerAction(this.translate(this.currentLanguage, "Upload file"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === false);
	});
	
	this.registerAction(this.translate(this.currentLanguage, "Change content"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === true);
	});
	
	this.registerAction(this.translate(this.currentLanguage, "Edit"), function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.setTag();
		});
	}, true);
	
	
	this.registerAction(this.translate(this.currentLanguage, "Download"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.openFile();
			
		}
		
	},true, function() {
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			return (obj.hasContent() == true);
			
		}
		
	});
	
}

/**
 * Uploads, opens or displays a file.
 *
 * @this {File}
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 * @see objects/3.File/client.js
 */
File.execute=function(){

	if (this.hasContent() == true) {
		
		if (this.getAttribute('preview')) return;
		
		this.openFile();
		
	} else {
		this.upload();
	}

}

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
File.isProportional=function(){
	return true;
}

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
File.resizeProportional=function(){
	return true;
}

/**
 * Checks if the object is resizeable (only possible if the object has content and a preview).
 *
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 * @return {boolean} 
 */
File.isResizable=function(){
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return GeneralObject.isResizable.call(this);
	} else return false; 
}

File.register('File');
File.isCreatable=true;

/**
 * Returns always true.
 *
 * @return {boolean} true
 */
File.moveByTransform = function(){return true;};

File.category='Files';

/**
 * Checks if the object is shown always on top.
 *
 * @see objects/1.GeneralObject/client.js
 * @see objects/1.GeneralObject/common.js
 * @return {boolean} false if the object has content and preview, otherwise true.
 */
File.alwaysOnTop = function () {
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return false;
	} else return true;
};

module.exports=File;