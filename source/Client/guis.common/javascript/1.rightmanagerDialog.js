/* 
 * Right Manager Dialog
 */

GUI.rightmanagerDialog = new function() {

  var rightsObjects = ["PaperObject", "Subroom"];
  var roles = ["Writer", "Reviewer"];
  var rights = [];
  var allrights = ["create", "read", "write", "delete"];
  var listitems = "";
  var tabpages = "";
  var plustabcontent = "";

  var rmd = null;
  var rmdTabs = null;
  var rmdTabList = null;
  var rmdTabItemAdd = null; // It is used...

  var obj = null;
  var objData = null; // It is used...


  var checkedUsers = null; // Keep track of the selected users. Needed for a delete server call.
  var checkedSpans = null; // Keep track of the corresponding spans, which display a user.

  /*
   * Initializes the right manager dialog.
   * 
   * @returns {undefined}
   */
  this.init = function() {
    console.log("GUI.rightmanagerDialog initialized");

    var that = GUI.rightmanagerDialog;

    // Setup the dialog
    this.rmd = $("#rightmanagerDialog").dialog({
      title: "Right Manager Setup",
      autoOpen: false,
      modal: true,
      width: 500,
      buttons: [
        {
          text: "Set default",
          click: function() {
            setDefaultRoles();
          }
        },
        {
          text: "Add users",
          click: function() {
            openUserDialog();
          }
        },
        {
          text: "Delete user",
          click: function() {
            //deleteusers();
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

    // Store references to the particular elements in the dom list
    this.rmdTabs = $("#rmdTabs");
    this.rmdTabList = $("#rmdTabList");
  }; // init functions ends

  /*
   * 
   * @param {type} typeOfObject
   * @returns {undefined}
   */
  this.show = function(theObject) {
    var that = GUI.rightmanagerDialog;

    // Check whether this object is supposed to have a right manager dialog or not.
    if (rightsObjects.indexOf(theObject.type) >= 0) {
      // Load roles 
      that.obj = theObject;
      that.objData = {id: 1, type: theObject.type}; // { id: theObject.id, type: theObject.type };

      Modules.UserManager.getRoles(that.objData, GUI.username, updateTabs);

      // Open the dialog
      this.rmd.dialog("open");
    }
  };// show functions ends

  /*
   * Updates the tabs within the dialog
   * 
   * @param {type} roles        An array of role objects
   * @returns {undefined}
   */
  function updateTabs(roles) {
    var that = GUI.rightmanagerDialog;

    // Remove the previous tabs...
    that.rmdTabs.tabs("destroy");

    // Clear the tab list and all contents
    that.rmdTabList.empty();
    that.rmdTabs.empty();

    var index = 0;
    roles.forEach(function(role) {
      index++;

      // Create a tab for each role
      var listItem = $("<li>");
      var tabItem = $("<a>");
      tabItem.attr({
        href: "#tabs-" + index
      });
      tabItem.html(role.name);
      listItem.append(tabItem);
      that.rmdTabList.append(listItem);

      var tabPage = $("<div>");
      tabPage.attr({
        id: "tabs-" + index
      });
      // Append the tab page to the DOM
      that.rmdTabs.append(tabPage);

      // The specific section for rights
      // -------------------------------
      var sectionRights = $("<div>");
      sectionRights.attr({
        class: "rightmanager-section rightmanager-right-section"
      });
      sectionRights.append('<h3 class="rightmanager-section-header">Rights</h3>');
      tabPage.append(sectionRights);

      Modules.RightManager.getRights(that.objData, role, GUI.username, function(availableRights, checkedRights) {
        // Finally add the rights to the rights section

        if (availableRights.length > 0) {
          availableRights.forEach(function(right) {
            var inputId = tabPage.attr("id") + "_" + right.name; // This id is used to link the input and the label

            var checkbox = $("<input>");
            checkbox.attr({
              id: inputId,
              type: "checkbox",
              class: "rightmanager-right-checkbox",
              value: right.name
            });
            checkbox.on("click", function() {
              var checked = checkbox.prop("checked");

              if (checked)
                Modules.RightManager.grantAccess(right.name, that.objData, role);
              else
                Modules.RightManager.revokeAccess(right.name, that.objData, role);
            });

            if (checkedRights.indexOf(right.name) >= 0) // Check if the right is actually checked
              checkbox.prop("checked", true);

            var label = $("<label>");
            label.attr({
              for : inputId,
              class: "rightmanager-right-label",
              title: right.name + "<br>" + right.comment
            });
            label.html(right.name);
            //label.tooltip();

            // Update the rights section
            sectionRights.append(checkbox);
            sectionRights.append(label);
          });
        } else {
          // No rights found
          var span = $("<span>");
          span.html("Ups! That's wired, I was not able to find any right for this role.");
          sectionRights.append(span);
        }
      });

      // The specific section for users
      // ------------------------------
      var sectionUsers = $("<div>");
      sectionUsers.attr({
        id: "rightmanager-user-section-" + index,
        class: "rightmanager-section rightmanager-user-section"
      });
      sectionUsers.append('<h3 class="rightmanager-section-header">Users</h3>');
      tabPage.append(sectionUsers);

      Modules.UserManager.getUsers(that.objData, role, GUI.username, function(users) {

        that.checkedUsers = new Array();
        that.checkedSpans = new Array();

        if (users.length > 0) {
          users.forEach(function(user) {
            addUserToSection(that, user, sectionUsers, true);
          });
        } else {
          // No user found => show a corresponding message.
          var span = $("<span>");
          span.html("No users found");
          sectionUsers.append(span);
        }
      });
    });

    // Insert the tab list at the beginning of the tab container
    that.rmdTabs.prepend(that.rmdTabList);

    // Recreate the tabs
    that.rmdTabs.tabs({
      collapsible: true
    });

    // Add the + button to the tabs
    var tabItemAdd = $("<a>");
    tabItemAdd.html("+");
    tabItemAdd.on("click", function() {
      newTabTextfield(tabItemAdd, index);
    });

    // Add the tab item to the tab list
    addTabItem(tabItemAdd, false);

    // Store the add tab item reference
    that.rmdTabItemAdd = tabItemAdd;
  }

  /**
   * Helper function to create a new tab item.
   * 
   * @param {type} element      The link (<a>) object.
   * @param {type} content      The content of the new tab.
   * @param {type} tabItemAdd   Reference to the special add (+) tab.
   * @param {type} cssClass     Some custom css classes.
   * @returns {undefined}
   */
  function addTabItem(element, content, tabItemAdd, cssClass) {
    var that = GUI.rightmanagerDialog;

    var listitem = $("<li>");
    listitem.append(element);

    if (content) {
      that.rmdTabs.append(content);
    } else {
      // No content? This means it is a dummy button with no tab page.
      // Simulate the jquery ui effects.
      listitem.addClass("ui-state-default ui-corner-top");

      listitem.hover(function() {
        listitem.addClass("ui-state-hover");
      }, function() {
        listitem.removeClass("ui-state-hover");
      });
    }

    if (cssClass) {
      // Add the custom css classes
      listitem.addClass(cssClass);
    }

    // If tabItemAdd is available insert the listitem in front of it.
    if (tabItemAdd)
      tabItemAdd.parent().before(listitem);
    else
      that.rmdTabList.append(listitem);
  }

  /**
   * Helper function to create a tab containing a textfield
   * 
   * @param {type} tabItemAdd
   * @param {type} index
   * @returns {undefined}
   */
  function newTabTextfield(tabItemAdd, index) {
    var that = GUI.rightmanagerDialog;

    var tabItemTextfield = $("<a>");
    tabItemTextfield.attr({
      class: "newTabTextfield"
    });

    var textfield = $("<input>");
    textfield.attr({
      type: "text",
      size: 10
    });
    tabItemTextfield.append(textfield);

    var addRoleCalled = false;
    /**
     * Calls the UserManager to store the given role
     * 
     * @returns {undefined}
     */
    var storeNewRole = function() {
      // New name of the role
      var value = textfield.val();

      // Store the new role in the database
      if (!addRoleCalled) {
        Modules.UserManager.addRole(that.objData, {name: value});
        // Make sure it is only called once on the client side.
        addRoleCalled = true;
      }

      // Update the tabs
      Modules.UserManager.getRoles(that.objData, GUI.username, function(roles) {
        updateTabs(roles);

        that.rmdTabs.tabs("select", index);
      });
    };

    textfield.on("keyup", function(event) {
      if (event.keyCode == 13) {
        // enter pressed
        storeNewRole();
      }
    });

    textfield.on("blur", function() {
      if (!addRoleCalled) {
        // If the role has not been stored yet, remove the textfield.
        tabItemTextfield.parent().remove();
        that.rmdTabs.tabs("select", 0);
      }
    });

    addTabItem(tabItemTextfield, true, tabItemAdd, "ui-tabs-selected ui-state-active");

    // Unselect every tab
    that.rmdTabs.tabs("select", -1);

    // Set the focus to the textfield
    textfield.focus();
  }

  /**
   * 
   * @returns {undefined}
   */
  function setDefaultRoles() {
    alert("Well... You got me. This function is not implemented yet :).");
  }

  function openUserDialog() {
    var that = GUI.rightmanagerDialog;

    var selectedTabId = that.rmdTabs.tabs("option", "selected") + 1;

    var resultCallback = function(users) {
      var sectionUsers = $("#rightmanager-user-section-" + selectedTabId);

      users.forEach(function(user) {
        addUserToSection(that, user, sectionUsers, true);
      });
    };

    GUI.userdialog.show(resultCallback);
  }

//    Modules.RightManager.getAllUsers(function(users) {
//      var friends = "";
//      users.forEach(function(user) {
//        friends += '<input type="checkbox" id="' + user.username + '" class="friendlist">' + user.username + '</input><br>';
//      });
//      $("#user-friendlist").append(friends);
//    });
//    /* todo: get users from db userlist*/
//    var selectedusers = "";
//
//    var userDialog = $('' +
//            '<div id="addrole-dialog">' +
//            '<h3>Users </h3><hr>' +
//            '<div id="user-friendlist"> </div><br>' +
//            ' <select id="userlist" name="userlist" size="5" multiple>' +
//            '<option>Brice</option>' +
//            '<option>Oliver</option>' +
//            '<option>Manasa</option>' +
//            '<option>Ivan</option>' +
//            '<option>Shari</option>' +
//            '<option>Steven</option>' +
//            '<option>Sharath</option>' +
//            '<option>Alejandro</option>' +
//            '<option>Nitesh</option>' +
//            '<option>Siby</option>' +
//            '</select>'
//            );
//
//    var userButtons = {
//      "Cancel": function() {
//        $(this).dialog("close");
//      },
//      "Add users": function() {
//
//        // select list part
//        var checkedUsers = new Array(); // Keep track of the selected users. Needed for a delete server call.
//        var checkedSpans = new Array(); // Keep track of the corresponding spans, which display a user
//
//        // No users checked anymore
//        checkedSpans.length = 0;
//        checkedUsers.length = 0;
//
//        //checkbox part doesn't work yet
//        /*           $("input[type='checkbox']:checked").each(
//         function() {
//         var span = $("<span>");
//         span.addClass("rmd_users");
//         span.html($(this).id());
//         span.data("value", $(this).id());
//         $("#selectusers").append(span);
//         });
//         */
//
//        $('#userlist option:selected').each(function() {
//          var span = $("<span>");
//          span.addClass("rmd_users");
//          span.html($(this).text());
//          span.data("value", $(this).text());
//
//
//          span.on("mouseenter", function(event) {
//            if (!span.hasClass("checked"))
//              span.data("deleteImg").addClass("visible");
//          });
//
//          span.on("mouseleave", function(event) {
//            if (!span.hasClass("checked"))
//              span.data("deleteImg").removeClass("visible");
//          });
//
//          // The whole click magic ;)...
//          span.on("click", function(event) {
//            var deleteImg = span.data("deleteImg"); // The reference to the delete image.
//            var index = checkedSpans.indexOf(span); // The index of the clicked span.
//
//            // Check for multi/single selection
//            if (event.ctrlKey) {
//              // Multi selection
//              if (index >= 0) {
//                checkedSpans.splice(index, 1); // Remove the span from the array
//                checkedUsers.splice(index, 1); // Remove the user from the array
//              } else {
//                checkedSpans.push(span); // Add the span to the array
//                checkedUsers.push($(this).text()); // Add the user to the array
//              }
//
//            } else {
//              // Single selection: Uncheck all elements first and then check the current element again..
//              checkedSpans.forEach(function(item) {
//                item.removeClass("checked");
//                item.data("deleteImg").removeClass("visible");
//              });
//              checkedSpans.length = 0; // Delete all array items.
//              checkedSpans.push(span);
//
//              checkedUsers.length = 0; // Delete all array items.
//              checkedUsers.push($(this).text());
//            }
//
//            span.toggleClass("checked"); // Toggle the span
//
//            // Check if delete buttons are or the delete all button is shown.
//            if (span.hasClass("checked") && checkedSpans.length == 1)
//              deleteImg.addClass("visible");
//            else
//              deleteImg.removeClass("visible");
//
//            if (checkedSpans.length > 1) {
//              checkedSpans.forEach(function(item) {
//                item.data("deleteImg").removeClass("visible");
//              });
//
//            } else {
//              deleteImg.addClass("visible");
//
//            }
//          });
//
//          var deleteImg = $("<img>");
//          deleteImg.attr({
//            alt: "Delete",
//            src: "/guis.common/images/oxygen/16x16/actions/edit-delete.png"
//          });
//          deleteImg.on("click", function(event) {
//            span.remove();
//            // Update the arrays
//            var index = checkedSpans.indexOf(span); // The index of the clicked span
//            checkedSpans.splice(index, 1); // Remove the span from the array
//            checkedUsers.splice(index, 1); // Remove the user from the array
//
//            event.stopPropagation(); // We don't want to fire the span click event. That's why we stop the propagation.
//          });
//
//          span.data("deleteImg", deleteImg); // Store the delete image, so it can be used by the span.
//          span.append(deleteImg);
//
//          $("#selectusers").append(span);
//        });//iteration over section userlist ends
//
//      } //add button ends here
//    }; //buttons end
//    var dialog = GUI.dialog(
//            "Add Users",
//            userDialog, userButtons
//            );
//
//  }
//  ; //addusers function ends
//
//  function deleteusers() {
//    alert("tadah");
//  }
//  ;
//
//

};

