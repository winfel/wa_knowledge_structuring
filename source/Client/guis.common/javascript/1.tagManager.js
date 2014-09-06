"use strict";

/**
 * Object providing functions for tagging	
 *
 * @requires underscore
 */
 
 //var _ = require('underscore');

GUI.tagManager = new function() {
	
	var secTags = [];
	
	// list containing all existing main tags
	this.mainTags = [];
	
	//the operation to be performed in db
	//possible values "edit" or "create"
	this.mainTagOperation = "";
	this.secTagOperation = "";
	
	this.oldMainTagName = "";
	
	this.currentMainTagID = "";
	this.currentMainTag = "";
	
	this.oldMainTag = "";
	this.oldMainTagID = "";
	this.newMainTag = "";
	
	
	this.$sortableOptions = {
				items: "> li",
				connectWith: ".connectedSortable",
				receive: function ( event, ui) {
					var that = GUI.tagManager;
					
					var newMainTagID = ui.item.closest('.portlet').data('maintag').toString();
					var secTag = ui.item.find('.editable-sec').html();					
					
					
					that.moveSecTag(that.oldMainTagID, newMainTagID, secTag, function(result){
						if(result.error){
							$("#container-notifier").notify("create", "withIcon", {
                                title :  GUI.translate("error"),
                                text: GUI.translate(result.msg),
                                icon: '/guis.common/images/toast/warning.png'
                            });	
							$(ui.sender).sortable('cancel');
						}
					});															
				},
				start: function(event, ui) {
					var that = GUI.tagManager;					
					that.oldMainTagID = ui.item.closest('.portlet').data('maintag').toString();
				}
	};
		
	this.$editableOptions = {
					 indicator : 'Saving...',
					 tooltip   : 'Click to edit...',
					 cssclass  : 'editableInput',
					 onblur    : 'submit'
	};	

	this.createMainTag = function(mainTag, newId, callback) {
		// saves the newly created main tag "mainTag" in the database  
		Modules.TagManager.updMainTags(mainTag, newId, callback);
	}
	
	this.updateMainTagName = function(oldName, newName, tagID, callback){		
		// updates the name of the main tag with ID "tagID" in the database  
		Modules.TagManager.updMainTagName(oldName, newName, tagID, function(){
			if(callback != undefined){
				callback(result);
			}
		});
	}

	this.deleteMainTag = function(mainTagID, callback) {
		// deletes the main tag with ID "tagID" from the database
		Modules.TagManager.deleteMainTag(mainTagID, function(obj) {
			callback(obj);
		});
	}
	
	this.createSecondaryTag = function(mainTag, secondaryTag, callback) {
		// saves the newly created secondary tag "secondaryTag" in the database		
		Modules.TagManager.updSecTags(mainTag, secondaryTag, callback);		
	}
	
	this.updateSecondaryTagName = function(mainTagID, oldName, newName, callback){
		// updates the name of the secondary tag "oldName" to "newName"  
		Modules.TagManager.updSecTagName(mainTagID, oldName, newName, function(result){
			if(callback != undefined){
				callback(result);
			}
		});
	}
	
	this.moveSecTag = function(oldMainTag, newMainTag, secTag, callback){
		// moves the secondary tag "secTag" from main tag "oldMainTag" to "newMainTag"
		Modules.TagManager.moveSecTag(oldMainTag, newMainTag, secTag, function(result){
			if(callback != undefined) {
				callback(result);
			}
		});
	}
	
	this.deleteSecondaryTag = function(mainTag, secondaryTag, callback){
		// deletes the secondary tag "secondaryTag" from the database
		Modules.TagManager.deleteSecTags(mainTag, secondaryTag, function(result){
			callback(result);
		});
	}
	
	this.checkExistenceOfSecondaryTag = function(secondaryTag, mainTagId){
		var that = GUI.tagManager;
		var secondaryTagExists = false;
		var currentMainTagWithSecTags = [];
		$.each(that.mainTags, function( index, mainTag ) {		
			if (mainTag.id == mainTagId){
				currentMainTagWithSecTags = mainTag;
				return false;
		 	}									
		});		 
		$.each(currentMainTagWithSecTags.secTags, function( index, secTag ) {		
			if (secTag.toLowerCase() == secondaryTag.toLowerCase()){
				secondaryTagExists = true;
				return false;
			}									
		});
		return secondaryTagExists;
	}
		
	this.enableSortable = function() {
		var that = GUI.tagManager;
		$( ".connectedSortable" ).sortable(that.$sortableOptions).disableSelection();
		
	}
	
	this.enableEditable = function() {
		var that = GUI.tagManager;
		$('.editable').editable( 
			function(value, settings) {
		        var oldName = this.revert;
		        var mainTagExists = false;
		        if (oldName != value) {
    				// client-side check 
		        	// if the MainTag with this name already exists, discard the new entry
		        	$.each(that.mainTags, function( index, mainTag ) {		
						if (mainTag.name.toLowerCase() == value.toLowerCase()){
							mainTagExists = true;
							return false;
						}									
					});		        	
                    if(mainTagExists){
                    	$("#container-notifier").notify("create", "withIcon", {
                            title :  GUI.translate("error"),
                            text: GUI.translate("tagManager.duplicateMainTag.error"),
                            icon: '/guis.common/images/toast/warning.png'
                        });
                        if (that.mainTagOperation == "create") {
                        	$(this).closest(".portlet").remove();
                        }
                        that.mainTagOperation = ""; //reset the main tag operation
                        return this.revert;
                    } else {
                    	if (that.mainTagOperation == "create") {
    					    var newId = new Date().getTime() - 1296055327011;
    						that.createMainTag(value, newId);
    						
    						$(this).closest('.portlet').data('maintag', newId);
    					} else { // update operation
    						var tagID = $(this).closest('.portlet').data('maintag');						 						 
    						that.updateMainTagName(oldName, value, tagID, function(){
    							 
    						});
    					}		
                    	that.mainTagOperation = ""; //reset the main tag operation
    					return value;	
                    }
		        }
			},  
			that.$editableOptions
		);
		$('.editable-sec').editable(
			function(value, settings){
				var self = this;
				var currentSecondaryTag = value;
				var currentMainTagWithSecTags;
				var secondaryTagExists = false;
				 
				that.currentMainTagID = $(this).closest('.portlet').data('maintag').toString();
				that.currentMainTag = $(this).closest('.portlet').find('.editable').html();
				 
				secondaryTagExists = that.checkExistenceOfSecondaryTag(currentSecondaryTag, that.currentMainTagID);						 
				 
				if(secondaryTagExists){								 
					$("#container-notifier").notify("create", "withIcon", {
				    	title :  GUI.translate("error"),
				    	text: GUI.translate("tagManager.duplicateSecondaryTag.error"),
				    	icon: '/guis.common/images/toast/warning.png'
				  	});								
					if(that.secTagOperation == "create"){									
						$(self).closest("li").remove();
					}
					that.secTagOperation = "";
					return self.revert;
				} else {
					if(that.secTagOperation == "create"){
						that.createSecondaryTag(that.currentMainTag, value);
						that.secTagOperation = "";
					} else {
						var oldName = this.revert;
						that.updateSecondaryTagName(that.currentMainTagID, oldName, value, function(){
							 
						});
						that.secTagOperation = "";
					}
					return value;
				}
			},
			that.$editableOptions
		);	
	}
			
	//initialization of the dialog
	this.init = function() {
			
		var that = GUI.tagManager;
		
		// sets the the content of the dialog (html)
		this.setDialogContent();
		
		Modules.TagManager.getMainTagsAndSecTags(function(mainTagList){
			that.mainTags = mainTagList;
			
			var mainTagTemplate = $("#main-tag-tmpl").html();
			$("#main-tag-container").append(_.template( mainTagTemplate, { items : mainTagList} ));
			
			that.bindEvents();			
			that.enableEditable();			
			that.enableSortable();
		});
			 
	}
	
	this.bindEvents = function(){
		//Shows or hides secondary tags
		$("#main-tag-container").delegate(".portlet-toggle", "click", function() {
		    var icon = $( this );
		    icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
		    icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
		});
		
		$("#main-tag-container").delegate(".portlet-delete", "click", function() {
			var self = this;
			var that = GUI.tagManager;
			
			// ID of the Main Tag to be deleted
		    var mainTagID = $(this).closest('.portlet').data('maintag').toString();		    
		    		    
            that.deleteMainTag(mainTagID, function(obj) {
                if (obj.error && obj.error == true) {
                    $("#container-notifier").notify("create", "withIcon", {
                        title :  GUI.translate("error"),
                        text: GUI.translate(obj.msg),
                        icon: '/guis.common/images/toast/warning.png'
                    }, { expires: 7000});
                } else {
                    var icon = $(self);
                    icon.closest(".portlet").remove();
                }
            });
		});
		
		$( "#main-tag-container" ).delegate(".sec-tag-delete","click", function() {
			var self = this;
			var that = GUI.tagManager;
			
			var mainTag = $(this).closest('.portlet').find('.editable').html();
			var secondaryTagToBeDeleted = $(this).parent().find('.editable-sec').html();
			
		    
		    that.deleteSecondaryTag(mainTag, secondaryTagToBeDeleted, function(obj){
		    	if(obj.error && obj.error == true) {
		    		$("#container-notifier").notify("create", "withIcon", 
		    			{
	                    	title : GUI.translate("error"),
	                    	text: GUI.translate(obj.msg),
	                    	icon: '/guis.common/images/toast/warning.png'
	               		}, 
	               		{ expires: 7000}
	               	);
		    	} else {
		    		var icon = $( self )
				    icon.closest( "li" ).remove();
		    	}		    	
		    });			  
		});
		
					
		$( "#main-tag-container" ).delegate(".portlet-new-sec-tag","click", function() {
		 	var that = GUI.tagManager;		 	
		 	var mainTag = "";
			var secondaryTagToBeCreated = "";
			var $listToInsertInto = $( this ).next();
			var secTagTemplate = $("#secondary-tag-tmpl").html();
			
		    $listToInsertInto.prepend(_.template( secTagTemplate, { secTag : "" } ));	   
			that.enableEditable();
			that.secTagOperation = "create";
			
			$listToInsertInto.find('.editable-sec').first().click();
					
		});
		
		$( ".portlet-new-main-tag" ).click(function() {
			var that = GUI.tagManager;
		
			var mainTagToBeCreated = "";
					
			var mainTagTemplate = $("#main-tag-tmpl").html();
			$(this).after(_.template( mainTagTemplate, { items : [{ id: "", name: "", secTags: []}]} ));	
						
			that.enableEditable();
		
			that.enableSortable();  
			
			that.mainTagOperation = "create";
			$( this ).next().find('.editable').click();
			
			//that.createMainTag(mainTagToBeCreated);	
		});
		
		
	}
	
	
	//sets the content of the dialog 
	this.setDialogContent = function(){		
		var mainTagTemplate = $("#tag-manager-content-tmpl").html();
		this.dialogDom = $(mainTagTemplate);
	}
	
	
	/**
	 * Set/Edit tags using a dialog
	 * @param {webarenaObject} webarenaObject The web arena object
	 * @param {int} width Width of the dialog
	 * @param {int} [height] Height of the dialog
	 * @param {bool} [passThrough] Additional options for the dialog
	 */
	this.open = function(width, height, passThrough) {		
		var that = GUI.tagManager;
		
		GUI.tagManager.init(); 
		  
		var buttons = {};
		
		buttons[GUI.translate("close")] = function(domContent){		
			
		};		
		
		passThrough = { "position": ['middle',50] };
		GUI.dialog("Manage Tags", this.dialogDom, buttons, width, passThrough);
				
	}	
}