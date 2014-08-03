"use strict";

/**
 * Object providing functions for tagging	
 *
 * @requires underscore
 */
 
 //var _ = require('underscore');

GUI.tagManager= new function() {
	
	var secTags = [];
	
	var mainTags = [];
	
	this.$sortableOptions = {
				items: "> li",
				connectWith: ".connectedSortable",
				receive: function ( event, ui) {
					console.log(ui.item.data('sectag'));
				}
			};
		
	this.$editableOptions = {
					 indicator : 'Saving...',
					 tooltip   : 'Click to edit...',
					 cssclass  : 'editableInput',
					 onblur    : 'submit'
			};	

	this.createMainTag = function(mainTag){
		console.log("createMainTag");
	}

	this.deleteMainTag = function(mainTag){
		console.log("deleteMainTag");
	}
	
	this.createSecondaryTag = function(secondaryTag, mainTag){
		console.log("createSecondaryTag");
	}
	
	this.deleteSecondaryTag = function(secondaryTag, mainTag){
		console.log("deleteSecondaryTag");
	}
	
		
	this.enableSortable = function() {
		var that = GUI.tagManager;
		$( ".connectedSortable" ).sortable(that.$sortableOptions).disableSelection();
		
	}
	
	this.enableEditable = function() {
		var that = GUI.tagManager;
		$('.editable').editable( 
			function(value, settings) { 
					 console.log(value);
					 return value;
			},  
			that.$editableOptions
		 );
		
	}
			
	//initialization of the dialog
	this.init = function(){
			
		var that = GUI.tagManager;
		
		// sets the the content of the dialog (html)
		this.setDialogContent();
			 
	}
	
	this.bindEvents = function(){
		//var that = GUI.tagManager;
		
		//Shows or hides secondary tags
		$( "#main-tag-container" ).delegate(".portlet-toggle", "click", function() {
		    var icon = $( this );
		    icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
		    icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
		});
		
		
		$( "#main-tag-container" ).delegate(".portlet-delete","click", function() {
		    var that = GUI.tagManager;
		    
		    var mainTagToBeDeleted = "";
		    
		    var icon = $( this );
		    icon.closest( ".portlet" ).remove();
		    that.deleteMainTag(mainTagToBeDeleted);		  
		});
		
		
		$( "#main-tag-container" ).delegate(".sec-tag-delete","click", function() {
			var that = GUI.tagManager;
			
			var mainTag = "";
			var secondaryTagToBeDeleted = "";
			
		    var icon = $( this )
		    icon.closest( "li" ).remove();
		    that.deleteSecondaryTag(secondaryTagToBeDeleted, mainTag);			  
		});
		
					
		$( "#main-tag-container" ).delegate(".portlet-new-sec-tag","click", function() {
		 	var that = GUI.tagManager;
		 	
		 	var mainTag = "";
			var secondaryTagToBeCreated = "";
				
		 	
			var $listToInsertInto = $( this ).next();
			
			
			var secTagTemplate = $("#secondary-tag-tmpl").html();
		    $listToInsertInto.prepend(_.template( secTagTemplate, { secTag : "Type name" } ));
			
				   
			that.enableEditable();
			
			$listToInsertInto.find('.editable').first().click();
			that.createSecondaryTag(secondaryTagToBeCreated, mainTag);		
		});
		
		
		$( ".portlet-new-main-tag" ).click(function() {
			var that = GUI.tagManager;
		
			var mainTagToBeCreated = "";
					
			var mainTagTemplate = $("#main-tag-tmpl").html();
			$(this).after(_.template( mainTagTemplate, { items : [{ id: "", name: "Type name", secTags: []}]} ));	
						
			that.enableEditable();
		
			that.enableSortable();  
			
			$( this ).next().find('.editable').click();
			
			 that.createMainTag(mainTagToBeCreated);	
		});	
	}
	
	
	//sets the content of the dialog 
	this.setDialogContent = function(){
		
		var content = '<div id="main-tag-container">';
		    content+= '<div class="portlet portlet-new-main-tag">';
			content+= '<h2>Create New Main Tag</h2>';
			content+= '</div>';	    	
			content+= '</div>';	   
	
		this.dialogDom = $(content);
	}
	
	
	/**
	 * Set/Edit tags using a dialog
	 * @param {webarenaObject} webarenaObject The web arena object
	 * @param {int} width Width of the dialog
	 * @param {int} [height] Height of the dialog
	 * @param {bool} [passThrough] Additional options for the dialog
	 */
	this.open = function(width, height, passThrough) {
	
		var tests = [ { id: "1", name: "Human-Machine Interaction", secTags: ["Didactics of Informatics","Computer Graphics","Visualization","Image Processing","Human-Computer Interaction","Computers and Society","Computing in Context"] },
					    { id: "2", name: "Software Technologies", secTags: ["Model Driven Software Engineering", "Knowledge-Based Systems","Electronic Commerce","Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
					    { id: "3", name: "Embedded Systems", secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
					    { id: "4", name: "Models and Algorithms", secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"] },
						{ id: "5", name: "Software Technologies 2", secTags: ["Model Driven Software Engineering", "Knowledge- Based Systems", "Electronic Commerce","Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
					    { id: "6", name: "Embedded Systems 2", secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
					    { id: "7", name: "Models and Algorithms 2", secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"]	}];
			
		//TODO: get Tags from the DB
			
		GUI.tagManager.init(); 
		  
		var buttons = {};
		
		buttons[GUI.translate("save")] = function(domContent){
			
			//that.saveChanges();
			
		};

		GUI.dialog("Tag Manager", this.dialogDom, buttons, width, passThrough);
		
		var mainTagTemplate = $("#main-tag-tmpl").html();
		$("#main-tag-container").append(_.template( mainTagTemplate, { items : tests} ));

		var that = GUI.tagManager;
		
		that.bindEvents();
		
		that.enableEditable();
		
		that.enableSortable();	
		
		$("#main-tag-container").find( "h2" ).css("font-size", "12.5px");
				
	}	
}