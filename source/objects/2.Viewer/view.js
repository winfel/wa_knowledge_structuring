/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

/**
 * 
 * @param {type} external
 * @returns {Viewer.draw@call;getRepresentation}
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

  /**
   * 
   * @param {type} event
   * @returns {undefined}
   */
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
    viewerContainer.data("twopage", true);

    btnTwopage.toggle();
    btnSinglepage.toggle();
    
    self.adjustPaper();
  });

  btnSinglepage.click(function() {
    viewerContainer.data("twopage", false);

    btnTwopage.toggle();
    btnSinglepage.toggle();
    
    self.adjustPaper();
  });

  var showHighlightMenu = function(event, frameDocument, showRemoveButton) {
    var left = event.pageX - highlightMenu.width() / 2;
    var top = event.pageY - 10 - $(frameDocument).scrollTop();

    if (left < 0)
      left -= left;

    var right = left + highlightMenu.width() + 20;
    var docWidth = $(frameDocument).width();

    if (right > docWidth)
      left -= (right - docWidth);

    highlightMenu.css("left", left);
    highlightMenu.css("top", top);

    if (showRemoveButton)
      $(".btnRemove", highlightMenu).show();
    else
      $(".btnRemove", highlightMenu).hide();

    highlightMenu.show();
  };

  var hideHighlightMenu = function(delayed) {
    if (delayed) {
      clearTimeout(highlightMenuTimer);
      highlightMenuTimer = setTimeout(function() {
        highlightMenu.hide();
      }, 250);
    }
    else {
      highlightMenu.hide();
    }
  };

  var disableHeaderButtons = function() {
    $(".buttonAreaLeft .btn", viewerContainer).prop("disabled", true);
  };

  var enableHeaderButtons = function(withRemoveButton) {
    $(".buttonAreaLeft .btn" + (!withRemoveButton ? ":not(.btnRemove)" : ""), viewerContainer).prop("disabled", false);
  };

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

        // Enable the highlight buttons in the header of the viewer
        enableHeaderButtons();

        $(".highlighted.selected", frameDocument).hover(function(event) {
          showHighlightMenu(event, frameDocument);
        }, function() {
          hideHighlightMenu(true);
        });
      }
    });

    // Get the highlighter object
    highlighter = frameDocument.getHighlighter();

    // Remove old selected text...
    $(".highlighted.selected", frameDocument).each(function() {
      highlighter.removeHighlights(this);
    });

    // Disable the hide timer and keep it visible.
    highlightMenu.hover(function(event) {
      clearTimeout(highlightMenuTimer);
    }, function() {
      hideHighlightMenu();
    });

    highlightMenu.on("click", function(event) {
      hideHighlightMenu();
      disableHeaderButtons();
    });

    // Remove selected highlightings...
    frameDocument.on("mousedown", function(event) {
      if (selection && event.target != selection) {
        // Remove the selected (not highlighted) text.
        $(".highlighted.selected:not(.modify)", frameDocument).each(function() {
          highlighter.removeHighlights(this);
        });
        // Remove the selected for modification text...
        $(".selected.modify", frameDocument).removeClass("modify");

        selection = null;

        // Disable the highlight buttons
        disableHeaderButtons();
        hideHighlightMenu();

        // Reset the highlightings
        self.loadHighlights();
      }
    });

    /**
     * Calculates the absolute offset of an element to a parent.
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

    /**
     * Creates a div container representing comments and audio objects inside the frame object.
     * 
     * @param {type} user   The user, who created the comment
     * @param {type} id     The id of the comment
     * @param {type} data   The comment data
     * @returns The div container 
     */
    var createCommentOnViewer = function(user, id, data) {

      var isAudio = (data.type.indexOf("audio") >= 0);
      var commentClass = (isAudio ? "audioobject" : "comment");
      var commentIdPrefix = commentClass + "_";

      var commentId = commentIdPrefix + id;
      var commentContainer = $("#" + commentId, frameDocument)[0];

      if (!commentContainer) {
        var page = $("#" + data.page, frameDocument);

        // Create a new one...
        commentContainer = $("<div>")
                .attr("id", commentId)
                .attr("data-id", id)
                .attr("data-top-initial", data.position.top)
                .addClass(commentClass);

        // Insert the content
        if (isAudio) {
          var wave = new Audio(data.message);

          $(wave).on('playing', function() {
            commentContainer.addClass('playing');
          });
          $(wave).on('pause', function() {
            commentContainer.removeClass('playing');
          });
          $(wave).on('ended', function() {
            // chrome has a replay bug; load fixes it
            if (window.chrome) {
              wave.load();
            }
          });

          commentContainer.click(function() {
            wave.paused ? wave.play() : wave.pause();
          });

        } else {
          commentContainer.html('<p class="commentHeader" title="' + data.date.toLocaleString() + '">'
                  + user + self.translate(GUI.currentLanguage, ' wrote') + '</p>' +
                  '<p>' + data.message + '</p>');

          var deleteImg = $("<img>");
          deleteImg.attr("alt", "Delete");
          deleteImg.attr("src", "/guis.common/images/oxygen/16x16/actions/edit-delete.png");
          deleteImg.on("click", function(event) {
            DBManager.removeDocument(self, "comments", id);
            event.stopPropagation();
          });
          $("p.commentHeader", commentContainer).append(deleteImg);

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
        }

        // Append the comment to the body
        $(".pc", page).append(commentContainer);

        setFixedPosition(data.position, commentContainer);
      }

      return commentContainer;
    };

    var linkCommentWithHighlight = function(commentContainer, commentId, cssClass, dataAttributeName) {
      commentContainer = $(commentContainer);
      commentContainer.off("hover");
      var commentHighlight = $(".highlighted." + cssClass + "[" + dataAttributeName + "='" + commentId + "']", frameDocument)[0];

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

        commentContainer.removeClass("noreference");
      } else {
        // 
        commentContainer.addClass("noreference");
      }
    };

    self.relinkCommentsWithHighlights = function() {
      $(".comment", frameDocument).each(function() {
        linkCommentWithHighlight(this, $(this).attr("data-id"), "commented", "data-comment");
      });

      $(".audioobject", frameDocument).each(function() {
        linkCommentWithHighlight(this, $(this).attr("data-id"), "audio", "data-audioobject");
      });

      // Do also a litte bit more...
      $(".highlighted:not(.selected)", frameDocument).each(function() {
        $(this).off("click").on("click", function(event) {
          selection = this;
          $(this).addClass("selected modify");
          showHighlightMenu(event, frameDocument, true);
          enableHeaderButtons(true);

          $(this).off("hover").hover(function() {
            showHighlightMenu(event, frameDocument, true);
          }, function() {
            hideHighlightMenu(true);
          });
        });
      });
    };

    self.loadTextComments = function() {
      Viewer.updateStatus(self.translate(GUI.currentLanguage, 'Loading comments.'));
      DBManager.getDocuments(self, "comments");
    };

    self.loadAudioComments = function() {
      Viewer.updateStatus(self.translate(GUI.currentLanguage, 'Loading audio comments.'));
      DBManager.getDocuments(self, "comments_audio");
    };

    var statusTimer;
    Viewer.updateStatus = function(text) {

      var status = $(".paperViewerFooter .status", viewerContainer);

      if (text) {
        clearTimeout(statusTimer);
        status.show();
        status.html(text);
      } else {
        statusTimer = setTimeout(function() {
          status.hide();
        }, 2500);
      }
    };

    Viewer.addComment = function(user, id, data) {
      createCommentOnViewer(user, id, data);
      self.relinkCommentsWithHighlights();
    };

    Viewer.removeComment = function(id, dataPrefix, cssClassHighlight) {
      // Remove the comment
      $("#" + dataPrefix + "_" + id, frameDocument).remove();

      // Remove the highlights
      $("." + cssClassHighlight + "[data-" + dataPrefix + "=\"" + id + "\"]", frameDocument).each(function() {
        highlighter.removeHighlights(this);
      });
      self.saveHighlights();
    };

    var removeHighlight = function(elem) {
      var element = $(elem);

      highlighter.removeHighlights(element);
      self.saveHighlights();

      if (element.hasClass("commented")) {
        DBManager.removeDocument(self, "comments", element.attr("data-comment"));
      } else if (element.hasClass("audio")) {
        DBManager.removeDocument(self, "comments_audio", element.attr("data-audioobject"));
      }
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

        self.relinkCommentsWithHighlights();
      }
    };

    // Load the highlights initially.
    self.loadTextComments();
    self.loadAudioComments();

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

    var addCommentDialog = function(element, callback) {
      var theDialogContainer = $("<div>");
      theDialogContainer.html('<textarea class="addCommentText" style="width: 96%; height: 98%;"></textarea>');

      var theDialog = theDialogContainer.dialog({
        title: self.translate(GUI.currentLanguage, "Type your comment..."),
        height: 300,
        width: 350,
        modal: true,
        buttons: [
          {
            text: GUI.translate("Submit"),
            click: function() {
              var text = $(".addCommentText", theDialogContainer).val().trim();

              if (text == "") {
                alert(self.translate(GUI.currentLanguage, "Your comment is empty. Try again with some letters!"));
              } else {
                var pageid = element.parents(".pf").attr("id");
                var position = getGridPosition(element);

                var date = new Date();
                var data = {
                  'type': "text/plain",
                  'message': text,
                  'page': pageid,
                  'position': position,
                  'date': date
                };

                var commentId = MD5(text + "_" + date.getTime());

                callback(commentId);
                DBManager.addDocument(self, "comments", commentId, data);

                theDialog.dialog("close");

                $(frameDocument).trigger("mousedown");
              }
            }
          },
          {
            text: GUI.translate("Cancel"),
            click: function() {
              theDialog.dialog("close");
            }
          }
        ],
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

      addCommentDialog(selected, function(commentId) {
        selected.removeClass("selected")
                .addClass("commented")
                .attr('data-comment', commentId);

        self.saveHighlights();
      });
    });

    /**
     * 
     * @param {type} element
     * @param {type} callback
     * @returns {undefined}
     */
    var addAudioDialog = function(element, callback) {
      var t = {// get translations
        clicktostart: self.translate(GUI.currentLanguage, 'Click to start recording.'),
        clicktostop: self.translate(GUI.currentLanguage, 'Recording... Click to stop recording.'),
        clicktoplay: self.translate(GUI.currentLanguage, 'Click to play the audio file.'),
        clicktopause: self.translate(GUI.currentLanguage, 'Click to pause the audio file.'),
        clicktostopaudio: self.translate(GUI.currentLanguage, 'Click to stop the audio file.'),
        askforaccessagain: self.translate(GUI.currentLanguage, 'If you want to use the audio comment funtionality, you have to grant me access to your microphone. '
                + 'Do you want me to ask for access again?'),
        noaccesstomic: self.translate(GUI.currentLanguage, 'No access to your microphone'),
        createaudio: self.translate(GUI.currentLanguage, "Create an audio comment..."),
        haventrecorded: self.translate(GUI.currentLanguage, "Your haven't recorded anything yet!"),
      };
      var theDialogContainer = $('<div>');
      theDialogContainer.html(
              '<p></p>' +
              '<ul>' +
              '</ul>' +
              '<div class="btn-group">' +
              '<input type="image" class="btn btnStartRecording lastChild" title="' + t.clicktostart + '" src="/guis.common/images/oxygen/32x32/actions/media-recording-stopped.png" />' +
              '<input type="image" class="btn btnStopRecording firstChild" title="' + t.clicktostop + '" src="/guis.common/images/oxygen/32x32/actions/media-recording.png" />' +
              '</div>' +
              '<div class="btn-group">' +
              '<input disabled="disabled" type="image" class="btn btnPlayback btnPlaybackStart" title="' + t.clicktoplay + '" src="/guis.common/images/oxygen/32x32/actions/media-playback-start.png" />' +
              '<input disabled="disabled" type="image" class="btn btnPlayback btnPlaybackPause firstChild" title="' + t.clicktopause + '" src="/guis.common/images/oxygen/32x32/actions/media-playback-pause.png" />' +
              '<input disabled="disabled" type="image" class="btn btnPlayback btnPlaybackStop" title="' + t.clicktostopaudio + '" src="/guis.common/images/oxygen/32x32/actions/media-playback-stop.png" />' +
              '</div>' +
              ''
              );

      var audioObject;
      var waveBase64;
      var waveMimeType;

      // Playback functions and buttons
      var playbackStartPause = function() {
        audioObject.paused ? audioObject.play() : audioObject.pause();
      };

      var playbackStop = function() {
        audioObject.pause();
        audioObject.currentTime = 0;
      };

      var btnPlaybackStart = $(".btnPlaybackStart", theDialogContainer);
      var btnPlaybackPause = $(".btnPlaybackPause", theDialogContainer);

      btnPlaybackStart.on("click", playbackStartPause);
      btnPlaybackPause.on("click", playbackStartPause);
      $(".btnPlaybackStop", theDialogContainer).on("click", playbackStop);

      // Recording functions and buttons
      var btnStartRecording = $(".btnStartRecording", theDialogContainer);
      var btnStopRecording = $(".btnStopRecording", theDialogContainer);

      btnStartRecording.on("click", function(event) {
        if (startRecording()) {
          btnStartRecording.toggle();
          btnStopRecording.toggle();
        } else {
          var html = '<div><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 100px 0;"></span>'
                  + t.askforaccessagain
                  + '</p></div>';

          $(html).dialog({title: t.noaccesstomic,
            resizable: false, width: 400, height: 200, modal: true,
            buttons: [
              {
                text: GUI.translate("Yes"),
                click: function() {
                  initAudio();
                  $(this).dialog("close");
                }
              },
              {
                text: GUI.translate("No"),
                click: function() {
                  $(this).dialog("close");
                }
              }
            ]
          });
        }
      });

      btnStopRecording.on("click", function(event) {
        btnStartRecording.toggle();
        btnStopRecording.toggle();

        stopRecording(false, function(blob) {
          // Create the audio object...
          var reader = new FileReader();
          reader.onloadend = function() {
            // Store the base64 encoded wave file...
            waveBase64 = reader.result;
            waveMimeType = blob.type;
            audioObject = new Audio(waveBase64);


            if (audioObject) {
              $(".btnPlayback", theDialogContainer).prop("disabled", false);

              $(audioObject).on('stalled', function() {
                audioObject.load();
              });

              $(audioObject).on('playing', function() {
                btnPlaybackStart.hide();
                btnPlaybackPause.show();
              });

              $(audioObject).on('pause', function() {
                btnPlaybackStart.show();
                btnPlaybackPause.hide();
              });

              $(audioObject).on('ended', function() {
                // chrome has a replay bug; load fixes it
                if (window.chrome) {
                  audioObject.load();
                }
              });
            }
          };

          reader.readAsDataURL(blob);
        });
      });

      var theDialog = theDialogContainer.dialog({
        title: t.createaudio,
        height: 300,
        width: 350,
        modal: true,
        buttons: [
          {
            text: GUI.translate("Submit"),
            click: function() {
              if (waveBase64) {
                var pageid = element.parents(".pf").attr("id");
                var position = getGridPosition(element);

                var date = new Date();
                var data = {
                  'type': waveMimeType,
                  'message': waveBase64,
                  'page': pageid,
                  'position': position,
                  'date': date
                };

                var commentId = MD5(GUI.username + "_audioobject_" + date.getTime());

                // Update the highlight first
                callback(commentId);
                DBManager.addDocument(self, "comments_audio", commentId, data);

                theDialog.dialog("close");

                $(frameDocument).trigger("mousedown");

              } else {
                alert(t.haventrecorded);
              }
            }
          },
          {
            text: GUI.translate("Cancel"),
            click: function() {
              theDialog.dialog("close");
            }
          }
        ],
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
    }; // end addAudioDialog


    $(".btnRecord", viewerContainer).on("click", function() {
      initAudio();
      var selected = $(".highlighted.selected", frameDocument);

      addAudioDialog(selected, function(commentId) {
        $(".highlighted.selected", frameDocument)
                .removeClass("selected")
                .addClass('audio')
                .attr('data-audioobject', commentId);
        self.saveHighlights();
      });
    });

    $(".btnRemove", viewerContainer).on("click", function() {
      $(".highlighted.selected", frameDocument).each(function() {
        removeHighlight(this);
      });
    });

    $(".btn", viewerContainer).on("click", function() {
      var element = $(this);

      if (!element.hasClass("btnAddComment")
              && !element.hasClass("btnRecord")) {
        // On mousedown on the framedocument we will reset selection and other things.
        // Which is why we trigger the mousedown event here...
        // AddComment and Record trigger this event on it's own!
        $(frameDocument).trigger("mousedown");
      }
    });
  };

  // activate highlighter for iframe when iframe document is loaded
  iframe.load(initializeTextHighlighter);  // Non-IE
  iframe.ready(initializeTextHighlighter); // IE
};

Viewer.createRepresentation = function(parent) {
  var self = this;
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

  var t = {
    highlight: self.translate(GUI.currentLanguage, 'Highlight the current selection (background color).'),
    strike: self.translate(GUI.currentLanguage, 'Strike through the current selection.'),
    scratch: self.translate(GUI.currentLanguage, 'Scratch out the current selection.'),
    glow: self.translate(GUI.currentLanguage, 'Add a glow effect to this selection.'),
    remove: self.translate(GUI.currentLanguage, 'Remove this highlighting.'),
    comment: self.translate(GUI.currentLanguage, 'Add a comment for this selection.'),
    record: self.translate(GUI.currentLanguage, 'Click to start recording.'),
    twopage: self.translate(GUI.currentLanguage, 'Two page mode'),
    singlepage: self.translate(GUI.currentLanguage, 'Single page mode'),
    fullscreen: self.translate(GUI.currentLanguage, 'Fullscreen'),
    restore: self.translate(GUI.currentLanguage, 'Restore Screen')
  };

  $(".buttonAreaLeft", header).html(
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnFill btnHighlight" title="' + t.highlight + '" src="/guis.common/images/oxygen/16x16/actions/format-fill-color.png" />' +
          '<input disabled="disabled" type="image" class="btn btnStrike btnHighlight" title="' + t.strike + '" src="/guis.common/images/oxygen/16x16/actions/format-text-strikethrough.png" />' +
          '<input disabled="disabled" type="image" class="btn btnScratchout btnHighlight" title="' + t.scratch + '" src="/guis.common/images/oxygen/16x16/actions/format-text-scratch-out.png" />' +
          '<input disabled="disabled" type="image" class="btn btnGlow btnHighlight" title="' + t.glow + '" src="/guis.common/images/oxygen/16x16/actions/format-text-glow.png" />' +
          //'<input disabled="disabled" type="image" class="btn btnRemove" title="' + t.remove + '" src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          '</div>' +
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnAddComment btnHighlight" title="' + t.comment + '" src="/guis.common/images/oxygen/16x16/actions/view-pim-notes-add.png" />' +
          '<input disabled="disabled" type="image" class="btn btnRecord btnHighlight" title="' + t.record + '" src="/guis.common/images/oxygen/16x16/actions/media-record.png" />' +
          '</div>' +
          '<div class="btn-group">' +
          '<input disabled="disabled" type="image" class="btn btnRemove btnHighlight" title="' + t.remove + '" src="/guis.common/images/oxygen/16x16/actions/edit-delete.png" />' +
          '</div>' +
          ''
          );

  $(".buttonAreaRight", header).html(
          '<div class="btn-group">' +
          '<input type="image" class="btn btnTwopage" title="' + t.twopage + '" src="/guis.common/images/oxygen/16x16/actions/view-right-new.png" />' +
          '<input type="image" class="btn btnSinglepage firstChild" title="' + t.singlepage + '" src="/guis.common/images/oxygen/16x16/actions/view-right-close.png" style="display: none;" />' +
          '<input type="image" class="btn btnFullscreen lastChild" title="' + t.fullscreen + '" src="/guis.common/images/oxygen/16x16/actions/view-fullscreen.png" />' +
          '<input type="image" class="btn btnRestore" title="' + t.restore + '" src="/guis.common/images/oxygen/16x16/actions/view-restore.png" style="display: none;" />' +
          '</div>' +
          '');

  var highlightMenu = $("<div>");
  highlightMenu.addClass("highlightMenu jPopover");
  highlightMenu.append($(".buttonAreaLeft > div", header).clone());
  $(".btn", highlightMenu).prop("disabled", false);
  $(".btnRemove", highlightMenu).hide();

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
  borderBottom.html('<div class="status"></div>');
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
    $(".titleArea", rep).html('<span class="paperViewerTitle">' + this.translate(GUI.currentLanguage, 'No document...') + '</span><div class="moveArea"></div>');
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
	var highlights = file.getAttribute('highlights');
	this.set('highlights', highlights);

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
  var viewerContainer = $('[data-id="paperViewer-' + this.getAttribute('id') + '"]');
  var iframe = $('#iframe-' + this.getAttribute('id'));

  if (iframe[0].contentWindow.pdf2htmlEX) {
    if (viewerContainer.hasClass("fullscreen"))
      iframe.height(viewerContainer.height() - $(".paperViewerHeader", this).height());
    else
      iframe.height(this.getViewHeight() - $(".paperViewerHeader", this).height());

    var pdfviewer = iframe[0].contentWindow.pdf2htmlEX.defaultViewer;

    pdfviewer.rescale(1, false);
    pdfviewer.fit_width();

    if (viewerContainer.data('twopage'))
    {
      pdfviewer.rescale(0.5, true);
    }
  }
};
