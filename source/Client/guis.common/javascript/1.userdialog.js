/**
 * 
 * @class GUI.userdialog
 * @classdesc
 */
GUI.userdialog = new function() {
  var self = this;
  
  /**
   * Returns the HTML code for a loading spinner.
   * 
   * @function getSpinnerHtml
   * @returns {String}
   */
  this.getSpinnerHtml = function() {
    return '<div class="spinner">' +
            '<div class="spinner-container container1">' +
            '<div class="circle1"></div><div class="circle2"></div>' +
            '<div class="circle3"></div><div class="circle4"></div>' +
            '</div>' +
            '<div class="spinner-container container2">' +
            '<div class="circle1"></div><div class="circle2"></div>' +
            '<div class="circle3"></div><div class="circle4"></div>' +
            '</div>' +
            '<div class="spinner-container container3">' +
            '<div class="circle1"></div><div class="circle2"></div>' +
            '<div class="circle3"></div><div class="circle4"></div>' +
            '</div>' +
            '</div>';
  };
  
  /**
   * 
   * @function addUserButton
   * @param {type} container
   * @param {type} object
   * @param {type} role
   * @param {type} user
   * @returns {undefined}
   */
  this.addUserButton = function(container, object, role, user) {
    var inputId = object.id + "_" + role.name + "_" + user.username;

    var input = $("<input>");
    input.attr({
      type: "checkbox",
      id: inputId
    });

    var label = $("<label>");
    label.attr({
      'for': inputId,
      'data-username': user.username
    });
    label.html(user.username);

    container.append(input);
    container.append(label);

    input.button();
  };

  /*
   * 
   * @function show
   * @param {type} callback
   * @returns {undefined}
   */
  this.show = function(object, role, callback) {
    var dialogDiv = $("<div>");
    dialogDiv.attr("title", "Adding users to role " + role.name);
    dialogDiv.html(
            '<div class="searchfield"><input class="userdialog-filter-text" type="text" placeholder="' + GUI.translate("Filter...") + '"></div>'
            + '<div class="userdialog-area-parent-users"></div>'
            + '<div class="userdialog-area-all-users">' + this.getSpinnerHtml() + '</div>'
            );

    var typeTimeout;
    var prevValue = "";
    dialogDiv.find(".userdialog-filter-text").keypress(function() {
      clearTimeout(typeTimeout);
      typeTimeout = setTimeout(function() {
        var value = dialogDiv.find(".userdialog-filter-text").val().trim();
        var area = dialogDiv.find(".userdialog-area-all-users");

        if (value != "") {
          // Filter by multiple words separated by a space.
          var findString = "";
          var values = value.split(" ");
          for (var i = 0; i < values.length; i++) {
            findString += ", label:contains(" + values[i] + ")";
          }
          findString = findString.replace(", ", "");

          if (prevValue != "")
            area.find("label:not(" + findString + ")").fadeOut();
          else
            area.find("label").fadeOut();

          area.find(findString).fadeIn();
        } else {
          area.find("label").fadeIn();
        }

        prevValue = value;
      }, 300);
    });

    dialogDiv.dialog({
      resizable: true,
      width: 500,
      modal: true,
      buttons: [
        {
          text: "Add",
          click: function() {
            $(this).dialog("close");

            var usersToAdd = $(this).find("label[aria-pressed='true']").map(function() {
              return $(this).attr("data-username");
            }).toArray();

            callback(usersToAdd);
            dialogDiv.remove();
          }
        },
        {
          text: "Cancel",
          click: function() {
            $(this).dialog("close");
            dialogDiv.remove();
          }
        }
      ],
      open: function() {
        // Load missing users when the dialog opens.
        var dialog = $(this);
        UserManager.getMissingUsers(object, role, function(users) {
          dialog.find(".userdialog-area-all-users .spinner").remove();
          for (var i = 0; i < users.length; i++) {
            self.addUserButton(dialog.find(".userdialog-area-all-users"), object, role, users[i]);
          }
        });
      }
    });
  };
};