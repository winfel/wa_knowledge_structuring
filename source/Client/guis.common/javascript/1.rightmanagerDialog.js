/* 
 * Right Manager Dialog
 */

GUI.rightmanagerDialog = new function() {

  var rightsObjects = ["PaperObject", "Subroom"];
  var roles = ["Writer","Reviewer"];
  var listitems = "";
  var tabpages = "";

  var rmd = null;
  var rmdTabs = null;
  var rmdTabAdd = null;

  this.init = function() {
    console.log("GUI.rightmanagerDialog initialized");

    for (var i = 0; i < roles.length; i++) {          
          var j= i+1;
          listitems += "<li><a href='#tabs-"+j+"'>"+roles[i]+"</a></li>";
          

          tabpages += "<div id='tabs-"+j+"'>";
          
          //content of tabpages
          /*
          Modules.RightManager.getRolesForObject({id: 1, type: "PaperObject"}, function(roles) {
              roles.forEach(function(role) {
                console.log(role);
              });
          });
          */

          tabpages +=  "</div>";
            
        $("#rmdTabList").append(listitems);
        
       $("#rmdTabs").append(tabpages);

       listitems="";
       tabpages = "";
    };


    //Append Plus Tab
    $("#rmdTabList").append('<li class="rmdTabPage_add"><a href="#rmdTabPage_add">+</a></li>');
    //Set content for Plus Tab
    $("#rmdTabs").append('<div id="rmdTabPage_add">Bla</div>')


    // Create the tabs
    this.rmdTabs = $("#rmdTabs").tabs();

    // Create the dialog
    this.rmd = $("#rightmanagerDialog").dialog({
      title: "Rightmanager dialog",
      autoOpen: false,
      width: 500,
      modal: true,
      buttons: [
        {
            text: "Add user",            
            click: function() {
                 $(this).dialog("close");
            }
        },
        {
            text: "Delete user",
            click: function() {
                 $(this).dialog("close");
            }
        },
         {
            text: "Take default",
            click: function() {
                 $(this).dialog("close");
            }
        },
        {
            text: "Save",
            click: function() {
                 $(this).dialog("close");
            }
        }
    ]
      
    });

    // The add button
    this.rmdTabAdd = $(".rmdTabPage_add a").last();
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

