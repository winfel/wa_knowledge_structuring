/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */


Viewer.draw = function(external) {

  var rep = this.getRepresentation();

  this.drawDimensions(external);

  this.setViewWidth(this.getAttribute('width'));
  this.setViewHeight(this.getAttribute('height'));

  $(rep).attr("layer", this.getAttribute('layer'));

  var that = this;

  //this.updateContent();
  return rep;
};

/*
 Viewer.updateContent = function() {
 
 var rep = this.getRepresentation();
 
 this.getContentAsString(function(text) {
 
 if (text != that.oldContent) {
 $(rep).find("body").html(text);
 }
 
 that.oldContent = text;
 
 });
 
 };*/

Viewer.initGUI = function(rep) {
	var self = this;
	var highlighter;
	var initializeTextHighlighter = function() {

		//get the iframe contents and apply the textHighlighter
		var frameDocument = $(rep).find('iframe').contents();
		frameDocument.textHighlighter({
			// register a function to call after each highlight process
			onAfterHighlight: function(highlights, range) {
				// TODO: maybe postprocess highlights here, set different style and transmit to server
				console.log('selected "' + range + '" and created ' + highlights.length + ' highlight(s)!');
				// save highlights to server
				//var jsonStr = highlighter.serializeHighlights();
				//self.setAttribute('highlights', jsonStr);
			}
		});
		console.log('highlighting for object ' + rep.id + ' activated');

		// get the highlighter object
		highlighter = frameDocument.getHighlighter();
	};

	// activate highlighter for iframe when iframe document is loaded
	$(rep).find('iframe').load(initializeTextHighlighter);  // Non-IE
	$(rep).find('iframe').ready(initializeTextHighlighter); // IE

	// add function to button for testing loading of highlights
	$(rep).find('.loadHighlightings').click(function(){
		var jsonStr = self.getAttribute('highlights');
		if(jsonStr != undefined && jsonStr != '')
			highlighter.deserializeHighlights(jsonStr);
	});
	// add function to button for testing saving of highlights
	$(rep).find('.saveHighlightings').click(function(){
		var jsonStr = highlighter.serializeHighlights();
		self.setAttribute('highlights', jsonStr);
	});
	// add function to button for testing removage of highlights
	$(rep).find('.resetHighlightings').click(function(){
		highlighter.removeHighlights();
	});
};

Viewer.createRepresentation = function(parent) {
  var rep = GUI.svg.other(parent, "foreignObject");
  rep.dataObject = this;
  var $rep = $(rep);

  var body = document.createElement("body");
  $rep.attr({id: this.getAttribute('id')});
  $rep.append(body);

  var $viewer = $(body).addClass('paperViewer');

  var moveArea = $("<div>");
  moveArea.addClass("moveArea");
  $viewer.append(moveArea);
  moveArea.html('<input type="button" class="loadHighlightings" value="load highlightings" />' +
		'<input type="button" class="saveHighlightings" value="save highlightings" />' +
		'<input type="button" class="resetHighlightings" value="reset highlightings" />');

  /* IFRAME */
  $viewer.append("<iframe></iframe>");
  
  var iFrame = $($viewer.find("iframe"));
  var iframe_loaded = false;
  iFrame.one('load', function() {
    iframe_loaded = true;
  });

  iFrame.attr('src', 'http://' + window.location.hostname + ':8080/getPaper/public/' + this.getAttribute('file') + '.html/');

  //$(rep).attr('transform', 'scale(0.75)'); // scales this object: caution, selection of text works buggy then! maybe test viewBox
  // or use pdf2htmlEx's function Viewer.rescale(ratio)

  /* IN HTML */
//  var request = $.ajax({
//    url: 'http://' + window.location.hostname + ':8080/getPaper/public/cd7e6155-3a12-49c7-9bbd-a8e3098bd65d.html/',
//    cache: false
//  });
//
//  request.done(function(html) {
//
//    var parser = new DOMParser();
//    var doc = parser.parseFromString(html, "text/html");
//    console.log(doc.firstChild.firstChild);
//
//    return;
//    
//    
//    var $html = $.parseHTML(html);
//
//    var $head = $("head");
//    $.each($html, function(i, el) {
//      var newSidebarId = "sidebar-paper";
//
//      // Rename the sidebar id
//      if (el.id == "sidebar") {
//        el.id = newSidebarId;
//      }
//
//      // Rename the sidebar id from the style sheets...
//      if (el.nodeName.toLowerCase() == "style") {
//        var innerhtml = el.innerHTML.replace(/#sidebar/g, "#" + newSidebarId);
//        el.innerHTML = innerhtml;
//        $head.append(el);
//      }
//
//      // Append the document content...
//      if (el.id == "page-container") {
//        $viewer.append(el);
//      }
//    });
//  });
//
//  request.fail(function(jqXHR, textStatus) {
//    console.log("I am sorry, I was not able to load the requested paper.");
//  });

  this.initGUI(rep);

  return rep;
};
