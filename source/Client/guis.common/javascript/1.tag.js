"use strict";

/**
 * Object providing functions for tagging	
 */

GUI.tagManager= new function() {

	
	//list containing all existing main tags
	var mainTags = [];
	
	//string which is the already assigned main tag
	var mainTag = "";
	
	//list containing all secondary tags related to the chosen main tag
	var unassignedSecTags = [];
	
	//list containing all already assigned secondary tags
	var assignedSecTags = [];
	
	//
	var webarenaObject;
	
	//dialog html
	var dialogHtml = "";
	
	//container for unassigned secondary tags 
	var $containerUnassignedSecondaryTags;
	
	//container for the document
	var $containerAssignedSecondaryTags;
	
	//container for main tags
	var $containerMainTags;
	
	//custom tag
	var $customTag;
	
	//custom tag
	var $documentName;
	
	//paging
	var totalPages;
	//
	var currentPage;
	
	//
	var tagsPerPage;
	
	this.init = function(webarenaObject){
				
		this.setDialogContent();
		
		//var dom = GUI.tagManager.dialogDom;
		
		// set selectors
		this.$containerUnassignedSecondaryTags = this.dialogDom.find("#unassignedTags");
		this.$containerAssignedSecondaryTags = this.dialogDom.find("#document");
		this.$containerMainTags = this.dialogDom.find("#mainTag");
		this.$customTag = this.dialogDom.find("#custom-tag")
	    this.$documentName = this.dialogDom.find("#document-name"); 
	    
		this.makeContainersDroppable();
	    
		this.currentPage = 1;
		this.tagsPerPage = 6;
		
	
		this.webarenaObject = webarenaObject;
		this.mainTag = webarenaObject.getAttribute('mainTag');
		Modules.TagManager.getMainTags(this.setMainTags);
		
			
		this.assignedSecTags = webarenaObject.getAttribute('secondaryTags');
		this.drawAssignedTags();
			
		
		Modules.TagManager.getSecTags(this.mainTag, this.setSecondaryTags);	
	   
	
	    var documentName = webarenaObject.getAttribute('name');
	    this.$documentName.text(documentName);
	    
	    this.bindEvents();
	    
	    
	}
	
	this.setDialogContent = function(){
		
		var content = '<div id="tabs"  class="ui-tabs ui-widget ui-widget-content ui-corner-all" style="width: 565px">';
			content+= '	<ul>';
			content+= '		<li><a href="#mainTag">Main Tag</a></li>';
			content+= '		<li><a href="#secondaryTags">Secondary Tag</a></li>';
			content+= '	</ul>';
			content+= '	<div id="mainTag">';
			content+= '	</div>';
			content+= ' <div id="secondaryTags">';
			content+= '		<div class="ui-widget ui-helper-clearfix" style="width: 535px">';
			content+= '			<div class="unassignedTags">';
			content+= '     	    <div class="inner-unassignedTags">';
			content+= '					<ul id="unassignedTags" class="tags ui-helper-reset ui-helper-clearfix">';
			content+= '					</ul>';
			content+= '			    </div>';
			content+= '			<div class="buttons-holder">';			
			content+= '				<button id="btn-previous"><</button>';
			content+= '				<button id="btn-next">></button>';
			content+= '			</div>';
			content+= '     	<div class="custom-tag-holder">';
			content+= '     		<label for="custom-tag"><b>Custom tag:</b> </label>';
		    content+= '				<input id="custom-tag">';
			content+= '			</div>';		
			content+= '			</div>';
			content+= '			<div id="document" class="ui-widget-content ui-state-default">';
			content+= '				<h4 class="ui-widget-header"><span id="document-name"></span></h4>';
			content+= ' 	    	<ul class="tags ui-helper-reset" id="assignedTags">';
			content+= ' 	    	</ul>';
			content+= '     	</div>';
			content+= '     </div>';
			content+= ' </div>';
			content+= '</div>';
			
		this.dialogDom = $(content);
		
	}
	

	this.bindEvents = function(){
		var that = GUI.tagManager;
		$("#mainTag :button").live("click", function(){
			
			// set the main tag
			that.mainTag = $(this).text();
			$("#mainTag :button").removeClass('assigned-main-tag');
			$(this).addClass('assigned-main-tag');
			
			//get the appropriate secondary tags for the chosen main tag
			Modules.TagManager.getSecTags(that.mainTag, that.setSecondaryTags);
			
			//enable the page with secondary tags
			$("#tabs").tabs("enable", 1);
			
			// go to secondary tags page
			//$( "#tabs" ).tabs( "select", 1 );
			
		});	
		
		$("#custom-tag").live("keyup", function(event) {
		//$customTag.live("keyup", function(event) {
			var that = GUI.tagManager;
			var customTagValue = $(this).val();
			
			if (event.keyCode == 13 && customTagValue != "") {
				
				//remove the newly created tag if it already exists in the list of unassigned secondary tags
				// and redraw the unassigned secondary tags
				that.removeListItem( that.unassignedSecTags, customTagValue);
				that.drawUnassignedTags();
				
				//insert the newly created secondary tag into the list of assigned secondary tags
				// and redraw the assigned secondary tags
				that.assignedSecTags.push(customTagValue);
				that.drawAssignedTags();
				
				//save the newly created tag in the database
				Modules.TagManager.updSecTags(that.mainTag, customTagValue);
				
				//reset the value of the input field
				$(this).val("");
			}
			
		});
		
	    //paging button functions
	    $( "#btn-next" ).die().live("click", function(){
	    	var that = GUI.tagManager;
	    	
			if(that.currentPage == that.totalPages) return; 
			
			that.currentPage++;
			that.drawUnassignedTags();
		});

	
		$( "#btn-previous" ).die().live("click", function(){
			var that = GUI.tagManager;
			
			if(that.currentPage < 2) return;
			
			that.currentPage--;
			that.drawUnassignedTags();
		});
	
	}
	



	this.removeListItem = function(arr, item) {
	    for (var index = 0; index < arr.length; index++) {
	        if (arr[index] === item) {
	            arr.splice(index, 1);
	            index--;
	        }
	    }
	}
	
	this.setMainTags = function(list) {
		var that = GUI.tagManager;
		
		that.mainTags = list;
		
		that.drawMainTags();
			
	};


	this.setSecondaryTags = function(list){
		var that = GUI.tagManager;
		if(list != undefined && list.length > 0){
			
			that.unassignedSecTags = list[0].secTags;	
			that.filterRelatedTags(that.assignedSecTags);
			
			that.setTotalPages();	
			that.drawUnassignedTags();
		}
			
	};
	
	
	//removes already assigned tags from the list of related tags (edit mode)
	this.filterRelatedTags = function (list){
		var that = GUI.tagManager;
		$.each(list, function( index, value ) {		
			that.removeListItem( that.unassignedSecTags, value);
			
		});
			
	};
	
	
	//return tags for the new page
	this.getCurrentPageTags = function(){
		var that = GUI.tagManager;
		var startIndex = (that.currentPage-1) * that.tagsPerPage;
		
		var endIndex = startIndex + that.tagsPerPage;
		
		var tagList = that.unassignedSecTags.slice(startIndex, endIndex);
		
		return tagList;
		
	};
	
	//returns the very first not shown tag
	//called when tag is assigned
	this.getNextTag = function(value){
		var that = GUI.tagManager;
		var index = that.unassignedSecTags.indexOf(value) + 1;		
		
		return that.unassignedSecTags[index];
		
	};
	
	//moves secondary tag from the list of unassigned tags into list of assigned tags
	//called when tag is assigned
	this.moveIntoListOfAssignedTags = function( value ) {
		var that = GUI.tagManager;
		that.removeListItem(that.unassignedSecTags, value);
		that.assignedSecTags.push(value);
		
		that.setTotalPages();
		
	};
	
	this.setTotalPages = function(){
		var that = GUI.tagManager;
		that.totalPages = Math.ceil( this.unassignedSecTags.length / this.tagsPerPage);
	
	};
	
	//returns tag to the list of all related tags
	//called when tag is unassigned
	this.moveIntoListOfUnassignedTags = function( value ) {
		var that = GUI.tagManager;
		that.unassignedSecTags.push(value);		
		that.unassignedSecTags.sort();
		that.removeListItem(that.assignedSecTags, value);
		
		that.setTotalPages();
		
		
	};
	
	// shows the tags in the container for tags
	//used for paging
	this.drawUnassignedTags = function(){
		var that = GUI.tagManager;
		that.$containerUnassignedSecondaryTags.html("");
		
		var tagList = that.getCurrentPageTags();
		
		$.each(tagList, function( index, value ) {		
			that.drawTag(value,that.$containerUnassignedSecondaryTags);
			
		});
		
		that.makeTagItemsDraggable(that.$containerUnassignedSecondaryTags);
	};
	
	
	//shows the tags in the container for tags
	//used for paging
	this.drawAssignedTags = function(){
	
		var that = GUI.tagManager;
		var container = that.$containerAssignedSecondaryTags.find('.tags');
		container.html("");
		
		$.each(that.assignedSecTags, function( index, value ) {		
			that.drawTag(value, container);
			
		});
		
		that.makeTagItemsDraggable(container);
		
	};
	
	this.drawTag = function(value, container){
	
		var that = GUI.tagManager;
		
		$('<li class="ui-widget-content" data-sectag="'+value+'"><h5 class="ui-widget-header tagValue">'+value+'</h5></li>').appendTo(container);
		
		that.makeTagItemsDraggable(container);
		
	};
	
	
	this.drawMainTags = function(){
		
		var that = GUI.tagManager; 
		$.each(this.mainTags, function( index, value ) {
			
			if(that.mainTag == value.name) {
				
				$('<button type="button" class="assigned-main-tag">'+value.name+'</button>').appendTo(that.$containerMainTags);
				
	 		} else {
	 			
	 			$('<button type="button">'+value.name+'</button>').appendTo(that.$containerMainTags);
	 		}
			
		});	
		
	}
	
	
	//makes the tags draggable and droppable
	this.makeTagItemsDraggable = function(container) {		

		// let the tag items be draggable
		$( "li", container ).draggable({
		
		  revert: "invalid", // when not dropped, the item will revert back to its initial position
		  containment: "document",
		  helper: "clone",
		  cursor: "move"
		  
		});
		
	};

	this.makeContainersDroppable = function() { 
		
		var that = GUI.tagManager; 
		
		// let the document be droppable, accepting the tag items
		that.$containerAssignedSecondaryTags.droppable({
		  accept: "#unassignedTags > li",
		  activeClass: "ui-state-highlight",
		  drop: function( event, ui ) {
			  var that = GUI.tagManager; 
			  that.assignTag( ui.draggable );				
			
		  }
		});
	 
		// let the set of tags be droppable as well, accepting tag items from the document
		that.$containerUnassignedSecondaryTags.droppable({
		  accept: "#document li",
		  activeClass: "custom-state-active",
		  drop: function( event, ui ) {
			  var that = GUI.tagManager; 
			  that.unassignTag( ui.draggable );
			
		  }
		});
	};
	
	// assign tag to document object
	this.assignTag = function( $item ) {
		var that = GUI.tagManager; 
		$item.fadeOut(function() {
			var $list = $( "ul", that.$containerAssignedSecondaryTags ).length ?
				$( "ul", that.$containerAssignedSecondaryTags ) :
				$( "<ul class='tags ui-helper-reset'/>" ).appendTo( that.$containerAssignedSecondaryTags );        
			$item.appendTo( $list ).fadeIn(function() {
				
				$item.animate();
				
				var tagValue = $item.data("sectag");
				
				that.moveIntoListOfAssignedTags( tagValue );
				
				that.setTotalPages();
				if (that.currentPage > that.totalPages) {
					that.currentPage = that.totalPages;			
				}
				
				that.drawUnassignedTags();
			});
		});
		
		
		
		
		  		  
	};
	
	// unassign tag from document object
	this.unassignTag = function( $item ) {
		var that = GUI.tagManager; 
		$item.fadeOut(function() {
			$item.remove();
		});
	
		var tagValue = $item.data("sectag");
		that.moveIntoListOfUnassignedTags( tagValue );
			
		that.drawUnassignedTags();
	};

	this.saveChanges = function (){
		var that = GUI.tagManager;

		that.webarenaObject.setAttribute('mainTag',that.mainTag);
		
		var list = [];
		$.each(that.assignedSecTags,function (index, value){			
			list.push(value);
		});
		
		that.webarenaObject.setAttribute('secondaryTags', list );
		
	}
	
	/**
	 * Set/Edit tags using a dialog
	 * @param {webarenaObject} webarenaObject The web arena object
	 * @param {int} width Width of the dialog
	 * @param {int} [height] Height of the dialog
	 * @param {bool} [passThrough] Additional options for the dialog
	 */
	this.open = function(webarenaObject, width, height, passThrough) {

		var that = GUI.tagManager;
		
		that.init(webarenaObject);
		     	
		var buttons = {};
		
		buttons[GUI.translate("save")] = function(domContent){
			
			that.saveChanges();		
			
		};

		
		GUI.dialog("Tag Assigner", that.dialogDom, buttons, width, passThrough);

		
		// Initialize tabs
		$( "#tabs" ).tabs();

		// Disable the page with secondary tags in case the main tag is not assigned 
		if (that.mainTag == ""){
			
			$("#tabs").tabs({disabled: [1]});
			
		}
	}		
}