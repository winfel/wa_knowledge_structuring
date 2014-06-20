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
	
	var counter = 0;
	
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
	
	/*				
	// the dialog content of the dialog (its html)
	var dialogHtml = "";
		
	// selector for the container for main tags
	var $containerMainTags;
	*/	
		
	//initialization of the dialog
	this.init = function(){
			
		var that = GUI.tagManager;
		
		// sets the the content of the dialog (html)
		this.setDialogContent();
			 
			
		/*	
		// sets the the content of the dialog (html)
		this.setDialogContent();
		
		// set selectors used for manipulation of the objects in the dialog
		this.$containerMainTags = this.dialogDom.find("#mainTag");
	    this.$documentName = this.dialogDom.find("#document-name"); 
	    	
		// gets all existing main tags from the database
		Modules.TagManager.getMainTags(this.setMainTags);
				
		// gets all existing secondary tags from the database for a specified main tag
		Modules.TagManager.getSecTags(this.mainTag, this.setSecondaryTags);
	   
	    // binds the events for the main tag buttons, paging buttons, 
	    // and the input field for creation of secondary tags
	    this.bindEvents();
	    */
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
	
	
	this.setMainTags = function(list) {
		
		var that = GUI.tagManager;
		
		that.mainTags = list;

		for(var i = 0; i<that.mainTags.length; i++){
						
			Modules.TagManager.getSecTags(that.mainTags[i].name, that.setSecondaryTags);

		}
		
		that.end();
		
	};
	
	
	 this.setSecondaryTags = function(list){
			
		var that = GUI.tagManager;
			
		that.mainTags[counter].secTags = list[0].secTags.slice(0);	
		delete that.mainTags[counter]._id;
		
		counter++;
		
	 };
	 
	 this.end = function(){
	 
		var that = GUI.tagManager;
		
		counter = 0;
	 			 
		var mainTagTemplate = $("#main-tag-tmpl").html();
		
		console.log(that.mainTags);
		
		$("#main-tag-container").append(_.template( mainTagTemplate, { items : that.mainTags} ));	
			
		that.bindEvents();
		
		that.enableEditable();
		
		that.enableSortable();	
	 }
	 
	 

	/*
	//removes already assigned secondary tags from the list of all unassigned secondary tags (edit mode)
	this.filterSecondaryTags = function (list){
		var that = GUI.tagManager;
		$.each(list, function( index, value ) {		
			that.removeListItem( that.unassignedSecTags, value);
			
		});
			
	};
	
	
	// moves secondary tag from the list of unassigned tags into the list of assigned tags
	// called when tag is assigned
	this.moveIntoListOfAssignedTags = function( value ) {
		var that = GUI.tagManager;
		
		that.removeListItem(that.unassignedSecTags, value);
		
		that.assignedSecTags.push(value);
		
		that.updatePagingParameters();
		
	};
	
	
	// moves secondary tag from the list of assigned tags into the list of unassigned tags
	// called when tag is unassigned
	this.moveIntoListOfUnassignedTags = function( value ) {
		var that = GUI.tagManager;
		
		//that.unassignedSecTags.sort();
		that.removeListItem(that.assignedSecTags, value);

		that.unassignedSecTags.push(value);	
		
		that.updatePagingParameters();
		
		
	};
	
	
	//draws the current page unassigned tags  
	this.drawUnassignedTags = function(){
		var that = GUI.tagManager;
		
		that.$containerUnassignedSecondaryTags.html("");
		
		var tagList = that.getCurrentPageTags();
		
		$.each(tagList, function( index, value ) {		
			that.drawTag(value,that.$containerUnassignedSecondaryTags, "unassigned");
			
		});
		
		that.makeTagItemsDraggable(that.$containerUnassignedSecondaryTags);
	};
	
	
	//draws the assigned tags
	this.drawAssignedTags = function(){
	
		var that = GUI.tagManager;
		var container = that.$containerAssignedSecondaryTags.find('.tags');
		container.html("");
		
		$.each(that.assignedSecTags, function( index, value ) {		
			that.drawTag(value, container, "assigned");
			
		});
		
		that.makeTagItemsDraggable(container);
		
	};
	
	this.drawTag = function(value, container, s){
	
		var that = GUI.tagManager;
		
		if(s=="assigned"){
		
			$(
			  '<li class="ui-widget-content" data-sectag="'+value+'">'+
				  '<h5 class="ui-widget-header tagValue">'+value+'</h5>'+
			  '</li>'
			 ).appendTo(container);
		}
		else{
			$(
			  '<li class="ui-widget-content" data-sectag="'+value+'">'+
				  '<h5 class="ui-widget-header tagValue">'+value+'</h5>'+
			//      '<a href="" id="del-tag" title="Delete this tag" class="ui-icon ui-icon-closethick">Delete image</a>'+
			  '</li>'
			 ).appendTo(container);
		
		}
		
		that.makeTagItemsDraggable(container);
		
	};
	
	//draws the main tags
	this.drawMainTags = function(){
		
		var that = GUI.tagManager; 
			
		that.$containerMainTags.find( "button" ).remove();
		
		$.each(this.mainTags, function( index, value ) {
			
			if(that.mainTag == value.name) {
				
				$('<button type="button" class="assigned-main-tag">'+value.name+'</button>')
				.appendTo(that.$containerMainTags);
				
	 		} else {
	 			
	 			$('<button type="button">'+value.name+'</button>').appendTo(that.$containerMainTags);
	 		}
			
		});	
		
	}
	
	
	//makes the tag items draggable
	this.makeTagItemsDraggable = function(container) {		

		  $( "li", container ).draggable({
		
		  revert: "invalid", // when not dropped, the item will revert back to its initial position
		  containment: "document",
		  helper: "clone",
		  cursor: "move"
		  
		});
		
	};

	//makes the containers for assigned and unassigned tags droppable
	this.makeContainersDroppable = function() { 
		
		var that = GUI.tagManager; 
		
		// let the container for assigned tags be droppable,
		//accepting the unassigned tag items
		that.$containerAssignedSecondaryTags.droppable({
		  accept: "#unassignedTags > li",
		  activeClass: "ui-state-highlight",
		  drop: function( event, ui ) {
			  //var that = GUI.tagManager; 
			  that.assignTag( ui.draggable );				
			
		  }
		});
	 
		// let the container for unassigned tags be droppable as well
		//accepting the assigned tag items
		that.$containerUnassignedSecondaryTags.droppable({
		  accept: "#document li",
		  activeClass: "custom-state-active",
		  drop: function( event, ui ) {
			  //var that = GUI.tagManager; 
			  that.unassignTag( ui.draggable );
			
		  }
		});
	};
	
	// assign tag to the file object
	this.assignTag = function( $item ) {
		var that = GUI.tagManager; 
		$item.fadeOut(function() {
			
			var $list = $( "ul", that.$containerAssignedSecondaryTags );  
			
			$item.appendTo( $list ).fadeIn(function() {
				
				$item.animate();
				
				var tagValue = $item.data("sectag");
				
				that.moveIntoListOfAssignedTags( tagValue );
				
				that.drawUnassignedTags();
			});
		});
				  		  
	};
	
	// unassign tag from the file object object
	this.unassignTag = function( $item ) {
		var that = GUI.tagManager;
		
		$item.fadeOut(function() {
			
			$item.animate();
			$item.remove();
			
		});
	
		var tagValue = $item.data("sectag");
		
		that.moveIntoListOfUnassignedTags( tagValue );
		
		that.drawUnassignedTags();
	};

	// update the main tag and secondary tag atrributes of the file object
	this.saveChanges = function (){
		var that = GUI.tagManager;

		that.webarenaObject.setAttribute('mainTag',that.mainTag);
		
		// done in this way cause it doesn't accept the 'assignedSecTags' 
		// directly as a parameter in the setAttribute function
		var list = [];
		$.each(that.assignedSecTags,function (index, value){			
			list.push(value);
		});
		
		that.webarenaObject.setAttribute('secondaryTags', list );
		
	}
	
	*/
	
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
		  
		console.log(tests);
				
		GUI.tagManager.init(); 
		  
		var buttons = {};
		
		buttons[GUI.translate("save")] = function(domContent){
			
			//that.saveChanges();
			
		};

		GUI.dialog("Tag Manager", this.dialogDom, buttons, width, passThrough);

		var that = GUI.tagManager;
		
		Modules.TagManager.getMainTags(that.setMainTags);
				
	}	
}

/*
$(function() { 
	var mainTags = [ { id: "1", name: "Human-Machine Interaction", secTags: ["Didactics of Informatics","Computer Graphics","Visualization","Image Processing","Human-Computer Interaction","Computers and Society","Computing in Context"] },
					    { id: "2", name: "Software Technologies", secTags: ["Model Driven Software Engineering", "Knowledge-Based Systems","Electronic Commerce","Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
					    { id: "3", name: "Embedded Systems", secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
					    { id: "4", name: "Models and Algorithms", secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"] },
						{ id: "5", name: "Software Technologies 2", secTags: ["Model Driven Software Engineering", "Knowledge- Based Systems", "Electronic Commerce","Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
					    { id: "6", name: "Embedded Systems 2", secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
					    { id: "7", name: "Models and Algorithms 2", secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"]	}];
						  
	var mainTagTemplate = $("#main-tag-tmpl").html();
	$("#main-tag-container").append(_.template( mainTagTemplate, { items : mainTags} ));
	
	//GUI.tagManager.init();
});
*/