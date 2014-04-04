/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var rm, rmRoles, rmRights, rmUsers;
  var containerSelected;
  var containerNoneSelected;

  /* Content of rightmanager sidebar*/

  this.init = function() {
    var that = this;

    console.log("GUI.rightmanager initialized");

    this.rm = $("#rightmanager");
    this.rmRoles = $("#rm_roles");
    this.rmRights = $("#rm_rights");
    this.rmUsers = $("#rm_users");
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
    var that = this;

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

      Modules.RightManager.getRights({id: 1, type: "PaperObject"}, "RandomGuys", GUI.username, function(rights) {
        // Clear it...
        console.log("RIGHTS: ");
        console.log(rights);

        that.rmRights.empty();

        rights.availableRights.forEach(function(right) {
          var inputId = that.rmRights.attr("id") + "_" + right.name;

          var input = $("<input>");
          input.attr({
            id: inputId,
            type: "checkbox",
            value: right.name
          });

          if (rights.checkedRights.indexOf(right.name) >= 0)
            input.attr("checked", "checked");

          var label = $("<label>");
          label.attr({
            for : inputId
          });
          label.html(right.name);

          that.rmRights.append(input);
          that.rmRights.append(label);
          that.rmRights.append("<br>");
        });
      });


      /* TODO: Get users */
      Modules.UserManager.getUsers("RandomGuys", {id: 1}, GUI.username, function(result) {
        //result=["Patrick","Jörg","Vanessa","Mohammad","Lisa","Ivan","Oliver","Shari"]; // Demo data

        $("#rm_users").empty();

        if (result.length > 0) {
          result.forEach(function(user) {

            // Add a span for every user and make it clickable.
            var span = $("<span>");
            span.addClass("rmSidebarUser");
            span.html(user);
            span.on("click", function(event) {
              //if (event.ctrlKey)
              span.toggleClass("checked");
            });

            var deleteImg = $("<img>");
            deleteImg.attr("alt", "Delete");
            deleteImg.attr("src", "/guis.common/images/oxygen/16x16/actions/edit-delete.png");
            deleteImg.on("click", function(event) {
              span.remove();
              console.log("Don't worry, " + user + " is not deleted yet. He just disappeared from the html document :).");
              // We don't want to fire the span click event. That's why we stop the propagation.
              event.stopPropagation();
            });
            span.append(deleteImg);

            // Finally add it to the user section
            $("#rm_users").append(span);
          });
        } else {
          // No user found => show a corresponding message.
          var span = $("<span>");
          span.html("No users found");
          $("#rm_users").append(span);
        }
      });

      this.containerSelected.show();
      this.containerNoneSelected.hide();
    }
  };
};

