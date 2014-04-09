"use strict";


//list containing all the related tags according to the main category
var relatedTags;

//already assigned tags
var assignedTags;

//main tag
var mainTag;

//container for tags 
var $tags;

//container for the document
var $document;

//
var totalPages;

//
var currentPage;

//
var tagsPerPage;



function removeListItem(arr, item) {
    for (var index = 0; index < arr.length; index++) {
        if (arr[index] === item) {
            arr.splice(index, 1);
            index--;
        }
    }
}


//TODO
//queries the database for related tags
function getRelatedTags(){
	
	return ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff","gggg","hhhh","iiii","jjjj",
			   "kkkk", "llll", "mmmmm", "nnnn", "oooo"];
	
};

//removes already assigned tags from the list of related tags (edit mode)
function filterRelatedTags(list){

	$.each(list, function( index, value ) {		
		removeListItem(relatedTags, value);
		
	});
		
};


//return tags for the new page
function getTags(page, itemsPerRound){

	var startIndex = (page-1) * itemsPerRound;
	
	var endIndex = startIndex + itemsPerRound;
	
	var tagList = relatedTags.slice(startIndex, endIndex);
	
	return tagList;
	
};

//returns the very first not shown tag
//called when tag is assigned
function getTag(page, itemsPerRound){

	var index = (page) * itemsPerRound;
	
	return relatedTags[index];
	
};

//removes tag from the list of related tags
//called when tag is assigned
function removeTag( value ) {

	removeListItem(relatedTags, value);
	
	setTotalPages();
	
};

function setTotalPages(){
	
	totalPages = Math.ceil(relatedTags.length / tagsPerPage);

};

//returns tag to the list of all related tags
//called when tag is unassigned
function returnTag( value ) {

	relatedTags.push(value);
	
	relatedTags.sort();
	
	setTotalPages();
	
	
};

// shows the tags in the container for tags
//used for paging
function drawTags(){

	$tags.html("");
	
	var tagList = getTags(currentPage, tagsPerPage);
	
	$.each(tagList, function( index, value ) {		
		drawTag(value,$tags);
		
	});
	
	makeTagItemsDraggable($tags);
};


//shows the tags in the container for tags
//used for paging
function drawAssignedTags(list){

	var container = $document.find('.tags');
	
	$.each(list, function( index, value ) {		
		drawTag(value, container);
		
	});
	
	makeTagItemsDraggable(container);
	
};

function drawTag(value, container){

	$('<li class="ui-widget-content"><h5 class="ui-widget-header tagValue">'+value+'</h5></li>').appendTo(container);
	
	makeTagItemsDraggable(container);
	
};


//makes the tags draggable and droppable
function makeTagItemsDraggable(container) {		
	
	// let the tag items be draggable
	$( "li", container ).draggable({
	
	  revert: "invalid", // when not dropped, the item will revert back to its initial position
	  containment: "document",
	  helper: "clone",
	  cursor: "move"
	  
	});
	
};



function makeContainersDroppable() { 
	// let the document be droppable, accepting the tag items
	$document.droppable({
	  accept: "#tags > li",
	  activeClass: "ui-state-highlight",
	  drop: function( event, ui ) {
	  
		assignTag( ui.draggable );				
		
	  }
	});
 
	// let the set of tags be droppable as well, accepting tag items from the document
	$tags.droppable({
	  accept: "#document li",
	  activeClass: "custom-state-active",
	  drop: function( event, ui ) {
	  
		unassignTag( ui.draggable );
		
	  }
	});
};

// assign tag to document object
function assignTag( $item ) {

	$item.fadeOut(function() {
		var $list = $( "ul", $document ).length ?
			$( "ul", $document ) :
			$( "<ul class='tags ui-helper-reset'/>" ).appendTo( $document );        
		$item.appendTo( $list ).fadeIn(function() {
			$item.animate();            
		});
	});
	
	var newTag = getTag( currentPage,tagsPerPage );
	drawTag( newTag, $tags );
		
	var tagValue = $item.find(".tagValue").text();	
	removeTag( tagValue );	
	
	
	  		  
};

// unassign tag from document object
function unassignTag( $item ) {
	
	$item.fadeOut(function() {
		$item.remove();
		//$item          
		//  .appendTo( $tags )
		//  .fadeIn();
	});

	var tagValue = $item.find(".tagValue").text();
	returnTag( tagValue );
		
	drawTags();
};



/**
 * Set/Edit tags using a dialog
 * @param {webarenaObject} webarenaObject The web arena object
 * @param {int} width Width of the dialog
 * @param {int} [height] Height of the dialog
 * @param {bool} [passThrough] Additional options for the dialog
 */

GUI.setTag = function(webarenaObject, width, height, passThrough) {
		
	var content = '<div id="tabs"  class="ui-tabs ui-widget ui-widget-content ui-corner-all" style="width: 565px">';
		content+= '	<ul>';
		content+= '		<li><a href="#main-tag">Main Tag</a></li>';
		content+= '		<li><a href="#secondary-tags">Secondary Tag</a></li>';
		content+= '	</ul>';
		content+= '	<div id="main-tag">';
	 	content+= ' 	<button id="1">Human Machine Interaction</button>';
      	content+= '  	<button id="2">Software Technologies</button>';
    	content+= ' 	<button id="3">Embedded Systems</button>';
  		content+= ' 	<button id="4">Algorithms</button>';
		content+= '    </div>';
		content+= '<div id="secondary-tags">';
		content+= '		<div class="ui-widget ui-helper-clearfix" style="width: 535px">';
		content+= '			<ul id="tags" class="tags ui-helper-reset ui-helper-clearfix">';
		content+= '			</ul>';
		content+= '			<div id="document" class="ui-widget-content ui-state-default">';
		content+= '				<h4 class="ui-widget-header"><span id="document-name"></span></h4>';
		content+= ' 	        <ul class="tags ui-helper-reset">';
		content+= ' 	        </ul>';
		content+= '			</div>';
		content+= '		</div>';
		content+= '		<button id="btn-previous"><</button>';
		content+= '		<button id="btn-next">></button>';
		content+= '     			<div class="ui-widget">';
		content+= '     				<label for="custom-tag"><b>Custom tag:</b> </label>';
	    content+= '						<input id="custom-tag">';
		content+= '					</div>';
		content+= '    </div>';
		content+= '</div>';
	
	
	var dom = $(content);
	
	$( "#custom-tag" ).live("keyup", function(event) {
		
		if (event.keyCode == 13) {
			
			var customTag = dom.find("#custom-tag").val();
			removeListItem(relatedTags, customTag);
			drawTags();
			
			var list = [];
			list.push(customTag);
			drawAssignedTags(list);
			dom.find("#custom-tag").val("");
		}
		
	});
	
	
	// tags and the file
	$tags = dom.find("#tags");
    $document = dom.find("#document");
    
    makeContainersDroppable();
    
        
    
    currentPage = 1;
	tagsPerPage = 6;
	
	
	
	assignedTags = webarenaObject.getAttribute('secondaryTags');
	drawAssignedTags(assignedTags);
	
	
    relatedTags = getRelatedTags();
    
    filterRelatedTags(assignedTags);
   
    setTotalPages();
	
	drawTags();
	
	
       
    //var fileTags = webarenaObject.getAttribute('secondaryTags');
    
   // $.each(fileTags, function( index, value ) {
	//	$('<li class="ui-widget-content"><h5 class="ui-widget-header tagValue" style="display: list-item;">'+value+'</h5></li>').appendTo($document.find('.tags'));  
	//});
	
    var documentName = webarenaObject.getAttribute('name');
    dom.find("span#document-name").text(documentName);
    
     
    $( "#btn-next" ).live("click", function(){
		if(currentPage == totalPages) return; 
		currentPage++;
		drawTags();
	});

	$( "#btn-previous" ).live("click", function(){
	 if(currentPage < 2) return; 
		currentPage--;
		drawTags();
	});

	
	$("#main-tag :button").live("click", function(){
			
		// set the main tag
		mainTag = $(this).text();
				
		// go to secondary tags page
		$( "#tabs" ).tabs( "select", 1 );
		
	});
	
	   
    	
	var buttons = {};
	
	buttons[GUI.translate("save")] = function(domContent){
		
		webarenaObject.setAttribute('mainTag', mainTag);
		
		var secondaryTags = [];
		$(domContent).find("#document .tagValue").each(function(index,item){
			secondaryTags.push($(item).text());		
		});
		webarenaObject.setAttribute('secondaryTags', secondaryTags);
		
	};
	
	
	GUI.dialog("Set Tag", dom, buttons, width, passThrough);
	
	// Initialize tabs
	$( "#tabs" ).tabs();
	
	// Initialize autocomplete
	//$( "#autocomplete" ).autocomplete({
	//  source: relatedTags
	//});
	
}