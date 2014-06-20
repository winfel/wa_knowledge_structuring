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

  /* IFRAME */
  $viewer.append("<iframe></iframe>");
  
  var iFrame = $($viewer.find("iframe"));
  var iframe_loaded = false;
  iFrame.one('load', function() {
    iframe_loaded = true;
  });

  iFrame.attr('src', 'http://' + window.location.hostname + ':8080/getPaper/public/cd7e6155-3a12-49c7-9bbd-a8e3098bd65d.html/');

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
