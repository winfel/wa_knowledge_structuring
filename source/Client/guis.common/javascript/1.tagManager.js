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
	
	this.currentMainTag = "";
	
	this.oldMainTag = "";
	this.newMainTag = "";
	
	
	this.$sortableOptions = {
				items: "> li",
				connectWith: ".connectedSortable",
				receive: function ( event, ui) {
					var that = GUI.tagManager;
					that.newMainTag = ui.item.closest('.portlet').find('.editable').html();
					var secTag = ui.item.find('.editable-sec').html();
					that.moveSecTag(that.oldMainTag, that.newMainTag, secTag);
					
				},
				start: function(event, ui) {
					var that = GUI.tagManager;
					that.oldMainTag = ui.item.closest('.portlet').find('.editable').html();
				}
			};
		
	this.$editableOptions = {
					 indicator : 'Saving...',
					 tooltip   : 'Click to edit...',
					 cssclass  : 'editableInput',
					 onblur    : 'submit'
			};	

	this.createMainTag = function(mainTag, newId) {
		// saves the newly created main tag "mainTag" in the database  
		Modules.TagManager.updMainTags(mainTag, newId);
	}
	
	this.updMainTagName = function(oldName, newName, tagID){		
		// updates the name of the main tag with ID "tagID" in the database  
		Modules.TagManager.updMainTagName(oldName, newName, tagID);
	}

	this.deleteMainTag = function(mainTag, tagID, callback) {
		// deletes the main tag with ID "tagID" from the database
		Modules.TagManager.deleteMainTag(mainTag, tagID, function(obj) {
			callback(obj);
		});
	}
	
	this.createSecondaryTag = function(mainTag, secondaryTag){
		// saves the newly created secondary tag "secondaryTag" in the database		
		Modules.TagManager.updSecTags(mainTag, secondaryTag);		
	}
	
	this.updSecTagName = function(mainTag, oldName, newName){
		// updates the name of the secondary tag "oldName" to "newName"  
		Modules.TagManager.updSecTagName(mainTag, oldName, newName);
	}
	
	this.moveSecTag = function(oldMainTag, newMainTag, secTag){
		var that = GUI.tagManager;
		// moves the secondary tag "secTag" from main tag "oldMainTag" to "newMainTag"
		Modules.TagManager.moveSecTag(oldMainTag, newMainTag, secTag);
	}
	
	this.deleteSecondaryTag = function(mainTag, secondaryTag, callback){
		// deletes the secondary tag "secondaryTag" from the database
		Modules.TagManager.deleteSecTags(mainTag, secondaryTag, function(obj){
			callback(obj);
		});
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
			    
			        if (oldName != value) {
        			     // if a MainTag with this name already exists, discard the new entry
                         for (var index = 0; index < that.mainTags.length; ++index) {
                            if (that.mainTags[index].name == value) {
                            
                                alert("A main tag with the specified name already exists");
                                
                                return this.revert;
                                
                            }
                         }
			        }
			    
					 // console.log(value);					
					 if (that.mainTagOperation == "create") {
					     var newId = new Date().getTime() - 1296055327011;
						 that.createMainTag(value, newId);
						 that.mainTagOperation = "";
						 
						 $(this).parent().find('#main-tag-id').data("tag-id", newId );
					 } else {
						 var tagID = $(this).parent().find('#main-tag-id').data("tag-id");
						 
						 if (!tagID) {
						     tagID = $(this).parent().find('#main-tag-id').html();;
						 }
						 
						 that.updMainTagName(oldName, value, tagID);
					 }
					 
					 return value;
			},  
			that.$editableOptions
		 );
		$('.editable-sec').editable( 
				function(value, settings) { 
						 // console.log(value);						 
						 if(that.secTagOperation == "create"){
							 that.createSecondaryTag(that.currentMainTag, value);
							 that.secTagOperation = "";
						 } else{
							 var oldName = this.revert;
							 that.updSecTagName(that.currentMainTag, oldName, value);
						 }
						 return value;
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
		//var that = GUI.tagManager;
		
		//Shows or hides secondary tags
		$( "#main-tag-container" ).delegate(".portlet-toggle", "click", function() {
		    var icon = $( this );
		    icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
		    icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
		});
		
		$( "#main-tag-container" ).delegate(".portlet-delete", "click", function() {
			var self = this;
			var that = GUI.tagManager;
		    var mainTagToBeDeleted = $(this).parent().find('.editable').html();
		    
		    var tagID = $(this).parent().find('#main-tag-id').html();
		    if (!tagID) {
		        tagID = $(this).parent().find('#main-tag-id').data("tag-id");
		    }
		    
            that.deleteMainTag(mainTagToBeDeleted, tagID, function(obj) {
                if (obj.error && obj.error == true) {
                    alert(obj.msg);
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
		    	if(obj.error && obj.error == true){
		    		alert(obj.msg);		    		
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
			//that.currentMainTag = $(this).closest('.portlet').data('maintag');
			that.currentMainTag = $(this).closest('.portlet').find('.editable').html();
			
			$listToInsertInto.find('.editable-sec').first().click();
			
			
			//that.createSecondaryTag(secondaryTagToBeCreated, mainTag);		
		});
		
		$( "#main-tag-container" ).delegate(".editable-sec","click", function() {
		 	
			//that.currentMainTag = $(this).closest('.portlet').data('maintag');
			that.currentMainTag = $(this).closest('.portlet').find('editable').html();
				
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
		
		//$("#main-tag-container").find( "h2" ).css("font-size", "12.5px");
				
	}	
}