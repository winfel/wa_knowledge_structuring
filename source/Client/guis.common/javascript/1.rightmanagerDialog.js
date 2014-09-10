/* 
 * Right Manager Dialog
 */
GUI.rightmanagerDialog = new function() {
  var that = this;
  var currentObject;
  var dialog;
  var tabs;
  var roleTabIndex = {};

  /*
   * Initializes the right manager dialog.
   * 
   * @returns {undefined}
   */
  this.init = function() {
    // Listen for changes to some user.
    RightManager.listen("userchange", function(data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        that.modifyUserElement(data.user, data.role, data.add);
      }
    });

    // Listen for changes to some rights.
    RightManager.listen("rightchange", function(data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        that.modifyRightElement(data.right, data.role, data.grant);
      }
    });

    // Listen for changes to some roles.
    RightManager.listen("rolechange", function(data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        that.modifyRoleTab(data.role, data.add);
      }
    });
  };

  /*
   * 
   * @param {type} typeOfObject
   * @returns {undefined}
   */
  this.show = function(theObject) {
    if (theObject) {
      currentObject = theObject;
    } else {
      var selectedObjects = ObjectManager.getSelected();
      if (selectedObjects.length > 0) {
        if (selectedObjects.length == 1) {
          currentObject = selectedObjects[0];
        } else {
          currentObject = false;
        }
      } else {
        // ObjectManager.currentRoom["left"] did not return the current room...
        currentObject = {id: ObjectManager.currentRoomID["left"], type: "Room"};
      }
    }

    // Check whether this object is supposed to have a right manager dialog or not.
    if (Modules.RightManager.supports(currentObject)) {
      this.updateContent();
    }
  };

  /**
   * 
   * @returns {undefined}
   */
  this.updateContent = function() {
    dialog = $("<div>");
    dialog.attr({
      title: GUI.translate("Right Manager"),
      'class': "rightmanagerDialog"
    });
    dialog.html('<div class="rightmanagerDialogTabs"><ul></ul></div>');

    // Reset the index.
    roleTabIndex = {};

    tabs = dialog.find(".rightmanagerDialogTabs").tabs({
      add: function(event, ui) {
        var rolename = $(ui.tab).find("span").text().trim();
        if (rolename != "") {
          roleTabIndex[rolename] = ui.index;
        }
      },
      select: function(event, ui) {
        if ($(ui.tab).attr("href").contains("new_role")) {
          // Do not select the new role tab...
          return false;
        }
      }
    });

    dialog.dialog({
      resizable: true,
      width: 600,
      modal: true,
      buttons: [
        {
          text: "Add user",
          click: function() {
            $(this).dialog("close");
            $(this).remove();
          }
        },
        {
          text: "Load default",
          click: function() {
            $(this).dialog("close");
            $(this).remove();
          }
        },
        {
          text: "Done",
          click: function() {
            $(this).dialog("close");
            $(this).remove();
          }
        },
        {
          text: "Close",
          click: function() {
            $(this).dialog("close");
            $(this).remove();
          }
        }
      ],
      open: function() {
        // Load missing users when the dialog opens.
        var dialog = $(this);

        RightManager.getRoles(currentObject, function(roles) {
          // Creating an add role tab.
          that.addNewRoleTab();
          // Create a tab for each role.
          for (var i = 0; i < roles.length; i++) {
            that.modifyRoleTab(roles[i], true);
          }
          // Make sure that the first tab is selected.
          tabs.tabs("select", 0);
        });
      }
    });

  };

  /**
   * 
   * @returns {undefined}
   */
  this.addNewRoleTab = function() {
    var tabId = "#rightmanagerDialog_" + currentObject.id + "_new_role";
    tabs.tabs("add", tabId, '<input class="rightmanagerDialogNewRoleTxt" placeholder="' + GUI.translate("Rolename") + '" type="text">'
            + '<img class="btn btn-new-role" src="/guis.common/images/oxygen/16x16/actions/list-add.png" alt="Add">'
            + '<img class="btn btn-save-role" style="display: none;" src="/guis.common/images/oxygen/16x16/actions/document-save.png" alt="Save">'
            + '<img class="btn btn-cancel" style="display: none;" src="/guis.common/images/oxygen/16x16/actions/dialog-cancel.png" alt="Cancel">');

    var tabHeader = $("a[href='" + tabId + "']").parent("li");
    //var tabContent = $(tabId);

    var input = tabHeader.find("input").hide();

    // Do the animation stuff
    tabHeader.find(".btn").click(function() {
      tabHeader.find(".btn").toggle();
      input.animate({width: 'toggle'});
    });

    tabHeader.find(".btn-new-role").click(function() {
      input.focus();
    });

    tabHeader.find(".btn-save-role").click(function() {
      var rolename = input.val().trim();
      if (rolename != "") {
        RightManager.modifyRole(currentObject, rolename, true);
      }
      input.val("");
    });

    tabHeader.find(".btn-cancel").click(function() {
      input.val("");
    });
  };

  /**
   * 
   * @param {type} role
   * @param {type} add
   * @returns {undefined}
   */
  this.modifyRoleTab = function(role, add) {
    var tabId = "#rightmanagerDialog_role_" + currentObject.id + "_" + role.name;

    if (add) {
      // Create the new tab
      tabs.tabs("add", tabId, role.name, tabs.tabs("length") - 1);

      var tabHeader = $("a[href='" + tabId + "']").parent("li");
      var tabContent = $(tabId);

      // Add a remove button to header...
      if (role.deletable) {
        var btnRemoveRole = $("<input>");
        btnRemoveRole.attr({
          'type': "image",
          'class': "btn btn-remove-role",
          title: GUI.translate("Remove this role"),
          src: "/guis.common/images/oxygen/16x16/actions/list-remove.png"
        });
        btnRemoveRole.click(function() {
          // Remove 
          var title = GUI.translate("Removing a role");
          var text = GUI.translate("You are about to remove the role '[ROLE]'.");
          text = text.replace("[ROLE]", role.name);

          confirmDialog(title, text, function() {
            RightManager.modifyRole(currentObject, role.name, false);
            // We do not remove the element here, since we will send a
            // broadcast message to all other managers. Include the user
            // who triggered this action.
          });
        });
        tabHeader.append(btnRemoveRole);
      }

      var userArea = $("<div>").attr("class", "rightmanagerDialogUserArea");
      tabContent.append('<div class="jDesktopInspector_pageHead rightmanagerDialogUserHead">' + GUI.translate("Users") + '</div>');
      tabContent.append(userArea);

      var rightArea = $("<div>").attr("class", "rightmanagerDialogRightArea");
      tabContent.append('<div class="jDesktopInspector_pageHead rightmanagerDialogRightHead">' + GUI.translate("Rights") + '</div>');
      tabContent.append(rightArea);

      // Create an add user button
      var btnAddUser = $("<input>");
      btnAddUser.attr({
        'type': "image",
        'class': "btn btn-add-user",
        title: GUI.translate("Add a user to this role"),
        src: "/guis.common/images/oxygen/16x16/actions/list-add.png"
      });
      btnAddUser.click(function() {
        GUI.userdialog.show(currentObject, role, function(usersToAdd) {
          for (var i = 0; i < usersToAdd.length; i++) {
            RightManager.addUser(currentObject, usersToAdd[i], role);
          }
        });
      });

      tabContent.find(".rightmanagerDialogUserHead").append(btnAddUser);

      // Create user elements
      for (var i in role.users) {
        this.modifyUserElement(role.users[i], role, true, userArea);
      }

      // Create right elements
      var rights = RightManager.getAvailableRights(currentObject);
      for (var i in rights) {
        this.createRightElement(rights[i], role, rightArea);
      }

    } else {
      // Remove the role's tab.
      tabs.tabs("remove", roleTabIndex[role.name]);
    }
  };

  /**
   * 
   * @param {type} user
   * @param {type} role
   * @param {type} add
   * @param {type} userArea
   * @returns {undefined}
   */
  this.modifyUserElement = function(user, role, add, userArea) {
    var elemId = "rightmanagerDialog_user_" + currentObject.id + "_" + role.name + "_" + user;

    if (add) {
      if (!userArea) {
        userArea = $("#rightmanagerDialog_role_" + currentObject.id + "_" + role.name).find(".rightmanagerDialogUserArea");
      }

      var container = $("<div>").attr("id", elemId);
      container.addClass("rightmanagerDialogUserItem");
      container.append(user);
      container.append('<input type="image" class="btn btn-remove-user" title="' + GUI.translate("Remove this user from this role") + '" src="/guis.common/images/oxygen/16x16/actions/list-remove.png">');

      container.find("input").click(function() {
        var title = GUI.translate("Removing a user from a role");
        var text = GUI.translate("You are about to remove '[USER]' from the role '[ROLE]'.");
        text = text.replace("[USER]", user).replace("[ROLE]", role.name);

        confirmDialog(title, text, function() {
          RightManager.removeUser(currentObject, user, role);
          // We do not remove the element here, since we will send a broadcast message to all other managers.
        });
      });

      userArea.append(container);
    } else {
      $("#" + elemId).remove();
    }
  };

  /**
   * 
   * @param {type} right
   * @param {type} role
   * @param {type} rightArea
   * @returns {undefined}
   */
  this.createRightElement = function(right, role, rightArea) {
    var elemId = "rightmanagerDialog_right_" + currentObject.id + "_" + role.name + "_" + right.name;

    var container = $("<div>");
    container.html('<label title="' + right.comment + '" for="' + elemId + '">' + right.name + '</label>'
            + '<input type="checkbox" id="' + elemId + '">'
            + '<label class="rightDescription" for="' + elemId + '">' + right.comment + '</label>');

    container.find("input").prop("checked", role.rights.indexOf(right.name) >= 0).change(function() {
      var value = $(this).prop("checked");
      RightManager.modifyAccess(currentObject, right, role, value);
    });


    if (!role.deletable) {
      // If not deletable those rights cannot be modified as well...
      container.find("input").prop("disabled", true);
    }

    rightArea.append(container);
  };


  /**
   * Updates the checkbox value of a right element.
   * 
   * @function modifyRightElement
   * @param {type} right
   * @param {type} role
   * @param {type} grant
   * @returns {undefined}
   */
  this.modifyRightElement = function(right, role, grant) {
    var elemId = "rightmanagerDialog_right_" + currentObject.id + "_" + role.name + "_" + right.name;
    $("#" + elemId).prop("checked", grant);
  };
};

