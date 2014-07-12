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

  this.adjustPaper();
  
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
    
    // do not load highlighter for about:blank, but if error happens, ignore
    try {
		if(frameDocument[0].URL == 'about:blank') {
			return;
		}
    }
    catch(ex){}
    frameDocument.textHighlighter({
      // register a function to call after each highlight process
      onAfterHighlight: function(highlights, range) {
        // TODO: maybe postprocess highlights here, set different style and transmit to server
        console.log(highlights);
        console.log(range);
        $(highlights)
			.css('background-color', $.Color(ObjectManager.getUser().color).alpha(0.4))
			.addClass('by_user_' + GUI.userid)
			.attr('title', 'by ' + GUI.username);
        // save highlights to server
        var jsonStr = highlighter.serializeHighlights();
        self.setAttribute('highlights', jsonStr);
      }
    });
    console.log('highlighting for object ' + rep.id + ' activated');

    // get the highlighter object
    highlighter = frameDocument.getHighlighter();

	self.loadHighlights = function () {
		var jsonStr = self.getAttribute('highlights');
		if (jsonStr != undefined && jsonStr != '') {
			highlighter.removeHighlights();
			highlighter.deserializeHighlights(jsonStr);
		}
	};

	self.saveHighlights = function () {
		var jsonStr = highlighter.serializeHighlights();
		self.setAttribute('highlights', jsonStr);
	};


	var menu = $('<div id="highlightmenu"></div>')
		.css({
			border:	'1px solid black',
			width:	'auto',
			height:	'auto',
			position:	'absolute',
			top:	'10px',
			left:	'10px',
			background:	'white',
			whiteSpace: 'nowrap',
		})
		.append(
			// invisible placeholder at the bottom of the menu to close the gap between the menu and the text
			$('<div></div>')
				.css({
					position:	'absolute',
					bottom:		'-5px',
					left:		'0',
					width:		'100%',
					height:		'5px',
				})
		);


	var lastTarget;

	menu.append(
		$('<button class="strike" title="strike">S</button>').click(function(){
			lastTarget.toggleClass('strike');
			self.saveHighlights();
		})
	);
	menu.append(
		$('<button class="scratchout" title="scratch out text">&emsp;</button>').click(function(){
			lastTarget.toggleClass('scratchout');
			self.saveHighlights();
		})
	);
	menu.append(
		$('<button class="glow" title="glow">G</button>').click(function(){
			lastTarget.toggleClass('glow');
			self.saveHighlights();
		})
	);
	menu.append(
		$('<button title="create a quote out of this text">&ldquo;Q&rdquo;</button>').click(function(){
			lastTarget.toggleClass('quote');
			self.saveHighlights();
		})
	);
	menu.append(
		$('<button title="add audio comment">A</button>').click(function(){
			lastTarget.toggleClass('audio');
			self.saveHighlights();
		})
	);
	menu.append(
		$('<button title="remove highlighting">X</button>').click(function(){
			console.log('we can´t remove yet');
			self.saveHighlights();
		})
	);
	frameDocument.find('body').append(menu);

	// maybe this styles should be placed somewhere else
	frameDocument.find('head').append('<style type="text/css">\
		.strike {\
			/*text-line-through-color: red;*/\
			text-line-through-mode: skip-white-space;\
			text-line-through-style: wave;\
			text-line-through-width: normal;\
			text-decoration: line-through;\
			/*text-decoration-color: red;*/\
			text-decoration-line: wave;\
			/*-moz-text-line-through-color: red;*/\
			-moz-text-line-through-mode: skip-white-space;\
			-moz-text-line-through-style: wave;\
			-moz-text-line-through-width: normal;\
			/*-moz-text-decoration-color: red;*/\
			-moz-text-decoration-line: wave;\
		}\
		.scratchout {\
			background-image: url(/guis.common/images/scratchout.png);\
		}\
		.glow {\
			text-shadow: 0px 0px 10px red;\
		}\
		.quote {\
			box-shadow: 0px 0px 10px 5px;\
		}\
		.quote:hover::before {\
			content: "\\"";\
			position: absolute;\
			margin-left:-0.5em;\
		}\
		.quote:hover::after {\
			content: "\\"";\
			position: absolute;\
			margin-left:0;\
		}\
		.strike, .glow, .scratchout, .quote {\
			background-color: none !important;\
		}\
		.audio::before {\
			content: "";\
			position: absolute;\
			left: -10px;\
			top: -10px;\
			width: 20px;\
			height: 20px;\
			background: blue;\
			border-radius: 20px;\
		}\
		</style>\
	');

	var delaymenu;

	frameDocument.on('mouseover', '.highlighted', function(event){
		if(delaymenu != undefined)
			window.clearTimeout(delaymenu);
		delaymenu = window.setTimeout(function(){
			lastTarget = $(event.target);
			var refpos = lastTarget.offset();
			menu.show();
			refpos.left += 5;
			refpos.top -= menu.height() + 5;
			menu.offset(refpos);
			delaymenu = window.setTimeout(function(){ menu.hide(); }, 8000);
		}, 800);
	});

	menu.on('mouseover', function(){
		if(delaymenu != undefined)
			window.clearTimeout(delaymenu);
	});

	menu.on('mouseout', function(){
		delaymenu = window.setTimeout(function(){ menu.hide(); }, 8000);
	});

/*	frameDocument.on('mouseover', '.highlighted', function(event){
		lastTarget = $(event.target);
		var refpos = lastTarget.offset();
		refpos.left += 5;
		refpos.top -= menu.height() + 5;
		menu.offset(refpos);
	});*/

	self.loadHighlights();
  };

  // activate highlighter for iframe when iframe document is loaded
  $(rep).find('iframe').load(initializeTextHighlighter);  // Non-IE
  $(rep).find('iframe').ready(initializeTextHighlighter); // IE

  // add function to button for testing loading of highlights
  $(rep).find('.loadHighlightings').click(function() {
    var jsonStr = self.getAttribute('highlights');
    if (jsonStr != undefined && jsonStr != '')
      highlighter.deserializeHighlights(jsonStr);
  });
  // add function to button for testing saving of highlights
  $(rep).find('.saveHighlightings').click(function() {
    var jsonStr = highlighter.serializeHighlights();
    self.setAttribute('highlights', jsonStr);
  });
  // add function to button for testing removage of highlights
  $(rep).find('.resetHighlightings').click(function() {
    highlighter.removeHighlights();
  });
};

Viewer.createRepresentation = function(parent) {
  var rep = GUI.svg.other(parent, "foreignObject");
  rep.dataObject = this;
  var $rep = $(rep);

  var body = document.createElement("div");
  $rep.attr({id: this.getAttribute('id')});
  $rep.append(body);

  var $body = $(body);
  $body.addClass('paperViewer');

  var moveArea = $("<div>");
  moveArea.addClass("moveArea");
  $body.append(moveArea);
  moveArea.html('<input type="button" class="loadHighlightings" value="load highlightings" />' +
          '<input type="button" class="saveHighlightings" value="save highlightings" />' +
          '<input type="button" class="resetHighlightings" value="reset highlightings" />');

  //this.createRepresentationAjax($body);
  this.createRepresentationIframe($body);

  var moveOverlay = $("<div>");
  moveOverlay.addClass("moveOverlay");
  $body.append(moveOverlay);
  
  this.initGUI(rep);

  return rep;
};

/**
 * Creates the iframe representation
 * 
 * @param {type} $body
 * @returns {undefined}
 */
Viewer.createRepresentationIframe = function($body) {
  var $iframe = $("<iframe>");
  $iframe.attr("id", "iframe-" + this.getAttribute('id'));

  $body.append($iframe);

  var iframe_loaded = false;
  $iframe.one('load', function() {
    iframe_loaded = true;
  });

  $iframe.attr('src', 'http://' + window.location.hostname + ':8080/getPaper/public/' + this.getAttribute('file') + '.html/');
};

Viewer.createRepresentationAjax = function($body) {
  var request = $.ajax({
    url: 'http://' + window.location.hostname + ':8080/getPaper/public/cd7e6155-3a12-49c7-9bbd-a8e3098bd65d.html/',
    cache: false
  });

  request.done(function(html) {
    $body.append(html.replace(/sidebar/g, "sidebar-paper"));

    // Adding another container for scaling...
    var $scaleContainer = $("<div>");
    $scaleContainer.attr("id", "scale-container");

    var $pageContainer = $("#page-container", $body);

    // Move all page to the new scale container...
    $scaleContainer.append($pageContainer.children("div.pd"));

    // Finally append the scale container.
    $pageContainer.append($scaleContainer);
  });

  request.fail(function(jqXHR, textStatus) {
    console.log("I am sorry, I was not able to load the requested paper.");
  });
};


Viewer.onMoveStart = function() {
  GeneralObject.onMoveStart();
  console.log("move start");
  
  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).show();
};

Viewer.onMoveEnd = function() {
  GeneralObject.onMoveEnd();
  console.log("move end");
  
  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).hide();
};

Viewer.resizeHandler = function() {
  this.setDimensions(this.getViewWidth(), this.getViewHeight());
  this.setPosition(this.getViewX(), this.getViewY());
  console.log("resize");
//  this.adjustPaper();
};

Viewer.adjustPaper = function() {

  var rep = this.getRepresentation();
  var $rep = $(rep);

  var $iframe = $("#iframe-" + this.getAttribute("id"), $rep);
  var contents = $iframe.contents();

  var $scaleContainer = $("body", contents);
  var firstPage = $("[data-page-no]", contents).first();

  var pageWidth = firstPage.width();
  var pageHeight = $scaleContainer.height();

  if (!pageWidth || !pageHeight)
    return;

  var width = this.getAttribute('width') - 30; // -30 for the scrollbar and shadow

  var scaleFactor = (width / pageWidth);
  
  var translateFactorX = (1 - scaleFactor) / 2;
  var translateFactorY = (1 - scaleFactor) / 2;
  
  if(scaleFactor > 1)
    translateFactorX = 0;

  // CSS 3
  $scaleContainer.css("transform", "translate(" + (-width * translateFactorX) + "px, " + (-pageHeight * translateFactorY) + "px) scale(" + scaleFactor + ")");
  
  // For chrome and safari...
  $scaleContainer.css("-webkit-transform", "translate(" + (-width * translateFactorX) + "px, " + (-pageHeight * translateFactorY) + "px) scale(" + scaleFactor + ")");
};
