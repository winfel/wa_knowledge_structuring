"use strict";

/**
 * Object providing functions for tagging	
 */

GUI.tagManager= new function() {

	
	// list containing all existing main tags
	var mainTags = [];
	
	// string which is the already assigned main tag
	var mainTag = "";
	
	// list containing all unassigned secondary tags related to the chosen main tag
	var unassignedSecTags = [];
	
	// list containing all already assigned secondary tags
	var assignedSecTags = [];
	
	// the file object currently processed
	var webarenaObject;
	
	// the dialog content of the dialog (its html)
	var dialogHtml = "";
	
	// selector for the container for unassigned secondary tags 
	var $containerUnassignedSecondaryTags;
	
	// selector for the container for the assigned secondary tags
	var $containerAssignedSecondaryTags;
	
	// selector for the container for main tags
	var $containerMainTags;
	
	// selector for the input field for the custom secondary tag
	var $customSecTag;
	
	// selector for the input field for the custom main tag
	var $customMainTag;
	
	// selector for the label of the name of the file object
	var $documentName;
	
	//number of total pages of unassigned tags
	var totalPages;
	
	// the current page 
	var currentPage;
	
	// number of unassigned secondary tags per page 
	var tagsPerPage;
	
	
	
	
	//initialization of the dialog
	this.init = function(webarenaObject){
				
		// sets the the content of the dialog (html)
		this.setDialogContent();
		
		
		// set selectors used for manipulation of the objects in the dialog
		this.$containerUnassignedSecondaryTags = this.dialogDom.find("ul#unassignedTags");
		this.$containerAssignedSecondaryTags = this.dialogDom.find("#document");
		this.$containerMainTags = this.dialogDom.find("#mainTag");
		this.$customSecTag = this.dialogDom.find("#custom-Sec-tag");
		this.$customMainTag = this.dialogDom.find("#custom-Main-tag");
	    this.$documentName = this.dialogDom.find("#document-name"); 
	    
		this.makeContainersDroppable();
	    
		// initialization of the pages
		this.currentPage = 1;
		this.tagsPerPage = 6;
		
	
		this.webarenaObject = webarenaObject;
		
		// sets the main tag of the file object
		this.mainTag = webarenaObject.getAttribute('mainTag');
		// gets all existing main tags from the database
		Modules.TagManager.getMainTags(this.setMainTags);
		
		// sets the assigned secondary tags of the file object	
		this.assignedSecTags = webarenaObject.getAttribute('secondaryTags');
		this.drawAssignedTags();
			
		// gets all existing secondary tags from the database for a specified main tag
		Modules.TagManager.getSecTags(this.mainTag, this.setSecondaryTags);	
	   
		// sets the name of the file object
	    var documentName = webarenaObject.getAttribute('name');
	    this.$documentName.text(documentName);
	    
	    // binds the events for the main tag buttons, paging buttons, 
	    // and the input field for creation of secondary tags
	    this.bindEvents();
	    
	    
	}
	
	//sets the content of the dialog for tag assignment/unassignment
	this.setDialogContent = function(){
		
		var content = '<div id="tabs"  class="ui-tabs ui-widget ui-widget-content ui-corner-all" style="width: 565px">';
			content+= '	<ul>';
			content+= '		<li><a href="#mainTag">Main Tag</a></li>';
			content+= '		<li><a href="#secondaryTags">Secondary Tag</a></li>';
			content+= '	</ul>';
			content+= '	<div id="mainTag">';
			content+= '     <div class="custom-Main-tag-holder">';
			content+= '     	<label for="custom-Main-tag"><b>Custom tag:</b> </label>';
		    content+= '			<input id="custom-Main-tag">';
			content+= '		</div>';
			content+= '	</div>';
			content+= ' <div id="secondaryTags">';
			content+= '		<div class="ui-widget ui-helper-clearfix" style="width: 555px">';
			content+= '			<div class="unassignedTags">';
			content+= '     	    <div class="inner-unassignedTags">';
			content+= '					<ul id="unassignedTags" class="tags ui-helper-reset ui-helper-clearfix">';
			content+= '					</ul>';
			content+= '			    </div>';
			content+= '			<div class="buttons-holder">';			
			content+= '				<button id="btn-previous"><</button>';
			content+= '				<button id="btn-next">></button>';
			content+= '			</div>';
			content+= '     	<div class="custom-Sec-tag-holder">';
			content+= '     		<label for="custom-Sec-tag"><b>Custom tag:</b> </label>';
		    content+= '				<input id="custom-Sec-tag">';
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
		
		//click event handler for the buttons which represent the main tags
		//sets the main tag of the file object to the clicked main tag
		$("#mainTag :button").live("click", function(){
			
			// set the main tag
			that.mainTag = $(this).text();
			$("#mainTag :button").removeClass('assigned-main-tag');
			$(this).addClass('assigned-main-tag');
			
			//get the appropriate secondary tags for the chosen main tag
			Modules.TagManager.getSecTags(that.mainTag, that.setSecondaryTags);
			
			//enable the page with secondary tags and set the current page to the first one
			$("#tabs").tabs("enable", 1);
			that.currentPage = 1;
			
			// go to secondary tags page
			//$( "#tabs" ).tabs( "select", 1 );
			
		});	
		
		// event handler for the input field for creation of custom main tags
		// creates new main tag and assigns it to the file object		
		$("#custom-Main-tag").live("keyup", function(event) {
			var that = GUI.tagManager;
			var customMainTagValue = $(this).val();
			
			if (event.keyCode == 13 && customMainTagValue != "") {
				
				//if a MainTag with this name already exists, discard the new entry
				for (var index = 0; index < that.mainTags.length; ++index) {
					if(that.mainTags[index].name == customMainTagValue){
					
						//reset the value of the input field
						$(this).val("");
					
						return
					}
				}
					
				//save the newly created tag in the database  
				Modules.TagManager.updMainTags(customMainTagValue, that.mainTags.length+1);
					
				//get the complete list froom mainTags from the Database and set them
				Modules.TagManager.getMainTags(that.setMainTags);

				//draw the MainTags, including the new Tag
				that.drawMainTags();

				//reset the value of the input field
				$(this).val("");
					
			}
			
		});
		
		// event handler for the input field for creation of custom secondary tags
		// creates new secondary tag and assigns it to the file object		
		$("#custom-Sec-tag").live("keyup", function(event) {
			var that = GUI.tagManager;
			var customSecTagValue = $(this).val();
			
			if (event.keyCode == 13 && customSecTagValue != "") {
				
				//remove the newly created tag if it already exists in the list of unassigned secondary tags
				// and redraw the unassigned secondary tags
				that.removeListItem( that.unassignedSecTags, customSecTagValue);
				that.drawUnassignedTags();
				
				//insert the newly created secondary tag into the list of assigned secondary tags
				// and redraw the assigned secondary tags
				that.assignedSecTags.push(customSecTagValue);
				that.drawAssignedTags();
				
				//save the newly created tag in the database
				Modules.TagManager.updSecTags(that.mainTag, customSecTagValue);
				
				//reset the value of the input field
				$(this).val("");
			}
			
		});
		
		//click event handler for the "next" button
	    //switches to the next page
	    $( "#btn-next" ).die().live("click", function(){
	    	var that = GUI.tagManager;
	    	
	    	//restriction in the case the current page is set the end page
			if(that.currentPage == that.totalPages) return; 
			
			//set the current page to the next one 
			//redraw the unassigned tags
			that.currentPage++;
			that.drawUnassignedTags();
		});

	    //click event handler for the "previous" button
	    //switches to the previous page
		$( "#btn-previous" ).die().live("click", function(){
			var that = GUI.tagManager;
			
			//restriction in the case the current page is set to first page
			if(that.currentPage == 1) return;
			
			//set the current page to the previous
			//redraw the unassigned tags
			that.currentPage--;
			that.drawUnassignedTags();
		});
		

		$( "#del-tag" ).die().live("click", function(e){
			var that = GUI.tagManager;
			
			 e.preventDefault();			 
			 
			var value = $(this).parent().data('sectag');
			
			$(this).parent().remove();
				
			//that.removeListItem(that.assignedSecTags, value);
			that.removeListItem(that.unassignedSecTags, value);
			
			Modules.TagManager.deleteSecTags(that.mainTag, value);
			
			that.updatePagingParameters();
			that.drawUnassignedTags();
			
		});
	
	}
	


	//remove specified element from an array
	this.removeListItem = function(arr, item) {
	    for (var index = 0; index < arr.length; index++) {
	        if (arr[index] === item) {
	            arr.splice(index, 1);
	            index--;
	        }
	    }
	}
	
	// sets the list main tags to the all existing main tags 
	// which are retrieved from the database, filters them and draws them
	this.setMainTags = function(list) {
		var that = GUI.tagManager;
		
		that.mainTags = list;
		
		that.drawMainTags();
			
	};

	// sets the list of unassigned secondary tags to the secondary tags 
	//which are retrieved from the database, filters them and draws them
	this.setSecondaryTags = function(list){
		var that = GUI.tagManager;
		
		if(list != undefined && list.length > 0){
			
			that.unassignedSecTags = list[0].secTags;	
			that.filterSecondaryTags(that.assignedSecTags);
			
			that.updatePagingParameters();	
			
			that.drawUnassignedTags();
		}
			
	};
	
	
	//removes already assigned secondary tags from the list of all unassigned secondary tags (edit mode)
	this.filterSecondaryTags = function (list){
		var that = GUI.tagManager;
		$.each(list, function( index, value ) {		
			that.removeListItem( that.unassignedSecTags, value);
			
		});
			
	};
	
	
	//returns unassigned secondary tags for the current page
	this.getCurrentPageTags = function(){
		var that = GUI.tagManager;
		
		var startIndex = (that.currentPage-1) * that.tagsPerPage;
		
		var endIndex = startIndex + that.tagsPerPage;
		
		var tagList = that.unassignedSecTags.slice(startIndex, endIndex);
		
		return tagList;
		
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
	

	// updates paging parameters in case there is assignment or unassignment of a tag 
	this.updatePagingParameters = function(){
		var that = GUI.tagManager;
		
		that.totalPages = Math.ceil( this.unassignedSecTags.length / this.tagsPerPage);
		
		if (that.currentPage > 1 && that.currentPage > that.totalPages) {
			that.currentPage = that.totalPages;			
		}
	
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
			      '<a href="" id="del-tag" title="Delete this tag" class="ui-icon ui-icon-closethick">Delete image</a>'+
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

		// Disable the page with secondary tags in the case the main tag is not assigned yet
		if (that.mainTag == ""){
			
			$("#tabs").tabs({disabled: [1]});
			
		}
	}		
}