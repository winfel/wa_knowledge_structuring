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
  var selection;

  var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');

  var highlightMenuTimer;
  var highlightMenu = $(".highlightMenu", viewerContainer).first();

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
      // before highlighting, test if selected elements are valid for highlighting
      onBeforeHighlight: function(range) {
        // only allow selections within one ".pc"
        return ($(range.commonAncestorContainer).closest('.pc').length > 0);
      },
      // register a function to call after each highlight process
      onAfterHighlight: function(highlights, range) {
        // TODO: maybe postprocess highlights here, set different style and transmit to server
        selection = highlights;

        $(highlights).css('background-color', $.Color(ObjectManager.getUser().color).alpha(0.4))
                .addClass("selected")
                .addClass('by_user_' + GUI.userid)
                .addClass('at_time_' + (new Date()).getTime())
                .attr('title', 'by ' + GUI.username);

        // save highlights to server
        var jsonStr = highlighter.serializeHighlights();
        self.setAttribute('highlights', jsonStr);

        // Enable the highlight buttons
        $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", false);

        // Show the highlight menu
        highlightMenu.hover(function() {
          //// Hover in
          clearTimeout(highlightMenuTimer);
        }, function() {
          // Hover out
          highlightMenu.hide();
        });

        highlightMenu.click(function() {
          highlightMenu.hide();

          // Disable the highlight buttons
          $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
        });

        $(".highlighted.selected", frameDocument).hover(function(event) {
          // Hover in
          highlightMenu.css("left", event.pageX - highlightMenu.width() / 2);
          highlightMenu.css("top", event.pageY - 10);
          highlightMenu.show();
        }, function(event) {
          // Hover out      
          clearTimeout(highlightMenuTimer);
          highlightMenuTimer = setTimeout(function() {
            highlightMenu.hide();
          }, 250);

        });
      }
    });

    // Get the highlighter object
    highlighter = frameDocument.getHighlighter();

    // Remove selected highlightings...
    frameDocument.on("click", function(event) {

      if (selection && event.target != selection) {
        // Remove the selected (not highlighted) text.
        $(".highlighted.selected", frameDocument).each(function(index, element) {
          highlighter.removeHighlights(element);
        });

        // Update the highlights on the server.
        var jsonStr = highlighter.serializeHighlights();
        self.setAttribute('highlights', jsonStr);

        // Disable the highlight buttons
        $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
      }
    });

    // this function adds a play option for every audio highlighting
    self.addAudioToHighlights = function() {
      var matchYClass = /\b(y[0-9a-z]+)\b/; // this finds the y-positioning class within pdf classes
      frameDocument.find('.highlighted.audio').each(function() {
        var that = $(this);
        var aoid = that.attr('data-audioobject');
        if (aoid == undefined || frameDocument.find('#' + aoid).length > 0) {
          // there is no connected audio or the audioobject already exists
          return;
        }

        // get the object of the wave
        var wave = ObjectManager.getObject(aoid);
        if (wave == undefined || !wave) {
          return;
        }
        // create the player for the wave (the object isn't needed anymore)
        wave = new Audio(wave.getContentURL());

        // guess the position of the highlight
        var offset = that.offset();

        // create an audio play button
        var audioobject = $('<div>')
                .attr('id', aoid)
                //.html('AUDIO')
                .addClass('audioobject')
                //.offset(offset)
                .append(wave)
                .click(function() {
                  wave.paused ? wave.play() : wave.pause();
                })
                // highlight the highlight if hovering the button
                .hover(function() {
                  that.addClass('remotehover');
                }, function() {
                  that.removeClass('remotehover');
                })
                .appendTo(that.closest('.pf').first()); // append to the pageFrame, position left:0 works then

        // try to reuse pdf positioning classes, else use offset
        try {
          if (matchYClass.exec(that.closest('.t').attr('class'))) {
            audioobject.addClass(RegExp.$1);
          }
          else {
            audioobject.offset(offset);
          }
        }
        catch (ex) {
          audioobject.offset(offset);
        }
        audioobject.css('left', '0px');

        $(wave)
                .on('playing', function() {
                  audioobject.addClass('playing');
                })
                .on('pause', function() {
                  audioobject.removeClass('playing');
                })
                .on('ended', function() {
                  // chrome has a replay bug; load fixes it
                  if (window.chrome) {
                    wave.load();
                  }
                });

        // last but not least, highlight button if hovering highlight
        that.hover(function() {
          audioobject.addClass('remotehover');
        }, function() {
          audioobject.removeClass('remotehover');
        });
      });
    };

    self.loadHighlights = function() {
      var jsonStr = self.getAttribute('highlights');
      if (jsonStr != undefined && jsonStr != '') {
        highlighter.removeHighlights();
        highlighter.deserializeHighlights(jsonStr);
        window.setTimeout(self.addAudioToHighlights, 50);
      }
    };

    self.saveHighlights = function() {
      var jsonStr = highlighter.serializeHighlights();
      self.setAttribute('highlights', jsonStr);
    };

    self.loadHighlights();

    // Highlighter buttons on the top left of the viewer.
    $(".btnFill", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument).toggleClass("selected");
      self.saveHighlights();
    });

    $(".btnStrike", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument)
              .toggleClass("selected")
              .toggleClass("strike");

      self.saveHighlights();
    });

    $(".btnScratchout", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument)
              .toggleClass("selected")
              .toggleClass("scratchout");
      self.saveHighlights();
    });

    $(".btnGlow", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument)
              .toggleClass("selected")
              .toggleClass("glow");
      self.saveHighlights();
    });

    $(".btnAddComment", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument)
              .toggleClass("selected")
              .toggleClass("strike");
      self.saveHighlights();
    });

    $(".btnAddAudio", viewerContainer)
            .on("mousedown", startRecording)
            .on("mouseup", function() {
              stopRecording(function(newObject) {
                $(".highlighted.selected", frameDocument)
                        .removeClass("selected")
                        .addClass('audio')
                        .attr('data-audioobject', newObject.getAttribute('id'));

                self.saveHighlights();
              });
            });

  };

  // activate highlighter for iframe when iframe document is loaded
  $(rep).find('iframe').load(initializeTextHighlighter);  // Non-IE
  $(rep).find('iframe').ready(initializeTextHighlighter); // IE


  // Buttons on the top right of the viewer.
  var btnFullscreen = $(".btnFullscreen", rep).first();
  var btnRestore = $(".btnRestore", rep).first();

  var btnTwopage = $(".btnTwopage", rep).first();
  var btnSinglepage = $(".btnSinglepage", rep).first();

  var resizeTimer;
  $(window).on("resize", function() {
    // Resize the viewer in fullscreen mode only every 50 ms.
    if (toggled) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        self.adjustPaper();
      }, 50);
    }
  });

  var toggleFullscreen = function(event) {
    if (toggled) {
      // Normal...
      viewerContainer.removeClass("fullscreen");
      viewerContainer.css("left", 0);
      $(rep).prepend(viewerContainer);
      self.adjustPaper();
    } else {
      // Fullscreen
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
          '<input disabled="disabled" type="image" class="btn btnFill" title="Highlight the current selection (background color)." src="/guis.common/images/oxygen/16x16/actions/format-fill-color.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStrike" title="Strike through the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-strikethrough.png" />' +
          '<input disabled="disabled" type="image" class="btn btnScratchout" title="Scratch out the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-scratch-out.png" />' +
          '<input disabled="disabled" type="image" class="btn btnGlow" title="Add a glow effect to this selection." src="/guis.common/images/oxygen/16x16/actions/format-text-glow.png" />' +
          '<input disabled="disabled" type="image" class="btn btnAddComment" title="Add a comment for this selection." src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-add.png" />' +
          '<input disabled="disabled" type="image" class="btn btnAddAudio" title="Add an audio comment for this selection." src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          //'<input disabled="disabled" type="image" class="btn btnRemove" title="Remove this highlighting." src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          ''
          );

  var highlightMenu = $("<div>");
  highlightMenu.addClass("highlightMenu jPopover");
  highlightMenu.append($(".buttonAreaLeft .btn", header).clone());
  $(".btn", highlightMenu).prop("disabled", false);

  $body.append(highlightMenu);

  this.drawTitle((file ? file.getAttribute("name") : ""));

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

  this.setDocument(this.getAttribute('file'));
};

Viewer.drawTitle = function(title) {
  var rep = this.getRepresentation();

  if (title) {
    // Set a new title if needed.
    rep.title = title;
    //rep.titleWidthPx = $.fn.textWidth(title);
    //Perhaps we may display some ... if the title is too long...
  }

  if (rep.title) {
    $(".titleArea", rep).html('<span class="paperViewerTitle">' + rep.title + '</span><div title="' + rep.title + '" class="moveArea"></div>');
  } else {
    $(".titleArea", rep).html('<span class="paperViewerTitle">No document...</span><div class="moveArea"></div>');
  }
};

var getPaperUrl = 'http://' + window.location.hostname + ':8080/getPaper';

Viewer.setDocument = function(documentId) {
  $("#iframe-" + this.getAttribute("id")).attr("src", getPaperUrl + "/" + this.getRoom().id + "/" + (documentId && documentId != "[somefileid]" ? documentId : "0"));
};

Viewer.reloadDocument = function(documentId) {
  var file = ObjectManager.getObject(documentId);

  this.drawTitle((file ? file.getAttribute("name") : ""));
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

  //this.drawTitle();
  this.adjustPaper();
};

Viewer.adjustPaper = function() {
  var iframe = $("#iframe-" + this.getAttribute("id"));
  var contents = iframe.contents();

  var scaleContainer = $("body", contents);
  var firstPage = $("[data-page-no]", contents).first();

  if (!firstPage)
    return;

  // page dimensions
  var pageWidth = firstPage.width();
  var pageHeight = firstPage.height();

  // paper dimensions (including all pages...)
  var papersWidth = pageWidth;
  var papersHeight = scaleContainer.height();

  if (!papersWidth || !papersHeight)
    return;

  var width, height;

  if (iframe.data("fullscreen")) {
    scaleContainer.addClass("fullscreen");
    width = $("body").width();
    height = $("body").height();

    // Make sure the document fits in the window
    if ($(document).width() > $(window).width()) {
      width = $(window).width() - 30;
    }
  } else {
    scaleContainer.removeClass("fullscreen");
    width = this.getAttribute('width') - 30;
    height = this.getAttribute('height') - 30;
  }

  var scaleFactor = (width / papersWidth);

  if (iframe.data("fullscreen") && scaleFactor > 1.5)
    scaleFactor = 1.5;

  if (iframe.data("fullscreen") && scaleFactor < 1)
    scaleContainer.addClass("origin-top-left");
  else
    scaleContainer.removeClass("origin-top-left");


  scaleContainer.css("transform", "scale(" + scaleFactor + ")");
  scaleContainer.css("-webkit-transform", "scale(" + scaleFactor + ")");

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