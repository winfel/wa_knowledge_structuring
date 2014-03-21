/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

OperatorObject.draw = function(external) {
  // this representation
  var rep = this.getRepresentation();

  this.drawDimensions(external);
  
  // Apply new default width / height
  this.setViewWidth(this.getAttribute('width'));
  this.setViewHeight(this.getAttribute('height'));
  
  var newHtml = "";
  if(!isNaN(this.getAttribute("value1")))
    newHtml += this.getAttribute("value1") + " ";
  newHtml += this.getAttribute("operator");

  $(rep).find("body>div>div").html(newHtml);
  
  $(rep).find("body>div").css("background-color", this.getAttribute('fillcolor'));
  $(rep).find("body").css("font-size", this.getAttribute('font-size'));
  $(rep).find("body").css("font-family", this.getAttribute('font-family'));
  $(rep).find("body").css("color", this.getAttribute('font-color'));
  
  $(rep).attr("layer", this.getAttribute('layer'));
  
  this.updateInnerHeight();
  this.adjustControls();
};

OperatorObject.updateInnerHeight = function() {
  var rep = this.getRepresentation();

  $(rep).find("body").css("height", ($(rep).attr("height")) + "px");
  $(rep).find("body>div").css("height", ($(rep).attr("height") - (2 * parseInt(this.getAttribute('linesize')))) + "px");
};

OperatorObject.createRepresentation = function(parent) {
  var rep = GUI.svg.other(parent, "foreignObject");

  rep.dataObject = this;

  var body = document.createElement("body");
  var html = '<div style="display: table; width: 100%;">'
          + '<div style="font-size: 20px; display: table-cell; vertical-align: middle; text-align: center;">'
          + '</div>'
          + '</div>';

  $(body).html(html);

  $(rep).append(body);
  $(rep).attr("id", this.getAttribute('id'));

  this.initGUI(rep);
  return rep;
};

OperatorObject.adjustControls = function() {
  this.updateInnerHeight();
  GeneralObject.adjustControls.call(this);
};
