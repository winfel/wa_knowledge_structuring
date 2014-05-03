GUI.userdialog = new function() {

  var container = null;
  var friendlist = null;
  var suggested = null;
  var searched = null;
  var inputfield = null;

  var checkedUsers = null; // Keep track of the selected users. Needed for a delete server call.
  var checkedSpans = null; // Keep track of the corresponding spans, which display a user.

  this.init = function() {
    console.log("GUI.userdialog initialized");
    var that = GUI.userdialog;

    // Store important references
    this.container = $("#manageUserDialog");
    this.friendlist = $("#manageUserDialogFriendList");
    this.suggested = $("#manageUserDialogSuggested");
    this.searched = $("#manageUserDialogSearched");
    this.inputfield = $("#manageUserDialogNewTextfield");

    this.inputfield.on("focus", function(event) {
      $(this).val("");
    });

    this.inputfield.on("keyup", function(event) {
      if (event.keyCode == 13) {
        var newUser = $(this).val();

        if (newUser)
          addUserToSection(that, newUser, that.searched, false, true, true);
      }
    });

    // Create the dialog
    this.container.dialog({
      title: "Add Users",
      autoOpen: false,
      modal: true,
      width: 300,
      buttons: [
        {
          text: "Add users",
          click: function() {
            var callback = $(this).data("resultCallback");
            $(this).dialog("close");
            callback(that.checkedUsers);
          }
        },
        {
          text: "Close",
          click: function() {
            $(this).dialog("close");
          }
        }
      ]
    });
  };

  /*
   * 
   * @param {type} callback
   * @returns {undefined}
   */
  this.show = function(callback) {
    var that = GUI.userdialog;

    // Set the content of the dialog
    Modules.RightManager.getAllUsers(function(users) {

      that.checkedUsers = new Array();
      that.checkedSpans = new Array();

      that.friendlist.empty();
      that.suggested.empty();
      that.searched.empty();

      users.forEach(function(user) {
        addUserToSection(that, user.username, that.friendlist, false, true);
      });

      var suggestedDummy = ["hugo", "egon", "fritz", "franz", "josef", "heinz"];
      suggestedDummy.forEach(function(user) {
        addUserToSection(that, user, that.suggested, false, true);
      });

      that.inputfield.autocomplete({source: ["anna", "cindy", "anouk", "marissa", "dummy"]});
    });

    that.container.data("resultCallback", callback);
    that.container.dialog("open");
  };
};

/* 
 * Sidebar: Right Manager
 */
GUI.rightmanager = new function() {
  var rm, rmRoles;
  var rmRightsHead, rmRights;
  var rmUsersHead, rmUsers;
  var btnDeleteUsers;

  var obj = null;
  var objData = null; // It is used...

  var selectedRoleSpan;
  var containerSelected;
  var containerNoneSelected;

  /* Content of rightmanager sidebar*/

  /**
   * 
   * @returns {undefined}
   */
  this.init = function() {
    console.log("GUI.rightmanager initialized");
    var that = this;

    this.rm = $("#rightmanager");
    this.rmRoles = $("#rm_roles");
    this.rmRightsHead = $("#rm_rightsHead");
    this.rmRights = $("#rm_rights");
    this.rmUsersHead = $("#rm_usersHead");
    this.rmUsers = $("#rm_users");
    this.btnDeleteUsers = $("#rmDeleteUsersButton");
    this.selectedRoleSpan = null;
    this.containerSelected = $('#rightmanager .rightmanagerSelected');
    this.containerNoneSelected = $('#rightmanager .rightmanagerNoneSelected');

    /* Add user event */

    $("#rmNewUserButton").click(function(event) {
      var newUser = $("#manageUserDialogNewTextfield").val();

      if (newUser)
        Modules.UserManager.addUser(that.objData, that.selectedRoleSpan.data("role"), newUser);
    });

    var userInput = $("#manageUserDialogNewTextfield");

    userInput.on("keyup", function(event) {
      if (event.keyCode == 13) {
        var newUser = userInput.val();

        if (newUser)
          Modules.UserManager.addUser(that.objData, that.selectedRoleSpan.data("role"), newUser);
      }
    });

    Modules.RightManager.getAllUsers(function(users) {
      // Proof of concept... We need some other solution..
      var logins = [];
      users.forEach(function(user) {
        logins.push(user.username);
      });
      userInput.autocomplete({source: logins});
    });

    /* Add role event */
    $("#rmNewRoleButton").click(function(event) {
      var role = $("#rmNewRoleTextfield").val();
      console.log(role);
    });

    /* Initially no object is selected */
    this.containerSelected.hide();

    // Init the user dialog
    GUI.userdialog.init();
  };

  /**
   * 
   * @param {Array} availableRights   Array of the available rights (as objects)
   * @param {Array} checkedRights     Array of the checked rights (as strings)
   * @returns {undefined}
   */
  this.updateRightsSection = function(availableRights, checkedRights) {
    var that = GUI.rightmanager;

    // Update the rights header
    that.rmRightsHead.html("Rights <span>(" + that.selectedRoleSpan.data("role").name + ")</span>");

    that.rmRights.empty();

    availableRights.forEach(function(right) {
      var inputId = that.rmRights.attr("id") + "_" + right.name;

      var input = $("<input>");
      input.attr({
        id: inputId,
        type: "checkbox",
        class: "rightmanager-right-checkbox",
        value: right.name
      });

      input.on("click", function() {
        var checked = input.prop("checked");
        if (checked)
          Modules.RightManager.grantAccess(right.name, that.objData, that.selectedRoleSpan.data("role"));
        else
          Modules.RightManager.revokeAccess(right.name, that.objData, that.selectedRoleSpan.data("role"));
      });

      if (checkedRights.indexOf(right.name) >= 0)
        input.prop("checked", true);

      var label = $("<label>");
      label.attr({
        for : inputId
      });
      label.html(right.name);

      // Update the rights section
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
    //users=["Patrick","Jörg","Vanessa","Mohammad","Lisa","Ivan","Oliver","Shari"]; // Demo data
    var that = GUI.rightmanager;

    // Update the rights header
    that.rmUsersHead.html("Users <span>(" + that.selectedRoleSpan.data("role").name + ")</span>");
    // Clear the output.
    that.rmUsers.empty();

    var checkedUsers = new Array(); // Keep track of the selected users. Needed for a delete server call.
    var checkedSpans = new Array(); // Keep track of the corresponding spans, which display a user.

    that.btnDeleteUsers.on("click", function() {
      checkedSpans.forEach(function(item) {
        Modules.UserManager.removeUser(that.objData, that.selectedRoleSpan.data("role"), item.data("user"));
        item.remove();
      });

      // No users checked anymore
      checkedSpans.length = 0;
      checkedUsers.length = 0;

      that.btnDeleteUsers.removeClass("visible");
    });

    if (users.length > 0) {
      users.forEach(function(user) {

        // Add a span for every user and make it clickable.
        var span = $("<span>");
        span.addClass("rightmanager-item rightmanager-user");
        span.html(user);
        span.data("user", user);

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
              checkedUsers.push(user); // Add the user to the array
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
            that.btnDeleteUsers.addClass("visible");
          } else if (checkedSpans.length == 1) {
            checkedSpans[0].data("deleteImg").addClass("visible");
            that.btnDeleteUsers.removeClass("visible");
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

          Modules.UserManager.removeUser(that.objData, that.selectedRoleSpan.data("role"), user);

          event.stopPropagation(); // We don't want to fire the span click event. That's why we stop the propagation.
        });

        span.data("deleteImg", deleteImg); // Store the delete image, so it can be used by the span.
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
    var that = GUI.rightmanager;

    that.obj = theObject;
    that.objData = {id: 1, type: theObject.type}; //{id: theObject.id, type: theObject.type};

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

      that.selectedRoleSpan = null;

      /* Get Roles of selected object and write the roles into combobox */
      Modules.UserManager.getRoles(that.objData, GUI.username, function(roles) {
        that.rmRoles.empty();

        roles.forEach(function(role) {
          // Add a span for every user and make it clickable.
          var span = $("<span>");
          span.addClass("rightmanager-item rightmanager-role");
          span.html(role.name);
          span.data("role", role);

          span.on("mouseenter", function(event) {
            if (!span.hasClass("checked"))
              span.data("deleteImg").addClass("visible");
          });

          span.on("mouseleave", function(event) {
            if (!span.hasClass("checked"))
              span.data("deleteImg").removeClass("visible");
          });

          span.on("click", function(event) {
            if (that.selectedRoleSpan == span)
              return;

            if (that.selectedRoleSpan != undefined) {
              that.selectedRoleSpan.removeClass("checked");
              that.selectedRoleSpan.data("deleteImg").removeClass("visible");
            }
            that.selectedRoleSpan = span;
            span.addClass("checked");
            span.data("deleteImg").addClass("visible");

            // Update the other sections
            // Get rights depending on the selected role...
            Modules.RightManager.getRights(that.objData, role, GUI.username, that.updateRightsSection);
            // Get users depending on the selected role...
            Modules.UserManager.getUsers(that.objData, role, GUI.username, that.updateUsersSection);
          });

          var deleteImg = $("<img>");
          deleteImg.attr("alt", "Delete");
          deleteImg.attr("src", "/guis.common/images/oxygen/16x16/actions/edit-delete.png");
          deleteImg.on("click", function(event) {
            span.remove();

            Modules.UserManager.removeRole(that.objData, role);

            // We don't want to fire the span click event. That's why we stop the propagation.
            event.stopPropagation();
          });
          span.data("deleteImg", deleteImg); // Store the delete image, so it can be used by the span.
          span.append(deleteImg);

          that.rmRoles.append(span);

          // Initially
          if (!that.selectedRoleSpan) {
            that.selectedRoleSpan = span;
            that.selectedRoleSpan.addClass("checked");
            that.selectedRoleSpan.data("deleteImg").addClass("visible");
          }
        });

        // Initially
        // 
        // Get rights depending on the selected role...
        Modules.RightManager.getRights(that.objData, that.selectedRoleSpan.data("role"), GUI.username, that.updateRightsSection);
        // Get users depending on the selected role...
        Modules.UserManager.getUsers(that.objData, that.selectedRoleSpan.data("role"), GUI.username, that.updateUsersSection);
      });

      this.containerSelected.show();
      this.containerNoneSelected.hide();
    }
  };
};

/**
 * Adds a user to a section.
 * 
 * @param {type} that           The reference to GUI.rightmanager, GUI.rightmanagerDialog or GUI.userdialog.
 *                              The variables checkedSpans, checkedUsers and objData are needed.
 * @param {type} user           The user to add
 * @param {type} sectionUsers   The section where to add the users to
 * @param {type} withDelete     With or without delete button. If that.objData is not set, withDelete is set to false.
 * @returns {undefined}
 */
function addUserToSection(that, user, sectionUsers, withDelete, forceMulti, checkedInitially) {
  if (!that.objData)
    withDelete = false;

  // Add a span for every user and make it clickable.
  var span = $("<span>");
  span.addClass("rightmanager-item rightmanager-user");
  if (withDelete)
    span.addClass("show-delete-img");

  span.html(user);
  span.data("value", user);

  span.on("mouseenter", function(event) {
    if (!span.hasClass("checked") && withDelete)
      span.data("deleteImg").addClass("visible");
  });

  span.on("mouseleave", function(event) {
    if (!span.hasClass("checked") && withDelete)
      span.data("deleteImg").removeClass("visible");
  });

  // The whole click magic ;)...
  span.on("click", function(event) {
    var index = that.checkedSpans.indexOf(span); // The index of the clicked span.

    // Check for multi/single selection
    if (event.ctrlKey || forceMulti) {
      // Multi selection
      if (index >= 0) {
        that.checkedSpans.splice(index, 1); // Remove the span from the array
        that.checkedUsers.splice(index, 1); // Remove the user from the array
      } else {
        that.checkedSpans.push(span); // Add the span to the array
        that.checkedUsers.push(user); // Add the user to the array
      }

    } else {
      // Single selection: Uncheck all elements first and then check the current element again..
      that.checkedSpans.forEach(function(item) {
        item.removeClass("checked");
        if (withDelete)
          item.data("deleteImg").removeClass("visible");
      });
      that.checkedSpans.length = 0; // Delete all array items.
      that.checkedSpans.push(span);

      that.checkedUsers.length = 0; // Delete all array items.
      that.checkedUsers.push(user);
    }

    span.toggleClass("checked"); // Toggle the span

    if (withDelete) {
      var deleteImg = span.data("deleteImg"); // The reference to the delete image.

      // Check if delete buttons are or the delete all button is shown.
      if (span.hasClass("checked") && that.checkedSpans.length == 1)
        deleteImg.addClass("visible");
      else
        deleteImg.removeClass("visible");

      if (that.checkedSpans.length > 1) {
        that.checkedSpans.forEach(function(item) {
          item.data("deleteImg").removeClass("visible");
        });
        // that.btnDeleteUsers.addClass("visible");
      } else if (that.checkedSpans.length == 1) {
        that.checkedSpans[0].data("deleteImg").addClass("visible");
        // that.btnDeleteUsers.removeClass("visible");
      }
    }
  });

  if (checkedInitially)
    span.click();

  if (withDelete) {
    // Setup the delete button if objData is available.
    var deleteImg = $("<img>");
    deleteImg.attr({
      alt: "Delete",
      src: "/guis.common/images/oxygen/16x16/actions/edit-delete.png"
    });
    deleteImg.on("click", function(event) {
      span.remove();
      // Update the arrays
      var index = that.checkedSpans.indexOf(span); // The index of the clicked span
      that.checkedSpans.splice(index, 1); // Remove the span from the array
      that.checkedUsers.splice(index, 1); // Remove the user from the array

      Modules.UserManager.removeUser(that.objData, role, user);

      event.stopPropagation(); // We don't want to fire the span click event. That's why we stop the propagation.
    });

    span.data("deleteImg", deleteImg); // Store the delete image, so it can be used by the span.
    span.append(deleteImg);
  }

  // Finally add it to the user section
  sectionUsers.append(span);
}