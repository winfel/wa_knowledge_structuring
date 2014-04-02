/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var that = this;

  var rm;
  var containerSelected;
  var containerNoneSelected;

  /* Content of rightmanager sidebar*/

  this.init = function() {
    console.log("GUI.rightmanager initialized");

    this.rm = $("#rightmanager");
    this.containerSelected = $('#rightmanager .rightmanagerSelected');
    this.containerNoneSelected = $('#rightmanager .rightmanagerNoneSelected');

    /* Add user event */
    $("#rmNewUserButton").click(function(event) {
      var username = $("#rmNewUserTextfield").val();

      if (username) {
        var selectedObject = ObjectManager.getSelected()[0];

        //Modules.UserManager.addUser("RandomGuys", selectedObject.id, username);
        Modules.UserManager.addUser("RandomGuys", 1, username);
      }
    });

    /* Add role event */
    $("#rmNewRoleButton").click(function(event) {
      var role = $("#rmNewRoleTextfield").val();
      console.log(role);
    });

    /* Initially no object is selected */
    this.containerSelected.hide();

  };

  this.updateContent = function(theObject) {

    /* Display selected object information */

    var selectedObjects = ObjectManager.getSelected();

    /* Depending on how many objects are selected display nothing, only object information or everything */

    /* No object selected */
    if (selectedObjects.length == 0) {
      this.containerSelected.hide();
      this.containerNoneSelected.show();
    }

    /* More than one object selected */
    else if (selectedObjects.length > 1) {
      $("#rm_rolesHead").hide();
      $("#rm_rolesPage").hide();
      $("#rm_rightsHead").hide();
      $("#rm_rightsPage").hide();
      $("#rm_usersHead").hide();
      $("#rm_usersPage").hide();

      $("#rm_ID").empty();
      $("#rm_ID").append("Verschiedene Werte");
      $("#rm_Name").empty();
      $("#rm_Name").append("Verschiedene Werte");
      $("#rm_Type").empty();
      $("#rm_Type").append("Verschiedene Werte");

      this.containerSelected.show();
      this.containerNoneSelected.hide();
    }

    /* Exactly one object selected */
    else {
      $("#rm_rolesHead").show();
      $("#rm_rolesPage").show();
      $("#rm_rightsHead").show();
      $("#rm_rightsPage").show();
      $("#rm_usersHead").show();
      $("#rm_usersPage").show();

      $("#rm_ID").empty();
      $("#rm_ID").append(theObject.id);
      $("#rm_Name").empty();
      $("#rm_Name").append(theObject.getAttribute("name"));
      $("#rm_Type").empty();
      $("#rm_Type").append(theObject.type);


      /* Get Roles of selected object and write the roles into combobox */
      Modules.UserManager.getRoles({id: 1}, GUI.username, function(roles) {
        $("#rm_roles").empty();
        roles.forEach(function(item) {
          $("#rm_roles").append("<div class=\"jDesktopInspector_element\"><input type=\"radio\" value=\"" + item.name + "\" name=\"rm_rolesRadio\">" + item.name + "</div>");
        });
      });

      /* TODO: Get rights */



      /* TODO: Get users */
      var users=["Patrick","Jörg","Vanessa","Mohammad","Lisa","Ivan","Oliver","Shari"];
      $("#rm_users").empty();
      users.forEach(function(item) {
        $("#rm_users").append('<span class="rmSidebarUser">'+item+'</span>');
      });


      this.containerSelected.show();
      this.containerNoneSelected.hide();
    }
  };
};

