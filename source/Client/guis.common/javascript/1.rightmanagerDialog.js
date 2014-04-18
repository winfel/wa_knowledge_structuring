/* 
 * Right Manager Dialog
 */

GUI.rightmanagerDialog = new function() {

  var rightsObjects = ["PaperObject", "Subroom"];

  var rmd = null;
  var rmdTabs = null;
  var rmdTabAdd = null;

  this.init = function() {
    console.log("GUI.rightmanagerDialog initialized");


    // Create the tabs
    this.rmdTabs = $("#rmdTabs").tabs();

    // Create the dialog
    this.rmd = $("#rightmanagerDialog").dialog({
      title: "Right manager dialog...",
      autoOpen: false,
      modal: true,
      buttons: {
        "Delete all items": function() {
          $(this).dialog("close");
        },
        "Cancel": function() {
          $(this).dialog("close");
        }
      }
    });
    
    // The add button
    this.rmdTabAdd = $(".rmdTabPage_add a").first();
    this.rmdTabAdd.on("click", function() {
      console.log("clicked");
    });
  };

  this.show = function(typeOfObject) {

    //Show rightmanager popup dialog if object has the rightmanager
    if (rightsObjects.indexOf(typeOfObject.type) >= 0) {
      console.log("Just created");

      // Open the dialog
      this.rmd.dialog("open");
    }
  };


};

