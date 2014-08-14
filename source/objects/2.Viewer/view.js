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
  var highlightMenu = $(".highlightMenu", viewerContainer);

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

        // Enable the highlight buttons
        $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", false);

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

    var lastHoverButton;
    $(".btn", highlightMenu).mouseleave(function(event) {
      lastHoverButton = $(this);
    });

    // Show the highlight menu
    highlightMenu.hover(function(event) {
      //// Hover in
      clearTimeout(highlightMenuTimer);
    }, function(event) {
      if (!lastHoverButton.hasClass("btnStartRecording")) {
        highlightMenu.hide();
      }
    });

    highlightMenu.on("click", function(event) {
      if (!$(event.target).hasClass("btnStartRecording")) {
        highlightMenu.hide();
        // Disable the highlight buttons
        $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
      }
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

        if (!$(event.target).hasClass("btnStartRecording")) {
          $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
          highlightMenu.hide();

          // Reset the highlightings
          self.loadHighlights();
        }
      }
    });

    /**
     * 
     * @param {type} elem
     * @param {type} parent
     * @returns {}
     */
    var sumOffsetParent = function(elem, parent) {
      if (!elem)
        elem = this;

      var x = 0;
      var y = 0;

      while (elem != parent) {
        x += elem.offsetLeft;
        y += elem.offsetTop;

        elem = elem.offsetParent;
      }

      return {left: x, top: y};
    };

    var getGridPosition = function(elem) {
      var gridSize = 20;
      var verticalOffset = 30;

      var page = elem.parents(".pc");

      var position = sumOffsetParent(elem[0].offsetParent, page[0]);
      position.top = Math.floor(Math.floor(position.top / gridSize) * gridSize) + verticalOffset;
      position.left = 0;

      return position;
    };

    var setFixedPosition = function(position, elem) {
      var page = elem.parents(".pc");
      var count = $('[data-top-initial*="' + position.top + '"]', page).length;

      // Check if the elem itself is already part of the DOM. If so decrement the count by one. 
      if (elem.parents('html', frameDocument).length > 0)
        count--;

      position.top += (10 * count);
      position.left += (15 * count);

      elem.css("top", position.top).css("left", position.left);
    };

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
        var position = getGridPosition(that);

        // create an audio play button
        var audioobject = $('<div>')
                .attr('id', aoid)
                .attr("data-top-initial", position.top)
                .addClass('audioobject')
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
                .appendTo(that.closest(".pc"));

        setFixedPosition(position, audioobject);

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

    /**
     * 
     * @param {type} user
     * @param {type} data
     * @returns 
     */
    var createCommentOnViewer = function(user, data) {

      var commentId = "comment_" + data.hash;
      var commentContainer = $("#" + commentId, frameDocument)[0];

      if (!commentContainer) {
        var page = $("#" + data.page, frameDocument);

        // Create a new one...
        commentContainer = $("<div>")
                .attr("id", "comment_" + data.hash)
                .attr("data-top-initial", data.position.top)
                .addClass("comment");

        // Insert the content
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
        $(".pc", page).append(commentContainer);

        setFixedPosition(data.position, commentContainer);
      }

      return commentContainer;
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

    /**
     * 
     * @returns {undefined}
     */
    self.loadHighlights = function() {
      var jsonStr = self.getAttribute('highlights');
      if (jsonStr != undefined && jsonStr != '') {
        highlighter.removeHighlights();
        highlighter.deserializeHighlights(jsonStr);
        window.setTimeout(self.addAudioToHighlights, 50);
        window.setTimeout(self.linkCommentToHighlights, 50);
      }
    };

    // Load the highlights initially.
    self.loadHighlights();

    self.saveHighlights = function() {
      // Before we save it. Remove helper css classes
      $(".highlighted", frameDocument).removeClass("selected remotehover");

      var jsonStr = highlighter.serializeHighlights();
      self.setAttribute('highlights', jsonStr);
    };

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

    /**
     * 
     * @param {type} element
     * @param {type} callback
     * @returns {undefined}
     */
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
              var pageid = element.parents(".pf").attr("id");
              var position = getGridPosition(element);

              var date = new Date();
              var data = {
                'text': text,
                'page': pageid,
                'position': position,
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

      // z-index fix for the fullscreen mode.
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

    var btnStartRecording = $(".btnStartRecording", viewerContainer);
    var btnStopRecording = $(".btnStopRecording", viewerContainer);

    btnStartRecording.on("mouseenter", function(event) {
      // Init only if the mouse enters for the first time!
      initAudio();
      btnStartRecording.off("mouseenter");
    });

    btnStartRecording.on("click", function(event) {
      if (startRecording()) {
        // Recording now...
        $(".btnHighlight:not(.btnStopRecording)", viewerContainer).prop("disabled", true);

        btnStartRecording.toggle();
        btnStopRecording.toggle();
      } else {
        var html = '<div><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 100px 0;"></span>'
                + 'If you want to use the audio comment funtionality, you have to grant me access to your microphone. '
                + 'Do you want me to ask for access again?'
                + '</p></div>';

        $(html).dialog({
          title: 'No access to your microphone',
          resizable: false,
          width: 400,
          height: 200,
          modal: true,
          buttons: {
            "Yes": function() {
              initAudio();
              $(this).dialog("close");
            },
            "No": function() {
              $(this).dialog("close");
            }
          }
        });
      }
    });

    btnStopRecording.on("click", function(event) {
      $(".btnHighlight", viewerContainer).prop("disabled", false);

      btnStartRecording.toggle();
      btnStopRecording.toggle();
      
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
          '<input disabled="disabled" type="image" class="btn btnFill btnHighlight" title="Highlight the current selection (background color)." src="/guis.common/images/oxygen/16x16/actions/format-fill-color.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStrike btnHighlight" title="Strike through the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-strikethrough.png" />' +
          '<input disabled="disabled" type="image" class="btn btnScratchout btnHighlight" title="Scratch out the current selection." src="/guis.common/images/oxygen/16x16/actions/format-text-scratch-out.png" />' +
          '<input disabled="disabled" type="image" class="btn btnGlow btnHighlight" title="Add a glow effect to this selection." src="/guis.common/images/oxygen/16x16/actions/format-text-glow.png" />' +
          //'<input disabled="disabled" type="image" class="btn btnRemove" title="Remove this highlighting." src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          '</div>' +
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnAddComment btnHighlight" title="Add a comment for this selection." src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-add.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStartRecording btnHighlight lastChild" title="Click to start recording." src="/guis.common/images/oxygen/16x16/actions/media-recording-stopped.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStopRecording btnHighlight" title="Recording... Click to stop recording." src="/guis.common/images/oxygen/16x16/actions/media-recording.png" />' +
          '</div>' +
          ''
          );

  $(".buttonAreaRight", header).html(
          '<div class="btn-group">' +
          '<input type="image" class="btn btnTwopage" title="Two page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-new.png" />' +
          '<input type="image" class="btn btnSinglepage firstChild" title="Single page mode" src="/guis.common/images/oxygen/16x16/actions/view-right-close.png" style="display: none;" />' +
          '<input type="image" class="btn btnFullscreen lastChild" title="Fullscreen" src="/guis.common/images/oxygen/16x16/actions/view-fullscreen.png" />' +
          '<input type="image" class="btn btnRestore" title="Restore Screen" src="/guis.common/images/oxygen/16x16/actions/view-restore.png" style="display: none;" />' +
          '</div>' +
          '');

  var highlightMenu = $("<div>");
  highlightMenu.addClass("highlightMenu jPopover");
  highlightMenu.append($(".buttonAreaLeft > div", header).clone());
  $(".btn", highlightMenu).prop("disabled", false);

  $body.append(highlightMenu);

//  var audioMenu = $("<div>");
//  audioMenu.addClass("audioMenu jPopover");
//  audioMenu.html(
//          '<div class="btn-group">' +
//          '<input type="image" class="btn btnStartRecording lastChild" title="Click to start recording." src="/guis.common/images/oxygen/16x16/actions/media-recording-stopped.png" />' +
//          '<input type="image" class="btn btnStopRecording firstChild" title="Recording... Click to stop recording." src="/guis.common/images/oxygen/16x16/actions/media-recording.png" />' +
//          '</div>' +
//          '<div class="btn-group">' +
//          '<input type="image" class="btn btnPlay" title="Play" src="/guis.common/images/oxygen/16x16/actions/media-playback-start.png" />' +
//          '<input type="image" class="btn btnPause firstChild" title="Pause" src="/guis.common/images/oxygen/16x16/actions/media-playback-pause.png" />' +
//          '<input type="image" class="btn btnStop" title="Stop" src="/guis.common/images/oxygen/16x16/actions/media-playback-stop.png" />' +
//          '</div>' +
//          '<div class="btn-group">' +
//          '<input type="image" class="btn btnUpload" title="Upload the recording to the server." src="/guis.common/images/oxygen/16x16/places/network-workgroup.png" />' +
//          '</div>' +
//          ''
//          );

//  $body.append(audioMenu);

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
  var iframe = $('#iframe-' + this.getAttribute('id'));
  //var frameDocument = iframe.contents();

  if (iframe[0].contentWindow.pdf2htmlEX) {
    var pdfviewer = iframe[0].contentWindow.pdf2htmlEX.defaultViewer;

    pdfviewer.rescale(1, false);
    pdfviewer.fit_width();

    if (this.getAttribute('twopage'))
    {
      pdfviewer.rescale(0.5, true);
    }
  }
};
