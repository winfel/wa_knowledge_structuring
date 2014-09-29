/**
 * Right manager sidebar object.
 * 
 */
GUI.rightmanager = new function () {
  var that = this;
  var rightmanagerArea;
  var inspectorArea;
  var inspector;
  var currentObject;

  var roles;

  /**
   * Initializes the user interface of the right manager in the sidebar.
   * 
   * @function init
   * @returns {undefined}
   */
  this.init = function () {
    // Some important variables
    rightmanagerArea = $("#rightmanager");

    var objectArea = $("<div>");
    objectArea.addClass("jDesktopInspector_main");
    objectArea.html('<div class="jDesktopInspector_page object-area"></div>');
    rightmanagerArea.append(objectArea);

    var bottomArea = $("<div>");
    bottomArea.attr("class", "jDesktopInspector_main");
    bottomArea.html('<div class="jDesktopInspector_page rightmanager-bottom">'
            + '<input type="text" class="ui-textfield new-role-textfield" placeholder="New Role">'
            + '<input type="image" class="btn btn-new-role" title="' + GUI.translate("Create a new role for this object") + '" src="/guis.common/images/oxygen/22x22/actions/list-add.png">'
            + '<input type="image" class="btn btn-save-role" title="' + GUI.translate("Save the new role for this object") + '" src="/guis.common/images/oxygen/22x22/actions/document-save.png">'
            + '<input type="image" class="btn btn-cancel" title="' + GUI.translate("Cancel") + '" src="/guis.common/images/oxygen/22x22/actions/dialog-cancel.png">'
            + '<div class="rightmanagerMessageBox"></div></div>');
    rightmanagerArea.append(bottomArea);

    var input = bottomArea.find("input.new-role-textfield");

    var saveRole = function () {
      var role = input.val().trim();
      if (role != "") {
        RightManager.modifyRole(currentObject, role, true);
      }
      input.val("");
    };

    var toggleButtons = function () {
      bottomArea.find(".btn").toggle();
      input.animate({width: 'toggle'});
    };

    // On enter save the role.
    input.keypress(function (e) {
      if (e.which == 13) {
        toggleButtons();
        saveRole();
      }
    });

    // Add an add user button
    bottomArea.find(".btn").click(toggleButtons);

    bottomArea.find(".btn-save-role").click(saveRole);

    bottomArea.find(".btn-new-role").click(function () {
      input.focus();
    });

    bottomArea.find(".btn-cancel").click(function () {
      input.val("");
    });

    inspectorArea = $("<div>");
    rightmanagerArea.append(inspectorArea);

    inspectorArea.jDesktopInspector();
    inspector = inspectorArea.data("jDesktopInspector");

    // Listen for changes to some user.
    RightManager.listen("userchange", function (data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        that.modifyUserElement(data.user, data.role, data.add);
      }
    });

    // Listen for changes to some rights.
    RightManager.listen("rightchange", function (data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        that.modifyRightElement(data.right, data.role, data.grant);
      }
    });

    // Listen for changes to some roles.
    RightManager.listen("rolechange", function (data) {
      if (currentObject.id == data.object.id) {
        // Update the section only if the object id is the same.
        if (!data.role.error) {
          that.modifyRoleSection(data.role, data.add);
        } else {
        }
      }
    });

    RightManager.listen("onerror", function (error) {


      that.updateMessageBox(error.type, error.message, error.placeholderData, error.hide);
    });
  };

  /**
   * Replaces placeholder strings, like [ROLE] or [RIGHT], with it's proper values.
   * @function replacePlaceholder
   * @param {String} str
   * @param {Object} mapObj
   */
  this.replacePlaceholder = function (str, mapObj) {
    var re = new RegExp(Object.keys(mapObj).join("|"), "g");
    return str.replace(re, function (matched) {
      return mapObj[matched];
    });
  };

  /**
   * Updates the message box container.
   * 
   * @function updateMessageBox
   * @param {String}  type            The type of this message.
   * @param {String}  message         The message.
   * @param {Object}  mapPlaceholder  The object with placesholders.
   * @param {Boolean} hide            Indicates if the message should disappear automatically.
   */
  this.updateMessageBox = function (type, message, mapPlaceholder, hide) {
    var messageBox = rightmanagerArea.find(".rightmanagerMessageBox");
    if (type)
      messageBox.addClass(type);
    if (mapPlaceholder)
      messageBox.html(this.replacePlaceholder(GUI.translate(message), mapPlaceholder));
    else
      messageBox.html(GUI.translate(message));
    messageBox.slideDown();
    // Hide the warning after 6 seconds...
    if (hide) {
      setTimeout(this.hideMessageBox, 6000);
    }
  };

  /**
   * Hides the message box
   * @function hideMessageBox
   * @param {Boolean} immediate   
   */
  this.hideMessageBox = function (immediate) {
    var messageBox = rightmanagerArea.find(".rightmanagerMessageBox");
    if (immediate) {
      messageBox.attr("class", "rightmanagerMessageBox");
      messageBox.html("");
      messageBox.hide();
    } else {
      messageBox.slideUp();
      setTimeout(function () {
        messageBox.attr("class", "rightmanagerMessageBox");
        messageBox.html("");
        messageBox.hide();
      }, 400);
    }
  };

  /**
   * Modifies a user element in the users section.
   * 
   * @function modifyUserElement
   * @param {String}    user          
   * @param {Object}    role
   * @param {Boolean}   add
   * @param {DOMObject} sectionUsers
   * @param {DOMObject} rolePage
   * @returns {undefined}
   */
  this.modifyUserElement = function (user, role, add, sectionUsers, rolePage) {
    var elemId = "rightmanagerSidebar_user_" + currentObject.id + "_" + role.name + "_" + user;

    if (add) {
      // Make sure page and section exist...
      if (!rolePage || !sectionUsers) {
        rolePage = $(".jDesktopInspector_pageHead:contains(" + role.name + ")", rightmanagerArea).next();
        sectionUsers = rolePage.find(".jDesktopInspector_section").first();
      }

      // Add a user to the list
      var element;
      if (sectionUsers.addElement)
        element = sectionUsers.addElement(user);
      else
        element = inspector.addElement(sectionUsers, user, rolePage);

      var elementDOM = element.getDOM();

      $(elementDOM)
              .attr("id", elemId)
              .addClass("user-item")
              .append('<input type="image" class="btn btn-remove-user" title="' + GUI.translate("Remove this user from this role") + '" src="/guis.common/images/oxygen/16x16/actions/list-remove.png">');

      $(elementDOM).find("input").click(function () {
        var title = GUI.translate("Removing a user from a role");
        var text = GUI.translate("You are about to remove '[USER]' from the role '[ROLE]'.");
        text = text.replace("[USER]", user).replace("[ROLE]", role.name);

        confirmDialog(title, text, function () {
          RightManager.removeUser(currentObject, user, role);
          // We do not remove the element here, since we will send a broadcast message to all other managers.
        });
      });
    } else {
      // Remove the user from the list...
      $("#" + elemId).remove();
    }
  };

  /**
   * Creates a right element in the rights section.
   * 
   * @function createRightElement
   * @param {type} right
   * @param {type} role
   * @param {type} sectionRights
   * @returns {undefined}
   */
  this.createRightElement = function (right, role, sectionRights) {
    var elemId = "rightmanagerSidebar_right_" + currentObject.id + "_" + role.name + "_" + right.name;

    var element = sectionRights.addElement(right.name);
    var elementDOM = element.getDOM();

    var widget = element.addWidget("boolean");
    var checked = role.rights.indexOf(right.name) >= 0;
    // Initial value
    widget.setValue(checked);

    $(elementDOM).attr({id: elemId, title: right.comment});

    if (role.deletable || (!checked && role.name.toLowerCase() == "manager")) {
      $(elementDOM)
              .addClass("cursor-pointer")
              .on("click", function (event) {
                // Update the widget if the element div (not input) is clicked.
                if (event.target != $(elementDOM).find("input")[0]) {
                  widget.setValue(!widget.getValue());
                }

                RightManager.modifyAccess(currentObject, right, role, widget.getValue());
              });
    } else {
      // If not deletable those rights cannot be modified as well...
      $("#" + elemId).find("input").prop("disabled", true);
    }
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
  this.modifyRightElement = function (right, role, grant) {
    var elemId = "rightmanagerSidebar_right_" + currentObject.id + "_" + role.name + "_" + right.name;
    var elem = $("#" + elemId).find("input").prop("checked", grant);
    // Disable the manager role again, once the was added.
    if (role.name.toLowerCase() == "manager")
      elem.prop("disabled", true);
  };

  /**
   * Creates a section for a role in the sidebar.
   * 
   * @function modifyRoleSection
   * @param role  
   * @param add
   * @returns {undefined}
   */
  this.modifyRoleSection = function (role, add) {
    var that = this;
    var elemId = "rightmanagerSidebar_role_" + currentObject.id + "_" + role.name;

    if (add) {
      var rights = RightManager.getAvailableRights(currentObject);
      // A new jQueryInspector page...
      var page = inspector.addPage(role.name);

      // Add an arrow that indicates whether the section is opened or not.
      var spanArrow = $("<span>");
      spanArrow.addClass("ui-accordion-header-icon ui-icon ui-icon-triangle-1-e");

      var pageHead = $(page.getDOM(true));
      pageHead.prepend(spanArrow).attr("id", elemId);

      // Create a remove role button
      if (role.deletable) {
        var btnRemoveRole = $("<input>");
        btnRemoveRole.attr({
          'type': "image",
          'class': "btn btn-remove-role",
          title: GUI.translate("Remove this role"),
          src: "/guis.common/images/oxygen/16x16/actions/list-remove.png"
        });
        btnRemoveRole.click(function () {
          // Remove 
          var title = GUI.translate("Removing a role");
          var text = GUI.translate("You are about to remove the role '[ROLE]'.");
          text = text.replace("[ROLE]", role.name);

          confirmDialog(title, text, function () {
            RightManager.modifyRole(currentObject, role.name, false);
            // We do not remove the element here, since we will send a
            // broadcast message to all other managers. Include the user
            // who triggered this action.
          });
        });
        pageHead.append(btnRemoveRole);
      }

      // Create an add user button
      var btnAddUser = $("<input>");
      btnAddUser.attr({
        'type': "image",
        'class': "btn btn-add-user",
        title: GUI.translate("Add a user to this role"),
        src: "/guis.common/images/oxygen/16x16/actions/list-add.png"
      });
      btnAddUser.click(function () {
        GUI.userdialog.show(currentObject, role, function (usersToAdd) {
          for (var i = 0; i < usersToAdd.length; i++) {
            RightManager.addUser(currentObject, usersToAdd[i], role);
          }
        });
      });

      // Create a user section
      var sectionUsers = page.addSection(GUI.translate("Users"));
      // Add an add button to the title of this section
      pageHead.next().find(".jDesktopInspector_section_title").append(btnAddUser);

      for (var i in role.users) {
        this.modifyUserElement(role.users[i], role, true, sectionUsers, page);
      }

      var sectionRights = page.addSection(GUI.translate("Rights"));
      for (var i in rights) {
        this.createRightElement(rights[i], role, sectionRights);
      }

      that.resetAccordion();
    }
    else {
      var pageObjectToRemove = $("#" + elemId).first();
      // Remove the page
      pageObjectToRemove.next().remove();
      // Remove the page head
      pageObjectToRemove.remove();
    }
  };

  /**
   * Resets the accordion animation.
   * @function resetAccordion
   */
  this.resetAccordion = function () {
    // Initially it is open...
    inspectorArea.find('.jDesktopInspector_pageHead').first().find("span").addClass("ui-icon-triangle-1-s");

    // Accordion without jQuery
    inspectorArea.find('.jDesktopInspector_pageHead').off("click").on("click", function (event) {
      if (!$(event.target).hasClass("btn")) {
        //Expand or collapse this panel
        $(this).next().slideToggle('fast');
        $(this).find("span").toggleClass("ui-icon-triangle-1-s");
        //Hide the other panels
        inspectorArea.find(".jDesktopInspector_pageHead").not(this).find("span").removeClass("ui-icon-triangle-1-s");
        inspectorArea.find(".jDesktopInspector_page").not($(this).next()).slideUp('fast');
      }
    });
  };

  /**
   * @function update
   * @returns {undefined}
   */
  this.update = function () {
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

    this.updateContent();
  };

  /**
   * @function updateContent
   * @returns {undefined}
   */
  this.updateContent = function () {
    inspector.reset();

    var supportedObjects = RightManager.getSupportedObjects();

    // Hide/remove UI stuff...
    rightmanagerArea.find(".btn-new-role").hide();
    rightmanagerArea.find(".not-supported-message").parent().remove();
    this.hideMessageBox(true);

    if (RightManager.supports(currentObject)) {
      this.updateObjectArea();

      // Get all roles...
      RightManager.getRoles(currentObject, function (roles) {
        rightmanagerArea.find(".btn-new-role").show();

        for (var i = 0; i < roles.length; i++) {
          that.modifyRoleSection(roles[i], true);
        }
      });

    } else {
      this.updateObjectArea(true);

      // Generate the not supported message...
      var message = '<div class="jDesktopInspector_main">';
      message += '<div class="jDesktopInspector_page not-supported-message">';
      if (currentObject)
        message += "<p>This object is not supported by the right manager.</p>";
      message += "<p>Supported objects:</p>";
      message += "<ul>";
      for (var i = 0; i < supportedObjects.length; i++) {
        message += "<li>" + supportedObjects[i] + "</li>";
      }
      message += "</ul></div></div>";

      // Show the not supported message...
      rightmanagerArea.append(message);
    }
  };

  /**
   * 
   * @param  {Boolean}  clear
   * @returns {undefined}
   */
  this.updateObjectArea = function (clear) {

    var objectArea = rightmanagerArea.find(".object-area");
    var htmlText = "";
    if (!clear) {
      if (currentObject.getAttribute) {
        htmlText = '<span>' + currentObject.type + ':</span> <span title="ID: ' + currentObject.id + '">' + currentObject.getAttribute("name") + '</span>';
      } else {
        htmlText = '<span>' + currentObject.type + ':</span> <span>' + currentObject.id + '</span>';
      }
    }

    objectArea.html(htmlText);

    if (!clear) {
      objectArea.show();
    } else {
      objectArea.hide();
    }
  };
};

/**
 * Creates and shows a confirm dialog.
 * 
 * @param {type} title      Title of the dialog.
 * @param {type} text       Text of the dialog.
 * @param {type} callback   The function which is called, once the user confirms it.
 * @param {type} okText     An alternative text for the confirm button. Defaults to "OK".
 * @returns {undefined}
 */
function confirmDialog(title, text, callback, okText) {
  var dialogDiv = $("<div>");
  dialogDiv.attr("title", title);
  dialogDiv.html("<p>" + text + "</p>");

  if (!okText)
    okText = "OK";

  dialogDiv.dialog({
    resizable: false,
    modal: true,
    buttons: [
      {
        text: okText,
        click: function () {
          $(this).dialog("close");
          callback();
        }
      },
      {
        text: "Cancel",
        click: function () {
          $(this).dialog("close");
        }
      }
    ]
  });
}
