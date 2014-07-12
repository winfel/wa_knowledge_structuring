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
        console.log('selected "' + range + '" and created ' + highlights.length + ' highlight(s)!');
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
      if (jsonStr != undefined && jsonStr != '')
        highlighter.removeHighlights();
      highlighter.deserializeHighlights(jsonStr);
    };

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

  var toggleFullscreen = function(event) {
    
    if (toggled) {
      //'[data-id="paperViewer-' + rep.id + '"]'
      var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');
      viewerContainer.removeClass("fullscreen");

      $(rep).prepend(viewerContainer);

      self.adjustPaper();

    } else {
      var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');
      viewerContainer.addClass("fullscreen");

      $("body").append(viewerContainer);
      $(".moveOverlay", viewerContainer).hide();
    }
    toggled = !toggled;
    $("#iframe-" + rep.id).data("fullscreen", toggled);

    // Toggle the buttons..
    btnFullscreen.toggle();
    btnRestore.toggle();
    
    // We don't want to move the element. That's why we stop the propagation.
    event.stopPropagation();
  };

  // add function to button for testing removage of highlights
  btnFullscreen.click(toggleFullscreen);
  btnRestore.click(toggleFullscreen);
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
  header.html('<div class="buttonAreaLeft"></div><div class="titleArea"></div><div class="buttonAreaRight"></div>');
  $body.append(header);

  $(".buttonAreaLeft", header).html(
          '<input type="image" class="btn loadHighlightings" title="load highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-open.png" />' +
          '<input type="image" class="btn saveHighlightings" title="save highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-save.png" />' +
          '<input type="image" class="btn resetHighlightings" title="reset highlightings" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-delete.png" />' +
          ''
          );

  $(".titleArea", header).html('<span class="paperViewerTitle">' + file.getAttribute("name") + '</span><div class="moveArea"></div>');
  $(".buttonAreaRight", header).html(
          '<input type="image" class="btn btnFullscreen" title="Fullscreen" src="/guis.common/images/oxygen/16x16/actions/view-fullscreen.png" />' +
          '<input type="image" class="btn btnRestore" title="Restore Screen" src="/guis.common/images/oxygen/16x16/actions/view-restore.png" style="display: none;" />' +
          '');
  
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
