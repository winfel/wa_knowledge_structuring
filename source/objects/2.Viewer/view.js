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
      // before highlighting, test if selected elements are valid for highlighting
      onBeforeHighlight: function(range) {
        // only allow selections within one ".pc"
        return ($(range.commonAncestorContainer).closest('.pc').length > 0);
      },
      // register a function to call after each highlight process
      onAfterHighlight: function(highlights, range) {
        // TODO: maybe postprocess highlights here, set different style and transmit to server
        console.log(highlights);
        $(highlights)
                .css('background-color', $.Color(ObjectManager.getUser().color).alpha(0.4))
                .addClass('by_user_' + GUI.userid)
                .addClass('at_time_' + (new Date()).getTime())
                .attr('title', 'by ' + GUI.username);
        // save highlights to server
        var jsonStr = highlighter.serializeHighlights();
        self.setAttribute('highlights', jsonStr);
      }
    });

    console.log('highlighting for object ' + rep.id + ' activated');

    // get the highlighter object
    highlighter = frameDocument.getHighlighter();

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
                  that.toggleClass('remotehover');
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
          audioobject.toggleClass('remotehover');
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


    var menu = $('<div id="highlightmenu"></div>')
            // invisible placeholder at the bottom of the menu to close the gap between the menu and the text
            .append('<div class="closegap"></div>');


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
            $('<button id="addAudioComment" title="add audio comment">A</button>')
            // start recording while mousedown
            .mousedown(startRecording)
            // stop recording and save when mouseup
            .mouseup(function() {
              stopRecording(function(newObject) {
                lastTarget.addClass('audio');
                // connect the highlight with the newly created audio
                lastTarget.attr('data-audioobject', newObject.getAttribute('id'));

                self.saveHighlights();
                menu.hide();
              });
            })
            );
    menu.append(
            $('<button id="removeHighlighting" title="remove highlighting">X</button>').click(function(event) {
      highlighter.removeHighlights(lastTarget);
      self.saveHighlights();
      menu.hide();
    })
            );
    frameDocument.find('body').append(menu);
    menu.hide();

    var delaymenu;

    frameDocument.on('mouseover', '.highlighted', function(event) {
      var matchIdClass = /(by_user_\w+|at_time_[0-9]+)/g;
      if (delaymenu != undefined)
        window.clearTimeout(delaymenu);
      delaymenu = window.setTimeout(function() {
        var classname = $(event.target).attr('class');
        // try to identify all belonging highlights by user and time identifier
        classname = classname.match(matchIdClass);
        if (classname && classname.length == 2)
          lastTarget = frameDocument.find('.' + classname[0] + '.' + classname[1]);
        else
          lastTarget = $(event.target);
        var refpos = lastTarget.offset();
        menu.show();
        //refpos.left += 5;
        refpos.top -= menu.height() + 5;
        menu.offset(refpos).offset(refpos).offset(refpos); // repeated repositioning fixes somehow the transform-offset bug
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
  
  this.drawTitle();
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
  } else {
    scaleContainer.removeClass("fullscreen");
    width = this.getAttribute('width') - 30;
    height = this.getAttribute('height') - 30;
  }

  var scaleFactor = (width / papersWidth);

  if (iframe.data("fullscreen") && scaleFactor > 1.5)
    scaleFactor = 1.5;

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
