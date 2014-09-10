"use strict";

/**
 * @file 1.tagManager.js
 */
 
/**
 * Object providing functions for tagging	
 * @function tagManager
 * @requires underscore
 */

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
                                title : GUI.translate("error"),
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
	
	/**
 	* creates the main tag for the new id
 	* @function createMainTag
 	* @param mainTag
 	* @param {int} newId
	* @param callback
 	*/
	this.createMainTag = function(mainTag, newId, callback) {
		// saves the newly created main tag "mainTag" in the database  
		Modules.TagManager.updMainTags(mainTag, newId, callback);
	}
	
	/**
 	* updates the main tag name with the id
 	* @function updateMainTagName
 	* @param {String} oldName
 	* @param {String} newName
 	* @param {int} tagId
	* @param callback
 	*/
	this.updateMainTagName = function(oldName, newName, tagID, callback){		
		// updates the name of the main tag with ID "tagID" in the database  
		Modules.TagManager.updMainTagName(oldName, newName, tagID, function(){
			if(callback != undefined){
				callback(result);
			}
		});
	}
	
	/**
 	* deletes the main tag with the id
 	* @function deleteMainTag
 	* @param {int} mainTagId
	* @param callback
 	*/
	this.deleteMainTag = function(mainTagID, callback) {
		// deletes the main tag with ID "tagID" from the database
		Modules.TagManager.deleteMainTag(mainTagID, function(obj) {
			callback(obj);
		});
	}
	
	/**
 	* creates the secondary tag 
 	* @function createSecondaryTag
 	* @param mainTag
 	* @param secondaryTag
	* @param callback
 	*/
	this.createSecondaryTag = function(mainTag, secondaryTag, callback) {
		// saves the newly created secondary tag "secondaryTag" in the database		
		Modules.TagManager.updSecTags(mainTag, secondaryTag, callback);		
	}
	
	/**
 	* updates the secondary tag 
 	* @function updateSecondaryTagName
 	* @param {int} mainTagId
 	* @param {String} oldName
 	* @param {String} newName
	* @param callback
 	*/
	this.updateSecondaryTagName = function(mainTagID, oldName, newName, callback){
		// updates the name of the secondary tag "oldName" to "newName"  
		Modules.TagManager.updSecTagName(mainTagID, oldName, newName, function(result){
			if(callback != undefined){
				callback(result);
			}
		});
	}
	
	/**
 	* moves the secondary tag 
 	* @function moveSecTag
 	* @param oldMainTag 
 	* @param newMainTag
 	* @param secTag
	* @param callback
 	*/
	this.moveSecTag = function(oldMainTag, newMainTag, secTag, callback){
		// moves the secondary tag "secTag" from main tag "oldMainTag" to "newMainTag"
		Modules.TagManager.moveSecTag(oldMainTag, newMainTag, secTag, function(result){
			if(callback != undefined) {
				callback(result);
			}
		});
	}
	
	/**
 	* deletes the secondary tag 
 	* @function deleteSecondaryTag
 	* @param mainTag 
 	* @param secondaryTag
	* @param callback
 	*/
	this.deleteSecondaryTag = function(mainTag, secondaryTag, callback){
		// deletes the secondary tag "secondaryTag" from the database
		Modules.TagManager.deleteSecTags(mainTag, secondaryTag, function(result){
			callback(result);
		});
	}
	
	/**
 	* Checks the existence of secondary tag
 	* @function checkExistenceOfSecondaryTag
 	* @param secondaryTag 
 	* @param {int} mainTagId
 	*/
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
		
	/**
 	* allows sorting based on tags
 	* @function enableSortable
 	*/	
	this.enableSortable = function() {
		var that = GUI.tagManager;
		$( ".connectedSortable" ).sortable(that.$sortableOptions).disableSelection();
		
	}
	
	/**
 	* allows editing of tags
 	* @function enableEditable
 	*/	
	this.enableEditable = function() {
		var that = GUI.tagManager;
		$('.editable').editable(function(value, settings) {
		        var oldName = this.revert;
		        var mainTagExists = false;
		        
		        if (oldName != value) {
    				// client-side check 
		        	// if the MainTag with this name already exists, discard the new entry
		        	$.each(that.mainTags, function( index, mainTag ) {		
						if (mainTag.name.toLowerCase() == value.toLowerCase()) {
							mainTagExists = true;
							return false;
						}									
					});		        
		        	
                    if(mainTagExists) {
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
                    	    var myPortlet = this;
                    	    var newId = new Date().getTime() - 1296055327011;
                            that.createMainTag(value, newId, function(result) {
                                
                                if (!result.error) {
                                    that.mainTagOperation = "";
                                    var portlet = $(myPortlet).closest('.portlet');
                                    portlet.data('maintag', newId);
                                } else {
                                    $("#container-notifier").notify("create", "withIcon", {
                                        title : GUI.translate("error"),
                                        text: GUI.translate(result.msg),
                                        icon: '/guis.common/images/toast/warning.png'
                                    });
                                }
                            });
    					} else { // update operation
    						var tagID = $(this).closest('.portlet').data('maintag');						 						 
    						that.updateMainTagName(oldName, value, tagID, function() {
    							 
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
			
	/**
	* initialization of the dialog
	* @function init
	*/
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
	
	/**
	* @function bindEvents
	*/
	this.bindEvents = function() {
		//Shows or hides secondary tags
		$("#main-tag-container").delegate(".portlet-toggle", "click", function() {
		    var icon = $( this );
		    icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
		    icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
		});
		
		$("#main-tag-container").delegate(".portlet-delete", "click", function(event) {
			var self = this;
			var that = GUI.tagManager;
			
			// ID of the Main Tag to be deleted
		    var portlet = $(this).closest('.portlet');
		    var name = portlet[0].innerText.trim();
		    var mainTagID = portlet.data('maintag').toString();  
		    		    
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
                    that.mainTags = _.filter(that.mainTags, function(mainTag){ return mainTag.name.toLowerCase() != name.toLowerCase()});
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
	
	/** 
	* sets the content of the dialog 
	* @function setDialogContent
	*/
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