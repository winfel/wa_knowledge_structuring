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

  var iframe = $("#iframe-" + rep.id);
  var viewerContainer = $('[data-id="paperViewer-' + rep.id + '"]');

  var highlightMenuTimer;
  var highlightMenu = $(".highlightMenu", viewerContainer).first();

  var initializeTextHighlighter = function() {
    // Remove all previous event handlers.
    $(".buttonAreaLeft .btn", viewerContainer).off();
    $(".btn", highlightMenu).off();

    //get the iframe contents and apply the textHighlighter

    var frameDocument = iframe.contents();

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
//        var jsonStr = highlighter.serializeHighlights();
//        self.setAttribute('highlights', jsonStr);

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

        highlightMenu.on("click", function() {
          highlightMenu.hide();
          // Disable the highlight buttons
          $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
        });

        $(".highlighted.selected", frameDocument).hover(function(event) {
          // Hover in
          var scrollTop = $(frameDocument).scrollTop();

          highlightMenu.css("left", event.pageX - highlightMenu.width() / 2);
          highlightMenu.css("top", event.pageY - 10 - scrollTop);
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

    // Remove old selected text...
    $(".highlighted.selected", frameDocument).each(function(index, element) {
      highlighter.removeHighlights(element);
    });

    // Remove selected highlightings...
    frameDocument.on("mousedown", function(event) {
      if (selection && event.target != selection) {
        // Remove the selected (not highlighted) text.
        $(".highlighted.selected", frameDocument).each(function(index, element) {
          highlighter.removeHighlights(element);
        });
        selection = null;

        // Disable the highlight buttons
        $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
        highlightMenu.hide();

        // Reset the highlightings
        self.loadHighlights();
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

    self.linkCommentToHighlights = function() {
      DBManager.getDocuments(self, "comments", function(docs) {

        for (var i in docs) {
          (function(doc) {
            // Javascript has no block scope... Let's use the function scope instead!
            var commentContainer = createCommentOnViewer(doc.user, doc.data);
            commentContainer = $(commentContainer);
            commentContainer.off("hover");

            var commentHighlight = $(".highlighted.commented[data-comment='" + doc.data.hash + "']", frameDocument)[0];

            if (commentHighlight) {
              commentHighlight = $(commentHighlight);
              commentHighlight.off("hover");

              // Highlight the highlighting
              commentContainer.hover(function() {
                commentHighlight.addClass('remotehover');
              }, function() {
                commentHighlight.removeClass('remotehover');
              });

              // Highlight the comment
              commentHighlight.hover(function() {
                commentContainer.addClass('remotehover');
              }, function() {
                commentContainer.removeClass('remotehover');
              });
            } else {
              // 
              commentContainer.addClass("noreference");
            }
          })(docs[i]);
        }
      });
    };

    self.loadHighlights = function() {
      var jsonStr = self.getAttribute('highlights');
      if (jsonStr != undefined && jsonStr != '') {
        highlighter.removeHighlights();
        highlighter.deserializeHighlights(jsonStr);
        window.setTimeout(self.addAudioToHighlights, 50);
        window.setTimeout(self.linkCommentToHighlights, 50);
      }
    };

    self.saveHighlights = function() {
      // Before we save it. Remove helper css classes
      $(".highlighted", frameDocument).removeClass("selected remotehover");

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

    var createCommentOnViewer = function(user, data) {

      var commentId = "comment_" + data.hash;
      var commentContainer = $("#" + commentId, frameDocument)[0];

      if (!commentContainer) {
        var frameBody = $("body", frameDocument);
        // Check if there is already a comment object at the same position.
        var count = $('.comment[data-top-initial*="' + data.offset.top + '"]', frameBody).length;

        // Create a new one...
        commentContainer = $("<div>");
        commentContainer.attr("data-top-initial", data.offset.top);

        data.offset.top += (10 * count);
        data.offset.left += (15 * count);

        commentContainer.addClass("comment")
                .css("top", data.offset.top)
                .css("left", data.offset.left)
                .attr("id", "comment_" + data.hash);
        commentContainer.html('<p class="commentHeader" title="' + data.date.toLocaleString() + '">' + user + ' wrote</p>' +
                '<p>' + data.text + '</p>');

        // Show/Hide the comment on a click.
        commentContainer.on("click", function(event) {
          var target = $(event.target);
          if (target.attr("id") == commentId || target.hasClass("commentHeader"))
            $(this).toggleClass("opened");
        });

        // Hide it once you click somewhere withing the iframe.
        frameDocument.on("click", function(event) {
          var target = $(event.target);

          if (target.attr("id") != commentId && target.parent("div").attr("id") != commentId)
            commentContainer.removeClass("opened");
        });

        // Append the comment to the body
        frameBody.append(commentContainer);
      }

      return commentContainer;
    };

    var addComment = function(element, callback) {
      var theDialogContainer = $("<div>");
      theDialogContainer.html('<textarea class="addCommentText" style="width: 96%; height: 98%;"></textarea>');

      var theDialog = theDialogContainer.dialog({
        title: "Type your comment...",
        height: 300,
        width: 350,
        modal: true,
        buttons: {
          "Submit": function() {
            var text = $(".addCommentText", theDialogContainer).val().trim();

            if (text == "") {
              alert("Your comment is empty. Try again with some letters!");
            } else {

              var scaleFactor = iframe.data("scaleFactor");
              var gridSize = 20;

              var offset = element.offset();
              offset.top = Math.floor(Math.floor(offset.top / scaleFactor / gridSize) * gridSize);
              offset.left = 0;

              var date = new Date();
              var data = {
                'text': text,
                'offset': offset,
                'date': date,
                'hash': MD5(text + "_" + date.getTime())
              };

              DBManager.addDocument(self, "comments", data);

              callback(data);

              theDialog.dialog("close");
            }
          },
          "Cancel": function() {
            theDialog.dialog("close");
          }
        },
        close: function() {
          // Do something after closing...
        }
      });

      var zindex = theDialogContainer.parent("div").css("z-index");
      if (iframe.data("fullscreen") && zindex < 12000) {
        zindex = 12000;
        $(".ui-widget-overlay").css("z-index", zindex);
        theDialogContainer.parent("div").css("z-index", zindex + 1);
      }

      theDialog.dialog("open");
    };

    $(".btnAddComment", viewerContainer).on("click", function() {

      var selected = $(".highlighted.selected", frameDocument);

      addComment(selected, function(data) {
        selected.removeClass("selected")
                .addClass("commented commented")
                .attr('data-comment', data.hash);

        self.saveHighlights();
      });
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
  iframe.load(initializeTextHighlighter);  // Non-IE
  iframe.ready(initializeTextHighlighter); // IE

  // Buttons on the top right of the viewer.
  var btnFullscreen = $(".btnFullscreen", rep).first();
  var btnRestore = $(".btnRestore", rep).first();

  var btnTwopage = $(".btnTwopage", rep).first();
  var btnSinglepage = $(".btnSinglepage", rep).first();

  var resizeTimer;
  $(window).on("resize", function() {
    // Resize the viewer in fullscreen mode only every 25 ms.
    if (toggled) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        self.adjustPaper();
      }, 25);
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
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnFill" title="Highlight the current selection (background color)." src="/guis.common/images/oxygen/16x16/actions/format-fill-color.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStrike" title="Strike through the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-strikethrough.png" />' +
          '<input disabled="disabled" type="image" class="btn btnScratchout" title="Scratch out the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-scratch-out.png" />' +
          '<input disabled="disabled" type="image" class="btn btnGlow" title="Add a glow effect to this selection." src="/guis.common/images/oxygen/16x16/actions/format-text-glow.png" />' +
          '<input disabled="disabled" type="image" class="btn btnAddComment" title="Add a comment for this selection." src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-add.png" />' +
          '<input disabled="disabled" type="image" class="btn btnAddAudio" title="Add an audio comment for this selection." src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          //'<input disabled="disabled" type="image" class="btn btnRemove" title="Remove this highlighting." src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          '</div>' +
          ''
          );

  $(".buttonAreaRight", header).html(
          '<div class="btn-group">' +
          '<input type="image" class="btn btnTwopage" title="Two page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-new.png" />' +
          '<input type="image" class="btn btnSinglepage" title="Single page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-close.png" style="display: none;" />' +
          '<input type="image" class="btn btnFullscreen" title="Fullscreen" src="/guis.common/images/oxygen/16x16/actions/view-fullscreen.png" />' +
          '<input type="image" class="btn btnRestore" title="Restore Screen" src="/guis.common/images/oxygen/16x16/actions/view-restore.png" style="display: none;" />' +
          '</div>' +
          '');

  var highlightMenu = $("<div>");
  highlightMenu.addClass("highlightMenu jPopover");
  highlightMenu.append($(".buttonAreaLeft .btn", header).clone());
  $(".btn", highlightMenu).prop("disabled", false);

  $body.append(highlightMenu);

  var audioMenu = $("<div>");
  audioMenu.addClass("audioMenu jPopover");
  audioMenu.html(
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnStartRecording" title="Stop recording." src="/guis.common/images/oxygen/16x16/actions/media-recording-stopped.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStopRecording" title="Start recording." src="/guis.common/images/oxygen/16x16/actions/media-recording.png" />' +
          '</div>' +
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnPlay" title="Play" src="/guis.common/images/oxygen/16x16/actions/media-playback-start.png" />' +
          '<input disabled="disabled" type="image" class="btn btnPause" title="Pause" src="/guis.common/images/oxygen/16x16/actions/media-playback-pause.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStop" title="Stop" src="/guis.common/images/oxygen/16x16/actions/media-playback-stop.png" />' +
          '</div>' +
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnUpload" title="Upload the recording to the server." src="/guis.common/images/oxygen/16x16/places/network-workgroup.png" />' +
          '</div>' +
          ''
          );

  //$body.append(audioMenu);

  this.drawTitle((file ? file.getAttribute("name") : ""));
  this.createRepresentationIframe($body);

  // Various / helper stuff...
  var borderBottom = $("<div>");
  borderBottom.addClass("paperViewerFooter");
  $body.append(borderBottom);

  var moveOverlay = $("<div>");
  moveOverlay.addClass("moveOverlay");
  $body.append(moveOverlay);

  // Init other GUI stuff (highlighter, events, ...)
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

/**
 * 
 * @param {type} title
 * @returns {undefined}
 */
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

/**
 * 
 * @param {type} documentId
 * @returns {undefined}
 */
Viewer.setDocument = function(documentId) {
  $("#iframe-" + this.getAttribute("id")).attr("src", getPaperUrl + "/" + this.getRoom().id + "/" + (documentId && documentId != "[somefileid]" ? documentId : "0") + '/' + ObjectManager.userHash);
};

/**
 * 
 * @param {type} documentId
 * @returns {undefined}
 */
Viewer.reloadDocument = function(documentId) {
  var file = ObjectManager.getObject(documentId);

  this.drawTitle((file ? file.getAttribute("name") : ""));
  this.setDocument(documentId);
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

/**
 * 
 * @returns {undefined}
 */
Viewer.onMoveStart = function() {
  GeneralObject.onMoveStart();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).show();
};

/**
 * 
 * @returns {undefined}
 */
Viewer.onMoveEnd = function() {
  GeneralObject.onMoveEnd();

  var rep = $(this.getRepresentation());
  $("div.moveOverlay", rep).hide();
};

/**
 * 
 * @returns {undefined}
 */
Viewer.resizeHandler = function() {

  this.setDimensions(this.getViewWidth(), this.getViewHeight());
  this.setPosition(this.getViewX(), this.getViewY());

  //this.drawTitle();
  this.adjustPaper();
};

/**
 * 
 * @returns {undefined}
 */
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

  if (iframe.data("fullscreen") && scaleFactor > 1.5) {
    // Move the scaleContainer a little bit to the right and overwrite the scale factor.
    // 5 is just some constant, which was determined by try and error...
    scaleContainer.css("margin-left", (width * (scaleFactor - 1.5)) / 5);
    scaleFactor = 1.5;
  } else {
    scaleContainer.css("margin-left", "");
  }

  iframe.data("scaleFactor", scaleFactor);

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
