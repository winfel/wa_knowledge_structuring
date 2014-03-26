/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var that = this;

  this.init = function() {
    console.log("GUI.rightmanager initialized");
  };

  this.updateContent = function(theObject) {
    $("#rightmanager").html("<p>Rightmanager for:<br>- " + theObject.id + "<br>- " + theObject.type + "</p>");
  };
};

