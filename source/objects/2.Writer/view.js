/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

/**
 * @function draw
 * @param external
 */
Writer.draw = function (external) {
  var rep = this.getRepresentation();
  this.drawDimensions(external);
  this.setViewWidth(this.getAttribute('width'));
  this.setViewHeight(this.getAttribute('height'));
  
  console.log(rep);
  
  $(rep).attr("layer", this.getAttribute('layer'));
  this.updateContent();
}

Writer.updateContent = function () {
  var rep = this.getRepresentation();

  this.getContentAsString(function (text) {

    if (text != that.oldContent) {
      $(rep).find("body").html(text);
    }

    that.oldContent = text;

  });
}

/**
 * @param parent
 * @return {undefined}
 */
Writer.createRepresentation = function (parent) {
  var rep = GUI.svg.other(parent, "foreignObject");
  rep.dataObject = this;
  var $rep = $(rep);

  var body = document.createElement("body");
  $rep.attr({id: this.getAttribute('id')});
  $rep.append(body);

  var pWriter = $(body).addClass('paperWriter');
  
  var header = $("<div>");
  header.addClass("paperWriterHeader");
  header.html('<table><tr><td class="titleArea"></td></tr></table>');
  header.find(".titleArea").html(this.getAttribute("name"));
  
  pWriter.append(header);
  
  pWriter.append("<iframe></iframe>");

  var iFrame = $(pWriter.find("iframe"));
  var iFrameNotLoaded;

  iFrame.one('load', function () {
    clearTimeout(iFrameNotLoaded);
  });
  
  iFrameNotLoaded = window.setTimeout(function () {
    alert('Maybe etherpad is not installed / started at this server...');
  }, 20000);

  /* is there a chapter ? */
  var inv = ObjectManager.getCurrentRoom().getInventory();
  var foundChapter = this.getAttribute('initFinished');

  if (!foundChapter) {
    iFrame.attr('src', 'http://' + window.location.hostname + ':8080/write');
  } else {
    iFrame.attr('src', 'http://' + window.location.hostname + ':9001/p/' + this.getAttribute('paper') + '?userName=' + encodeURIComponent(GUI.userid));
  }

  this.initGUI(rep);

  return rep;
}
