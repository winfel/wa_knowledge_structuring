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
  var toggled = false;

  var initializeTextHighlighter = function() {

    //get the iframe contents and apply the textHighlighter
    var frameDocument = $("#iframe-" + rep.id).contents();

    // do not load highlighter for about:blank, but if error happens, ignore
    try {
      if (frameDocument[0].URL == 'about:blank') {
        return;
      }
    }
    catch (ex) {
      // Do nothing...
    }

    frameDocument.textHighlighter({
      // register a function to call after each highlight process
      onAfterHighlight: function(highlights, range) {
        // TODO: maybe postprocess highlights here, set different style and transmit to server
        console.log(highlights);
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

    self.loadHighlights = function() {
      var jsonStr = self.getAttribute('highlights');
      if (jsonStr != undefined && jsonStr != '') {
        highlighter.removeHighlights();
        highlighter.deserializeHighlights(jsonStr);
      }
    };

    self.saveHighlights = function() {
      var jsonStr = highlighter.serializeHighlights();
      self.setAttribute('highlights', jsonStr);
    };


    var menu = $('<div id="highlightmenu"></div>')
            .css({
              border: '1px solid black',
              width: 'auto',
              height: 'auto',
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'white',
              whiteSpace: 'nowrap',
            })
            .append(
                    // invisible placeholder at the bottom of the menu to close the gap between the menu and the text
                    $('<div></div>')
                    .css({
                      position: 'absolute',
                      bottom: '-5px',
                      left: '0',
                      width: '100%',
                      height: '5px',
                    })
                    );


    var lastTarget;

    menu.append(
            $('<button class="strike" title="strike">S</button>').click(function() {
      lastTarget.toggleClass('strike');
      self.saveHighlights();
      menu.hide();
    })
            );
    menu.append(
            $('<button class="scratchout" title="scratch out text">&emsp;</button>').click(function() {
      lastTarget.toggleClass('scratchout');
      self.saveHighlights();
      menu.hide();
    })
            );
    menu.append(
            $('<button class="glow" title="glow">G</button>').click(function() {
      lastTarget.toggleClass('glow');
      self.saveHighlights();
      menu.hide();
    })
            );
    menu.append(
            $('<button title="create a quote out of this text">&ldquo;Q&rdquo;</button>').click(function() {
      lastTarget.toggleClass('quote');
      self.saveHighlights();
      menu.hide();
    })
            );
    menu.append(
            $('<button title="add audio comment">A</button>').click(function() {
      lastTarget.toggleClass('audio');
      self.saveHighlights();
      menu.hide();
    })
            );
    menu.append(
            $('<button title="remove highlighting">X</button>').click(function(event) {
      highlighter.removeHighlights(lastTarget);
      self.saveHighlights();
      menu.hide();
    })
            );
    frameDocument.find('body').append(menu);
    menu.hide();

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

    frameDocument.on('mouseover', '.highlighted', function(event) {
      if (delaymenu != undefined)
        window.clearTimeout(delaymenu);
      delaymenu = window.setTimeout(function() {
        lastTarget = $(event.target);
        var refpos = lastTarget.offset();
        menu.show();
        refpos.left += 5;
        refpos.top -= menu.height() + 5;
        menu.offset(refpos);
        delaymenu = window.setTimeout(function() {
          menu.hide();
        }, 8000);
      }, 800);
    });

    menu.on('mouseover', function() {
      if (delaymenu != undefined)
        window.clearTimeout(delaymenu);
    });

    menu.on('mouseout', function() {
      delaymenu = window.setTimeout(function() {
        menu.hide();
      }, 8000);
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

  var btnFullscreen = $(".btnFullscreen", rep).first();
  var btnRestore = $(".btnRestore", rep).first();

  var btnTwopage = $(".btnTwopage", rep).first();
  var btnSinglepage = $(".btnSinglepage", rep).first();

  var toggleFullscreen = function(event) {

    if (toggled) {
      // Normal...
      var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');
      viewerContainer.removeClass("fullscreen");
      viewerContainer.css("left", 0);

      $(rep).prepend(viewerContainer);

      self.adjustPaper();

    } else {
      // Fullscreen
      var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');
      viewerContainer.addClass("fullscreen");
      viewerContainer.css("left", $(window).scrollLeft());

      $("body").append(viewerContainer);
      $(".moveOverlay", viewerContainer).hide();

    }
    toggled = !toggled;
    $("#iframe-" + rep.id).data("fullscreen", toggled);

    // Toggle the buttons..
    btnFullscreen.toggle();
    btnRestore.toggle();

    // Make sure the scrollbars of the window are not visible in the fullscreen mode...
    $("body").first().toggleClass("overflowHidden");

    // We don't want to move the element. That's why we stop the propagation.
    event.stopPropagation();
  };

  // add function to button for testing removage of highlights
  btnFullscreen.click(toggleFullscreen);
  btnRestore.click(toggleFullscreen);

  btnTwopage.click(function() {
    self.setAttribute("twopage", true);

    btnTwopage.toggle();
    btnSinglepage.toggle();
  });

  btnSinglepage.click(function() {
    self.setAttribute("twopage", false);

    btnTwopage.toggle();
    btnSinglepage.toggle();
  });
};

Viewer.createRepresentation = function(parent) {
  var rep = GUI.svg.other(parent, "foreignObject");
  rep.dataObject = this;
  var $rep = $(rep);

  var body = document.createElement("div");
  $rep.attr({id: this.getAttribute('id')});
  $rep.append(body);

  var file = ObjectManager.getObject(this.getAttribute("file"));

  var $body = $(body);
  $body.addClass('paperViewer');
  // data-id is required, because of a fallback logic in GeneralObject.moveStart!
  $body.attr({'data-id': "paperViewer-" + this.getAttribute('id')});

  var header = $("<div>");
  header.addClass("paperViewerHeader");
  header.html('<table><tr><td class="buttonAreaLeft"></td><td class="titleArea"></td><td class="buttonAreaRight"></td></tr></table>');

  $body.append(header);

  $(".buttonAreaLeft", header).html(
          '<input type="image" class="btn loadHighlightings" title="load highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-open.png" />' +
          '<input type="image" class="btn saveHighlightings" title="save highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-save.png" />' +
          '<input type="image" class="btn resetHighlightings" title="reset highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-delete.png" />' +
          ''
          );


  this.setTitle((file ? file.getAttribute("name") : ""));

  $(".buttonAreaRight", header).html(
          '<input type="image" class="btn btnTwopage" title="Two page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-new.png" />' +
          '<input type="image" class="btn btnSinglepage" title="Single page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-close.png" style="display: none;" />' +
          '<input type="image" class="btn btnFullscreen" title="Fullscreen" src="/guis.common/images/oxygen/16x16/actions/view-fullscreen.png" />' +
          '<input type="image" class="btn btnRestore" title="Restore Screen" src="/guis.common/images/oxygen/16x16/actions/view-restore.png" style="display: none;" />' +
          '');

  //this.createRepresentationAjax($body);
  this.createRepresentationIframe($body);

  var borderBottom = $("<div>");
  borderBottom.addClass("paperViewerFooter");
  $body.append(borderBottom);

  var moveOverlay = $("<div>");
  moveOverlay.addClass("moveOverlay");
  $body.append(moveOverlay);

  this.initGUI(rep);

  return rep;
};

var getPaperUrl = 'http://' + window.location.hostname + ':8080/getPaper/';
/**
 * Creates the iframe representation
 * 
 * @param {type} $body
 * @returns {undefined}
 */
Viewer.createRepresentationIframe = function($body) {
  var self = this;

  var $iframe = $("<iframe>");
  $iframe.attr("id", "iframe-" + this.getAttribute('id'));

  $body.append($iframe);

  $iframe.on('load', function() {
    // Add the iframe css file to the html document.
    $("head", $iframe.contents()).append('<link type="text/css" href="/guis/desktop/objects/paperViewerIFrame.css" rel="Stylesheet">');

    self.adjustPaper();
  });

  $iframe.attr('src', 'http://' + window.location.hostname + ':8080/getPaper/public/' + this.getAttribute('file') + '.html/');
};

Viewer.setTitle = function(title) {
  if (title) {
    $(".titleArea", this.getRepresentation()).html('<span class="paperViewerTitle">' + title + '</span><div class="moveArea"></div>');
  } else {
    $(".titleArea", this.getRepresentation()).html('<span class="paperViewerTitle">No document</span><div class="moveArea"></div>');
  }
};

Viewer.setDocument = function(documentId) {
  $("#iframe-" + this.getAttribute("id")).attr("src", getPaperUrl + "public/" + documentId + ".html/");
};

Viewer.reloadDocument = function(documentId) {
  var file = ObjectManager.getObject(documentId);

  this.setTitle((file ? file.getAttribute("name") : ""));
  this.setDocument(documentId);
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

/**
 * Called after object selection
 */
Viewer.selectHandler = function() {
  GeneralObject.selectHandler();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).hide();
};

/**
 * Called after object deselection
 */
Viewer.deselectHandler = function() {
  GeneralObject.deselectHandler();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).show();
};

Viewer.onMoveStart = function() {
  GeneralObject.onMoveStart();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).show();
};

Viewer.onMoveEnd = function() {
  GeneralObject.onMoveEnd();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).hide();
};

Viewer.resizeHandler = function() {
  this.setDimensions(this.getViewWidth(), this.getViewHeight());
  this.setPosition(this.getViewX(), this.getViewY());

//  this.adjustPaper();
};

Viewer.adjustPaper = function() {
  var iframe = $("#iframe-" + this.getAttribute("id"));
  var contents = iframe.contents();

  var scaleContainer = $("body", contents);
  var firstPage = $("[data-page-no]", contents).first();

  // page dimensions
  var pageWidth = firstPage.width();
  var pageHeight = firstPage.height();

  // paper dimensions (including all pages...)
  var papersWidth = pageWidth;
  var papersHeight = scaleContainer.height();

  if (!papersWidth || !papersHeight)
    return;

  var width;
  if (iframe.data("fullscreen"))
    width = $("body").width() - 150; // -30 for the scrollbar, shadow and comments
  else
    width = this.getAttribute('width') - 30; // -30 for the scrollbar and shadow

  var height;
  if (iframe.data("fullscreen"))
    height = $("body").height(); // -30 for the scrollbar, shadow and comments
  else
    height = this.getAttribute('height') - 30; // -30 for the scrollbar and shadow

  var scaleFactor = (width / papersWidth);

  var translateFactorX = (1 - scaleFactor) / 2;
  var translateFactorY = (1 - scaleFactor) / 2;

  if (scaleFactor > 1)
    translateFactorX = 0;

  // CSS 3 transform: supported by Firefox
  scaleContainer.css("transform", "translate(" + (-width * translateFactorX) + "px, " + (-papersHeight * translateFactorY) + "px) scale(" + scaleFactor + ")");
  // Chrome, Safari and Opera browsers support though -webkit-transform...
  scaleContainer.css("-webkit-transform", "translate(" + (-width * translateFactorX) + "px, " + (-papersHeight * translateFactorY) + "px) scale(" + scaleFactor + ")");

  if (this.getAttribute("twopage")) {
    // Adjust pages for two page mode
    var translateFactorXeven = (-pageWidth / 4);
    var translateFactorYeven = (-pageHeight / 4);

    var translateFactorXodd = (pageWidth / 4);
    var translateFactorYodd = (-pageHeight / 4);

    $("[data-page-no]:even", contents).each(function(index) {
      $(this).css("transform", "translate(" + translateFactorXeven + "px, " + (translateFactorYeven - (index * (pageHeight * 1.5))) + "px) scale(0.5)");
      $(this).css("-webkit-transform", "translate(" + translateFactorXeven + "px, " + (translateFactorYeven - (index * (pageHeight * 1.5))) + "px) scale(0.5)");
    });

    $("[data-page-no]:odd", contents).each(function(index) {
      $(this).css("transform", "translate(" + translateFactorXodd + "px, " + (translateFactorYodd - (index * (pageHeight * 1.5)) - pageHeight) + "px) scale(0.5)");
      $(this).css("-webkit-transform", "translate(" + translateFactorXodd + "px, " + (translateFactorYodd - (index * (pageHeight * 1.5)) - pageHeight) + "px) scale(0.5)");
    });
  } else {
    $("[data-page-no]", contents).css("transform", "none");
    $("[data-page-no]", contents).css("-webkit-transform", "none");
  }
};
