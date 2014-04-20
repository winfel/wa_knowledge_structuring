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


  this.init = function(typeObject,idObject) {
    console.log("GUI.rightmanagerDialog initialized");
    var j=1;

     Modules.RightManager.getRolesForObject({id: idObject, type: typeObject}, function(roles2) {
               roles2.forEach(function(role) {
                    //Create tabs
                    listitems += "<li><a href='#tabs-"+j+"'>"+role.name+"</a></li>";

                    //Create tabpages
                      tabpages += "<div id='tabs-"+j+"'>";

                        //TODO: Create content of tabpages

                      tabpages +=  "</div>";
                 
                      $("#rmdTabList").append(listitems);
                       
                      $("#rmdTabs").append(tabpages);
               
                      listitems="";
                      tabpages = "";
                      j++;
               });

                 //Append Plus Tab
                $("#rmdTabList").append('<li class="rmdTabPage_add"><a href="#rmdTabPage_add">+</a></li>');
                //Set content for Plus Tab
                $("#rmdTabs").append('<div id="rmdTabPage_add">Bla</div>');

                // Create the tabs
                rmdTabs = $("#rmdTabs").tabs();

           });



    // Create the dialog
    this.rmd = $("#rightmanagerDialog").dialog({
      title: "Right Manager Setup",
      autoOpen: false,
      modal: true,
      width: 500,
      buttons: [
        {
             text: "Take default",
             click: function() {
                  $(this).dialog("close");
             }
         },
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
             text: "Save",
             click: function() {
                  $(this).dialog("close");
             }
          }
       
     ]
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
      this.init(typeOfObject.type,typeOfObject.id);
      console.log("Just created");

      // Open the dialog
      this.rmd.dialog("open");
    }
  };


};

