"use strict";

/**
 * Object providing functions for tagging	
 */

GUI.tagAssigner = new function() {

	
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
	
	// the content of the dialog (its html)
	var dialogHtml = "";
	
	// selector for the container for unassigned secondary tags 
	var $containerUnassignedSecondaryTags;
	
	// selector for the container for the assigned secondary tags
	var $containerAssignedSecondaryTags;
	
	// selector for the container for main tags
	var $containerMainTags;
	
	// selector for the input field for the custom secondary tag
	var $customSecTag;
	
	// selector for the main tag button
	var $mainTagBtn;
	
	// selector for the input field for the custom main tag
	var $customMainTag;
	
	// selector for the label of the name of the file object
	var $filename;
	
	// selector for the tabs of the current dialog
	var $dialogTabs;
	
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
		this.$containerSecondaryTags = this.dialogDom.find("#secondaryTags");
		
		this.$customSecTag = this.dialogDom.find("#custom-Sec-tag");
		this.$customMainTag = this.dialogDom.find("#custom-Main-tag");
		this.$mainTagBtn = this.dialogDom.find("#mainTag :button");
	    this.$filename = this.dialogDom.find(".filename");
	    this.$dialogTabs = this.dialogDom.first();
	    
	    // makes both the container for unassigned and assigned tags droppabale  
		this.makeContainersDroppable();
	    
		// initialization of the paging parameters
		this.currentPage = 1;
		this.tagsPerPage = 6;
		
		//sets the webArena Object
		this.webarenaObject = webarenaObject;
		
		this.mainTag = [];
		this.assignedSecTags = [];
		
		// sets the main tag of the file object
		this.mainTag = webarenaObject.getAttribute('mainTag');
		// gets all existing main tags from the database
		Modules.TagManager.getMainTags(this.setMainTags);
		
		// sets the assigned secondary tags of the file object	
		var assignedSecondaryTags = webarenaObject.getAttribute('secondaryTags');
		if ( assignedSecondaryTags == 0 ) {
			this.assignedSecTags = [];
		} else {
			this.assignedSecTags = webarenaObject.getAttribute('secondaryTags');
		}
		this.drawAssignedTags();
			
		// gets all existing secondary tags from the database for a specified main tag
		Modules.TagManager.getSecTags(this.mainTag, this.setSecondaryTags);
	   
		// sets the name of the file object
	    var documentName = webarenaObject.getAttribute('name');
	    this.$filename.text(documentName);
	    
	    // binds the events for the main tag buttons, paging buttons, 
	    // and the input field for creation of secondary tags
	    this.bindEvents();
	    
	    
	}
	
	//sets the content of the dialog for tag assignment/unassignment
	//the content (html) is defined in "index.html" as underscore template 
	this.setDialogContent = function(){
		var tagAssignerTemplate = $("#tag-assigner-content-tmpl").html();
		this.dialogDom = $(tagAssignerTemplate);
	}
	

	this.bindEvents = function(){
		var that = GUI.tagAssigner;
		
		//click event handler for the buttons which represent the main tags
		//sets the main tag of the file object to the clicked main tag
		that.$containerMainTags.delegate(":button", "click", function() {
		//that.$mainTagBtn.die().live("click", function(){
			
			var newMainTag = $(this).text();
			
			if( that.mainTag != "" &&
				that.mainTag != newMainTag &&
				that.assignedSecTags.length > 0) {
			
				var response = confirm("By changing the main tag all previously assigned secondary tags will be removed. Do you want to apply the change?");
				
				if (response==false) return;
				  				  
				// remove all assigned tags
				that.assignedSecTags = [];
				that.drawAssignedTags();
			
				  
			} 
				
				// set the main tag
				that.mainTag = newMainTag;

				//save the new main tag in the database
				that.webarenaObject.setAttribute('mainTag',that.mainTag);
				
				that.$containerMainTags.find(":button").removeClass('assigned-main-tag');
				$(this).addClass('assigned-main-tag');
				
				//get the appropriate secondary tags for the chosen main tag
				Modules.TagManager.getSecTags(that.mainTag, that.setSecondaryTags);
				
				//enable the page with secondary tags and set the current page to the first one
				that.$dialogTabs.tabs("enable", 1);
				that.currentPage = 1;
				
				// go to secondary tags page
				//$( "#tabs" ).tabs( "select", 1 );
			
		});	
		
		// event handler for the input field for creation of custom main tags
		// creates new main tag and assigns it to the file object
		
		
		that.$containerMainTags.delegate("#custom-Main-tag", "keyup", function(event) {
		//$("#custom-Main-tag").die().live("keyup", function(event) {
			var that = GUI.tagAssigner;
			var customMainTagValue;
			
			customMainTagValue = $(this).val();
			if (event.keyCode == 13 && customMainTagValue != "") {
							
				//if a MainTag with this name already exists, discard the new entry
				for (var index = 0; index < that.mainTags.length; ++index) {
					if (that.mainTags[index].name.toLowerCase() == customMainTagValue.toLowerCase()){
					
						//reset the value of the input field
						$(this).val("");
						$("#container-notifier").notify("create", "withIcon", {
                             title :  GUI.translate("error"),
                             text: GUI.translate("tagManager.duplicateMainTag.error"),
                             icon: '/guis.common/images/toast/warning.png'
                        });
						
						return
					}
				}
					
				if ( that.assignedSecTags.length > 0 ) {
					var response = confirm("By changing the main tag all previously assigned secondary tags will be removed. Do you want to apply the change?");
					
					if (response == false) return;
					
					// remove all assigned tags
					that.assignedSecTags = [];
					that.drawAssignedTags();
				}
				
				// save the newly created tag in the database  
				var newId = new Date().getTime() - 1296055327011;
				Modules.TagManager.updMainTags(customMainTagValue, newId);
					
				//get the complete list from mainTags from the Database and set them
				//Modules.TagManager.getMainTags(that.setMainTags);

				that.mainTag = customMainTagValue;
				that.mainTags.push({"id": newId, "name": customMainTagValue});
				that.webarenaObject.setAttribute('mainTag',that.mainTag);
				
				//draw the MainTags, including the new Tag
				that.drawMainTags();
				
				// set the main tag
				that.mainTag = customMainTagValue;
				that.$containerMainTags.find(":button").removeClass('assigned-main-tag');
				//$mainTagBtn.removeClass('assigned-main-tag');
				that.$containerMainTags.find(":button").last().addClass('assigned-main-tag');
				//$mainTagBtn.last().addClass('assigned-main-tag');
				that.unassignedSecTags = [];
				that.updatePagingParameters();
				
				//enable the page with secondary tags and set the current page to the first one
				that.$dialogTabs.tabs("enable", 1);
				that.currentPage = 1;
				
				
				that.drawUnassignedTags();
				
				//reset the value of the input field
				$(this).val("");
			}
			
		});
		
		// event handler for the input field for creation of custom secondary tags
		// creates new secondary tag and assigns it to the file object	
		
		that.$containerSecondaryTags.delegate("#custom-Sec-tag", "keyup", function() {
		//$("#custom-Sec-tag").die().live("keyup", function(event) {
			var that = GUI.tagAssigner;
			var customSecTagValue = $(this).val();
			
			if (event.keyCode == 13 && customSecTagValue != "") {
				
				for (var index = 0; index < that.assignedSecTags.length; ++index) {
					if (that.assignedSecTags[index].toLowerCase() == customSecTagValue.toLowerCase()){
					
						//reset the value of the input field
						$(this).val("");
						$("#container-notifier").notify("create", "withIcon", {
                             title :  GUI.translate("error"),
                             text: GUI.translate("tagManager.duplicateSecondaryTag.error"),
                             icon: '/guis.common/images/toast/warning.png'
                        });
						
						return
					} 
				}	
				//remove the newly created tag if it already exists in the list of unassigned secondary tags
				// the function "removeListItem" removes the item if it exists in the list of unassigned secondary tags
				// and redraw the unassigned secondary tags
				var checkedCustomSecTagValue = that.removeListItem( that.unassignedSecTags, customSecTagValue);
				that.drawUnassignedTags();
				
				//insert the newly created secondary tag into the list of assigned secondary tags
				// and redraw the assigned secondary tags
				if (checkedCustomSecTagValue != "") {
					customSecTagValue = checkedCustomSecTagValue;
				}
				
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
		
		that.$containerSecondaryTags.delegate("#btn-next", "click", function() {
	    //$( "#btn-next" ).die().live("click", function(){
	    	var that = GUI.tagAssigner;
	    	
	    	//restriction in the case the current page is set the end page
			if(that.currentPage == that.totalPages) return; 
			
			//set the current page to the next one 
			//redraw the unassigned tags
			that.currentPage++;
			that.drawUnassignedTags();
		});

	    //click event handler for the "previous" button
	    //switches to the previous page
		
		that.$containerSecondaryTags.delegate("#btn-previous", "click", function() {
		//$( "#btn-previous" ).die().live("click", function(){
			var that = GUI.tagAssigner;
			
			//restriction in the case the current page is set to first page
			if(that.currentPage == 1) return;
			
			//set the current page to the previous
			//redraw the unassigned tags
			that.currentPage--;
			that.drawUnassignedTags();
		});
		

		$( "#del-tag" ).die().live("click", function(e){
			var that = GUI.tagAssigner;
			
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
	


	//remove specified element from an array and return the deleted element
	this.removeListItem = function(arr, item) {
		var removedItem = "";
	    for (var index = 0; index < arr.length; index++) {
	        if (arr[index].toLowerCase() === item.toLowerCase()) {
	        	removedItem = arr[index]; 
	            arr.splice(index, 1);
	            index--;	           
	        }
	    }
	    return removedItem;
	}
	
	// sets the list main tags to the all existing main tags 
	// which are retrieved from the database, filters them and draws them
	this.setMainTags = function(list) {
		var that = GUI.tagAssigner;
		
		that.mainTags = list;
		
		that.drawMainTags();
			
	};

	// sets the list of unassigned secondary tags to the secondary tags 
	//which are retrieved from the database, filters them and draws them
	this.setSecondaryTags = function(data){
		var that = GUI.tagAssigner;
		
		//if(data != undefined && data.secTags > 0){
		if(data != undefined){
			
			that.unassignedSecTags = data.secTags;	
			that.filterSecondaryTags(that.assignedSecTags);
			
			that.updatePagingParameters();	
			
			that.drawUnassignedTags();
		}
			
	};
	
	
	//removes already assigned secondary tags from the list of all unassigned secondary tags (edit mode)
	this.filterSecondaryTags = function (list){
		var that = GUI.tagAssigner;
		$.each(list, function( index, value ) {		
			that.removeListItem( that.unassignedSecTags, value);
			
		});
			
	};
	
	
	//returns unassigned secondary tags for the current page
	this.getCurrentPageTags = function(){
		var that = GUI.tagAssigner;
		
		var startIndex = (that.currentPage-1) * that.tagsPerPage;
		
		var endIndex = startIndex + that.tagsPerPage;
		
		var tagList = that.unassignedSecTags.slice(startIndex, endIndex);
		
		return tagList;
		
	};
	
	
	// moves secondary tag from the list of unassigned tags into the list of assigned tags
	// called when tag is assigned
	this.moveIntoListOfAssignedTags = function( value ) {
		var that = GUI.tagAssigner;
		
		that.removeListItem(that.unassignedSecTags, value);
		
		that.assignedSecTags.push(value);
		
		that.updatePagingParameters();
		
	};
	
	
	// moves secondary tag from the list of assigned tags into the list of unassigned tags
	// called when tag is unassigned
	this.moveIntoListOfUnassignedTags = function( value ) {
		var that = GUI.tagAssigner;
		
		//that.unassignedSecTags.sort();
		that.removeListItem(that.assignedSecTags, value);

		that.unassignedSecTags.push(value);	
		
		that.updatePagingParameters();
		
		
	};
	

	// updates paging parameters in case there is assignment or unassignment of a tag 
	this.updatePagingParameters = function(){
		var that = GUI.tagAssigner;
		
		that.totalPages = Math.ceil( this.unassignedSecTags.length / this.tagsPerPage);
		
		if (that.totalPages < 2){
			$("#btn-previous, #btn-next").hide();
		} else {
			$("#btn-previous, #btn-next").show();
		}
		
		if (that.currentPage > 1 && that.currentPage > that.totalPages) {
			that.currentPage = that.totalPages;			
		}
	
	};
	
	//draws the current page unassigned tags  
	this.drawUnassignedTags = function(){
		var that = GUI.tagAssigner;
		
		that.$containerUnassignedSecondaryTags.html("");
		
		var tagList = that.getCurrentPageTags();
		
		$.each(tagList, function( index, value ) {		
			that.drawTag(value,that.$containerUnassignedSecondaryTags, "unassigned");
			
		});
		
		that.makeTagItemsDraggable(that.$containerUnassignedSecondaryTags);
	};
	
	
	//draws the assigned tags
	this.drawAssignedTags = function(){
	
		var that = GUI.tagAssigner;
		var container = that.$containerAssignedSecondaryTags.find('.tags');
		container.html("");
		
		$.each(that.assignedSecTags, function( index, value ) {		
			that.drawTag(value, container, "assigned");
			
		});
		
		that.makeTagItemsDraggable(container);
		
	};
	
	this.drawTag = function(value, container, s){
	
		var that = GUI.tagAssigner;
		
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
			  '</li>'
			 ).appendTo(container);
		
		}
		
		that.makeTagItemsDraggable(container);
		
	};
	
	//draws the main tags
	this.drawMainTags = function(){
		
		var that = GUI.tagAssigner; 
			
		that.$containerMainTags.find( "button" ).remove();
		
		$.each(that.mainTags, function( index, value ) {
			
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
		
		var that = GUI.tagAssigner; 
		
		// let the container for assigned tags be droppable,
		//accepting the unassigned tag items
		that.$containerAssignedSecondaryTags.droppable({
		  accept: "#unassignedTags > li",
		  activeClass: "ui-state-highlight",
		  drop: function( event, ui ) {
			  //var that = GUI.tagAssigner; 
			  that.assignTag( ui.draggable );				
			
		  }
		});
	 
		// let the container for unassigned tags be droppable as well
		//accepting the assigned tag items
		that.$containerUnassignedSecondaryTags.droppable({
		  accept: "#document li",
		  activeClass: "custom-state-active",
		  drop: function( event, ui ) {
			  //var that = GUI.tagAssigner; 
			  that.unassignTag( ui.draggable );
			
		  }
		});
	};
	
	// assign tag to the file object
	this.assignTag = function( $item ) {
		var that = GUI.tagAssigner; 
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
		var that = GUI.tagAssigner;
		
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
		var that = GUI.tagAssigner;

		//that.webarenaObject.setAttribute('mainTag',that.mainTag);
		
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
	this.open = function(webarenaObject, width, height, passThrough, callback) {

		var that = GUI.tagAssigner;
		
		that.init(webarenaObject);
		     	
		var buttons = {};
		
		buttons[GUI.translate("save")] = function(domContent) {
						
			if (that.mainTag != "") {
				that.saveChanges();
				if(callback != undefined){
					callback();
				}
				return true;
			} else {
				alert("You must set at least the main tag!!");
				return false;
			}
			
		};

		var additionalOptions = {
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); }	
		}
		
		GUI.dialog("Tag Assigner", that.dialogDom, buttons, width, additionalOptions);

		
		// Initialize tabs
		that.$dialogTabs.tabs();

		// Disable the page with secondary tags in the case the main tag is not assigned yet
		if (that.mainTag == ""){
			
			that.$dialogTabs.tabs({disabled: [1]});
			
		}
	}		
}