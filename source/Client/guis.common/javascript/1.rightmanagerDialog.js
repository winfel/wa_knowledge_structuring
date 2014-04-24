/* 
 * Right Manager Dialog
 */

GUI.rightmanagerDialog = new function() {

  var rightsObjects = ["PaperObject", "Subroom"];
  var roles = ["Writer","Reviewer"];
  var rights = [];
  var listitems = "";
  var tabpages = "";

  var rmd = null;
  var rmdTabs = null;
  var rmdTabAdd = null;
  var usersss = null;


  this.init = function(typeObject,idObject) {
    console.log("GUI.rightmanagerDialog initialized");


    var j=1;
    

     Modules.RightManager.getRolesForObject({id: idObject, type: typeObject}, function(roles2) {
               roles2.forEach(function(role) {      
                    var i = 0;          
                    //Create tabs
                    listitems += "<li><a href='#tabs-"+j+"'>"+role.name+"</a></li>";

                    //Create tabpages
                      tabpages += "<div id='tabs-"+j+"'>";

                      //Create content of tabpages
                        //Rights
                        tabpages += '<h3>Rights </h3><hr><br>';
                        rights = role.rights;
                        rights.forEach(function(right) {
                              tabpages += '<input type="checkbox" id="right-'+i+'" checked>'+rights[i]+' </input>';    
                              i++;                            
                              });
                          

                        //TODO: Users
                        tabpages += '<h3>Users </h3><hr><br>';
                        tabpages += '<div id=selectusers></div><br>';
                        
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
              addusers();
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
  


     this.usersss = $("#userdialog").dialog({
         //autoOpen: false,
         buttons: [
        {
             text: "Take default",
             click: function() {
                  $(this).dialog("close");
             }
         }
       
     ]
    });

  }; // init functions ends



  this.show = function(typeOfObject) {

    //Show rightmanager popup dialog if object has the rightmanager
    if (rightsObjects.indexOf(typeOfObject.type) >= 0) {
      this.init(typeOfObject.type,typeOfObject.id);
      console.log("Just created");
      // Open the dialog
      this.rmd.dialog("open");
    }
  };


  function addusers() {
    /* todo: get users from db userlist*/ 
    var selectedusers ="";

    var userDialog = $('' +
            '<div id="addrole-dialog">' +
            '<h3>Users </h3><hr>' +
            '<input type="checkbox" id="joerg"> Joerg </input>' + '<br>' +
            '<input type="checkbox" id="patrick"> Patrick </input>' + '<br>' +
            '<input type="checkbox" id="lisa"> Lisa </input>' + '<br>' +
            '<input type="checkbox" id="vanessa"> Vanessa </input>' + '<br>' +
            '<input type="checkbox" id="mohammad"> Mohammad </input>' + '<br><br>' +
            ' <select id="userlist" name="userlist" size="5" multiple>'+
                '<option>Brice</option>'+
                '<option>Oliver</option>'+
                '<option>Manasa</option>'+
                '<option>Ivan</option>'+
                '<option>Shari</option>'+
                '<option>Steven</option>'+
                '<option>Sharath</option>'+
                '<option>Alejandro</option>'+
                '<option>Nitesh</option>'+
                '<option>Siby</option>'+
            '</select>'
            );

    var userButtons = {
      "Cancel": function() {
        $(this).dialog("close");
      },
      "Add users": function() {

    var checkedUsers = new Array(); // Keep track of the selected users. Needed for a delete server call.
    var checkedSpans = new Array(); // Keep track of the corresponding spans, which display a user

      // No users checked anymore
      checkedSpans.length = 0;
      checkedUsers.length = 0;

      
    
          $('#userlist option:selected').each(function(){
              var span = $("<span style ='margin-right:15px; display:inline-block;'>");
              span.addClass("rmd_users");
              span.html($(this).text());
              span.data("value", $(this).text());
              

              span.on("mouseenter", function(event) {
          if (!span.hasClass("checked"))
            span.data("deleteImg").addClass("visible");
        });

        span.on("mouseleave", function(event) {
          if (!span.hasClass("checked"))
            span.data("deleteImg").removeClass("visible");
        });

        // The whole click magic ;)...
        span.on("click", function(event) {
          var deleteImg = span.data("deleteImg"); // The reference to the delete image.
          var index = checkedSpans.indexOf(span); // The index of the clicked span.

          // Check for multi/single selection
          if (event.ctrlKey) {
            // Multi selection
            if (index >= 0) {
              checkedSpans.splice(index, 1); // Remove the span from the array
              checkedUsers.splice(index, 1); // Remove the user from the array
            } else {
              checkedSpans.push(span); // Add the span to the array
              checkedUsers.push($(this).text()); // Add the user to the array
            }

          } else {
            // Single selection: Uncheck all elements first and then check the current element again..
            checkedSpans.forEach(function(item) {
              item.removeClass("checked");
              item.data("deleteImg").removeClass("visible");
            });
            checkedSpans.length = 0; // Delete all array items.
            checkedSpans.push(span);

            checkedUsers.length = 0; // Delete all array items.
            checkedUsers.push($(this).text());
          }

          span.toggleClass("checked"); // Toggle the span

          // Check if delete buttons are or the delete all button is shown.
          if (span.hasClass("checked") && checkedSpans.length == 1)
            deleteImg.addClass("visible");
          else
            deleteImg.removeClass("visible");

          if (checkedSpans.length > 1) {
            checkedSpans.forEach(function(item) {
              item.data("deleteImg").removeClass("visible");
            });
            
          } else {
            deleteImg.addClass("visible");
            
          }
        });

        var deleteImg = $("<img>");
        deleteImg.attr({
          alt: "Delete",
          src: "/guis.common/images/oxygen/16x16/actions/edit-delete.png"
        });
        deleteImg.on("click", function(event) {
          span.remove();
          // Update the arrays
          var index = checkedSpans.indexOf(span); // The index of the clicked span
          checkedSpans.splice(index, 1); // Remove the span from the array
          checkedUsers.splice(index, 1); // Remove the user from the array

          event.stopPropagation(); // We don't want to fire the span click event. That's why we stop the propagation.
        });

        span.data("deleteImg", deleteImg); // Store the delete image, so it can be used by the span.
        span.append(deleteImg);
              
        $("#selectusers").append(span);
            
              
        });
      }
    };
    var dialog = GUI.dialog(
            "Add Users",
            userDialog, userButtons, 500
    );

  };

};

