/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var rm, rmRoles, rmRights, rmUsers;
  var containerSelected;
  var containerNoneSelected;
  var DEBUG = false;

  /* Content of rightmanager sidebar*/

  /**
   * 
   * @returns {undefined}
   */
  this.init = function() {
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
        Modules.UserManager.addUser({id: 1}, "RandomGuys", username);
      }
    });

    /* Add role event */
    $("#rmNewRoleButton").click(function(event) {
      var role = $("#rmNewRoleTextfield").val();
      if (DEBUG) {console.log(role);}
    });

    /* Initially no object is selected */
    this.containerSelected.hide();

  };

  /**
   * 
   * @param {Array} availableRights   Array of the available rights (as objects)
   * @param {Array} checkedRights     Array of the checked rights (as strings)
   * @returns {undefined}
   */
  this.updateRightsSection = function(availableRights, checkedRights) {
    var that = GUI.rightmanager;

    if (DEBUG) {console.log("rm: Updating right section");}
    if (DEBUG) {console.log(availableRights);}
   if (DEBUG) { console.log(checkedRights);}

    that.rmRights.empty();

    availableRights.forEach(function(right) {
      var inputId = that.rmRights.attr("id") + "_" + right.name;

      var input = $("<input>");
      input.attr({
        id: inputId,
        type: "checkbox",
        value: right.name
      });

      if (checkedRights.indexOf(right.name) >= 0)
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
  };

  /**
   * 
   * @param {type} users
   * @returns {undefined}
   */
  this.updateUsersSection = function(users) {
    //result=["Patrick","Jörg","Vanessa","Mohammad","Lisa","Ivan","Oliver","Shari"]; // Demo data
    var that = GUI.rightmanager;
    that.rmUsers.empty(); // Clear the output.

    var checkedSpans = new Array();
    var checkedUsers = new Array();

    var btnDeleteUsers = $("#rmDeleteUsersButton");
    btnDeleteUsers.on("click", function() {
      checkedSpans.forEach(function(item) {
        item.remove();
      });
    });

    if (users.length > 0) {
      users.forEach(function(user) {

        // Add a span for every user and make it clickable.
        var span = $("<span>");
        span.addClass("rmSidebarUser");
        span.html(user);
        span.data("value", user);

        span.on("mouseenter", function(event) {
          if (!span.hasClass("checked"))
            span.data("deleteImg").addClass("visible");
        });

        span.on("mouseleave", function(event) {
          if (!span.hasClass("checked"))
            span.data("deleteImg").removeClass("visible");
        });

        span.on("click", function(event) {
          var deleteImg = span.data("deleteImg"); // The reference to the delete image.
          var index = checkedSpans.indexOf(span); // The index of the clicked span

          // Check for multi/single selection
          if (event.ctrlKey) {
            // Multi selection
            if (index >= 0) {
              checkedSpans.splice(index, 1); // Remove the span from the array
              checkedUsers.splice(index, 1); // Remove the user from the array
            } else {
              checkedSpans.push(span); // Add the span to the array
              checkedUsers.push(user); // Add the user to the array
            }
            if (checkedSpans.length == 1)
              checkedSpans[0].data("deleteImg").addClass("visible");
          } else {
            // Single selection: Uncheck all other elements
            // Do not remove the class checked from the current span. It will be toggled later anyway...
            checkedSpans.forEach(function(item) {
              if (item && item.data("deleteImg") && item != span) {
                item.removeClass("checked");
                item.data("deleteImg").removeClass("visible");
              }
            });
            checkedSpans.length = 0; // Delete all array items.
            checkedSpans.push(span);

            checkedUsers.length = 0; // Delete all array items.
            checkedUsers.push(user);
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
            btnDeleteUsers.addClass("visible");
          } else {
            deleteImg.addClass("visible");
            btnDeleteUsers.removeClass("visible");
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

          if (DEBUG) {console.log("Don't worry, " + user + " is not deleted yet. He/She just disappeared from the html document :).");}
          event.stopPropagation(); // We don't want to fire the span click event. That's why we stop the propagation.
        });

        span.data("deleteImg", deleteImg);
        span.append(deleteImg);

        // Finally add it to the user section
        that.rmUsers.append(span);
      });
    } else {
      // No user found => show a corresponding message.
      var span = $("<span>");
      span.html("No users found");
      that.rmUsers.append(span);
    }
  };

  /**
   * 
   * @param {type} theObject
   * @returns {undefined}
   */
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

      $("#rm_ID").html("Verschiedene Werte");
      $("#rm_Name").html("Verschiedene Werte");
      $("#rm_Type").html("Verschiedene Werte");

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

      $("#rm_ID").html(theObject.id);
      $("#rm_Name").html(theObject.getAttribute("name"));
      $("#rm_Type").html(theObject.type);

      /* Get Roles of selected object and write the roles into combobox */
      Modules.UserManager.getRoles({id: 1}, GUI.username, function(roles) {
        that.rmRoles.empty();

        var selectedSpan = null;

        roles.forEach(function(role) {
          //$("#rm_roles").append("<div class=\"jDesktopInspector_element\"><input type=\"radio\" value=\"" + item.name + "\" name=\"rm_rolesRadio\">" + item.name + "</div>");

          // Add a span for every user and make it clickable.
          var span = $("<span>");
          span.addClass("rmSidebarRole");
          span.html(role.name);
          span.data("value", role.name);
          span.on("click", function(event) {
            selectedSpan.removeClass("checked");
            selectedSpan = span;
            span.addClass("checked");

            // Update the other sections
            // Get rights depending on the selected role...
            Modules.RightManager.getRights({id: 1, type: "PaperObject"}, role.name, GUI.username, that.updateRightsSection);
            // Get users depending on the selected role...
            Modules.UserManager.getUsers({id: 1}, role.name, GUI.username, that.updateUsersSection);
          });

          if (!selectedSpan) {
            selectedSpan = span;
            selectedSpan.addClass("checked");
          }

          var deleteImg = $("<img>");
          deleteImg.attr("alt", "Delete");
          deleteImg.attr("src", "/guis.common/images/oxygen/16x16/actions/edit-delete.png");
          deleteImg.on("click", function(event) {
            span.remove();
            if (DEBUG) {console.log("Don't worry, the role '" + role.name + "' is not deleted yet. She just disappeared from the html document :).");}
            // We don't want to fire the span click event. That's why we stop the propagation.
            event.stopPropagation();
          });
          span.append(deleteImg);

          that.rmRoles.append(span);
        });

        // Initially
        // 
        // Get rights depending on the selected role...
        Modules.RightManager.getRights({id: 1, type: "PaperObject"}, selectedSpan.data("value"), GUI.username, that.updateRightsSection);
        // Get users depending on the selected role...
        Modules.UserManager.getUsers({id: 1}, selectedSpan.data("value"), GUI.username, that.updateUsersSection);
      });

      this.containerSelected.show();
      this.containerNoneSelected.hide();
    }
  };
};

