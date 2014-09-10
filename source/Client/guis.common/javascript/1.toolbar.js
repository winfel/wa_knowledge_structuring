"use strict";

/**
 * @file 1.toolbar.js
 */

/* SETTINGS */
var popover_positionOffsetX = 8;
var popover_positionOffsetY = 21;

/**
 * Init. the toolbar
 * @function initToolbar
 */
 GUI.initToolbar = function() {

  /* insert icons for creating new objects: */

  var types = {};

  /* get types of objects */
  $.each(ObjectManager.getTypes(), function(key, object) {

    if (object.isCreatable) {

      if (object.category == undefined) {
        object.category = "default";
      }

      if (types[object.category] == undefined) {
        types[object.category] = [];
      }

      types[object.category].push(object);

    }

  });


  var toolbar_locked_elements = {};

  /* build categories for each type */
  $.each(types, function(key, object) {

    var newCategoryIcon = document.createElement("img");
    $(newCategoryIcon).attr("src", "../../guis.common/images/categories/" + object[0].category + ".png").attr("alt", "");
    $(newCategoryIcon).attr("width", "24").attr("height", "24");

    $("#header>div.header_left").append(newCategoryIcon);

    if (object.length > 1) {

      $(newCategoryIcon).attr("title", GUI.translate(object[0].category));

      /* add Popover */

      $(newCategoryIcon).jPopover({
        positionOffsetX: popover_positionOffsetX,
        positionOffsetY: popover_positionOffsetY,
        onSetup: function(domEl, popover) {

          var page = popover.addPage(GUI.translate(key));
          var section = page.addSection();

          $.each(object, function(key, object) {

           var name = (object.menuItemLabel != '') ? object.translate(GUI.currentLanguage, object.menuItemLabel) : object.translate(GUI.currentLanguage, object.type);

			var element = section.addElement('<img src="/objectIcons/' + object.type + '" alt="" width="24" height="24" /> ' + name);

			var click = function(attributes) {

				popover.hide();

				if($(".ui-tabs-active").children().first().attr('title') != "Global Space" || object.type != "File"){ //do not allow Files in the Global Space

          var proto = ObjectManager.getPrototype(object.type);

          if (!Modules.Config.presentationMode) {

           proto.create(attributes);

         } else {
           alert(GUI.translate("You cannot create objects in presentation mode"));
         }
       }
       else{
         alert("Sorry, it's not allowed to upload Files in the Global Space. Please upload them in your private Space or in the Paper Spaces");
       }
     };

     if (GUI.isTouchDevice) {
       $(element.getDOM()).bind("touchstart", function() {
        click({
          "x": window.pageXOffset + 40,
          "y": window.pageYOffset + 40
        });
      });
     } else {
       $(element.getDOM()).bind("click", function() {
        click({
          "x": window.pageXOffset + 40,
          "y": window.pageYOffset + 40
        });
      });
     }


     /* make draggable */
     var helper = $('<img src="/objectIcons/' + object.type + '" alt="" width="24" height="24" />');
     helper.get(0).callback = function(offsetX, offsetY) {

       var svgpos = $("#content").offset();

       var top = offsetY - svgpos.top;
       var left = offsetX;

       click({
        "x": left,
        "y": top
      });

     };

     $(element.getDOM()).addClass("toolbar_draggable");
     $(element.getDOM()).draggable({
       revert: true,
       distance: 20,
       cursor: "move",
       helper: function(event) {
        return helper;
      }
    });


   });

}
});

} else {

  /* add link to icon (no Popover) */

  $(newCategoryIcon).attr("title", object[0].translate(GUI.currentLanguage, object[0].type));

  var click = function(attributes) {

    if (toolbar_locked_elements[object[0].type] === true)
          return; //element is locked

        if (object[0].type == "Paint" || object[0].type == "Highlighter") {

          toolbar_locked_elements[object[0].type] = true;

          /* create unlock timer */
          window.setTimeout(function() {
            toolbar_locked_elements[object[0].type] = undefined;
          }, 2000);

        }

        jPopoverManager.hideAll();

        var proto = ObjectManager.getPrototype(object[0].type);

        if (!Modules.Config.presentationMode) {
          proto.create(attributes);
        } else {
          alert(GUI.translate("You cannot create objects in presentation mode"));
        }

      };

      if (GUI.isTouchDevice) {
        $(newCategoryIcon).bind("touchstart", function() {
          click({
            "x": window.pageXOffset + 40,
            "y": window.pageYOffset + 40
          });
        });
      } else {
        $(newCategoryIcon).bind("click", function() {
          click({
            "x": window.pageXOffset + 40,
            "y": window.pageYOffset + 40
          });
        });
      }

      /* All objects (except for Paint and Highlighter) can be created by dragging them to the svg area */
      if (object[0].type != "Paint" && object[0].type != "Highlighter") {

        /* make draggable */
        var helper = $('<img src="../../guis.common/images/categories/' + object[0].category + '.png" alt="" width="24" height="24" />');
        helper.get(0).callback = function(offsetX, offsetY) {

          var svgpos = $("#content").offset();

          var top = offsetY - svgpos.top;
          var left = offsetX;

          click({
            "x": left,
            "y": top
          });

        };

        $(newCategoryIcon).addClass("toolbar_draggable");
        $(newCategoryIcon).draggable({
          revert: true,
          distance: 20,
          cursor: "move",
          helper: function(event) {
            return helper;
          }
        });

      }


    }
	
	/**
	* @function effect
	*/
    var effect = function() {
      $(this).animate({opacity: 1}, 500, function() {
        $(this).animate({opacity: 0.6}, 500);
      });
    };

    if (GUI.isTouchDevice) {
      $(newCategoryIcon).bind("touchstart", effect);
    } else {
      $(newCategoryIcon).bind("mousedown", effect);
    }

  });

  /*add coupling button
  if (Modules.Config.couplingMode) {
    var couplingButton = document.createElement("img");
    $(couplingButton).attr("src", "../../guis.common/images/coupling.png").attr("alt", "");
    $(couplingButton).attr("width", "24").attr("height", "24");

    $(couplingButton).attr("id", "paste_button");
    $(couplingButton).addClass("sidebar_button");

    $(couplingButton).css("padding-left", "20px");
    $(couplingButton).css("padding-right", "20px");
    $(couplingButton).css("margin-right", "20px");
    $(couplingButton).css("border-right", "1px solid #636363");

    $(couplingButton).attr("title", GUI.translate("Coupling"));

    $("#header > .header_right").append(couplingButton);

    var click = function() {
      GUI.enterCouplingMode();
    };

    if (GUI.isTouchDevice) {
      $(couplingButton).bind("touchstart", click);
    } else {
      $(couplingButton).bind("mousedown", click);
    }
  }*/


  /*add parent button

  var parentButton = document.createElement("img");
  $(parentButton).attr("src", "../../guis.common/images/parent.png").attr("alt", "");
  $(parentButton).attr("width", "24").attr("height", "24");

  $(parentButton).attr("id", "bug_button");
  $(parentButton).addClass("sidebar_button");

  $(parentButton).attr("title", GUI.translate("Home"));

  $("#header > .header_right").append(parentButton);

  var click = function() {
    Modules.ObjectManager.goParent();
  };

  if (GUI.isTouchDevice) {
    $(parentButton).bind("touchstart", click);
  } else {
    $(parentButton).bind("mousedown", click);
  }*/


  /*add paint button*/
  /*
   var homeButton = document.createElement("img");
   $(homeButton).attr("src", "../../guis.common/images/painting.png").attr("alt", "");
   $(homeButton).attr("width", "24").attr("height", "24");
   
   $(homeButton).attr("id", "bug_button");
   $(homeButton).addClass("sidebar_button");
   
   $(homeButton).attr("title", GUI.translate("Paint"));
   
   $("#header > .header_right").append(homeButton);
   
   var click = function() {
   GUI.editPaint();
   }
   
   if (GUI.isTouchDevice) {
   $(homeButton).bind("touchstart", click);
   } else {
   $(homeButton).bind("mousedown", click);
   }
   */

  /*add paste button
  var pasteButton = document.createElement("img");
  $(pasteButton).attr("src", "../../guis.common/images/paste.png").attr("alt", "");
  $(pasteButton).attr("width", "24").attr("height", "24");

  $(pasteButton).attr("id", "paste_button");
  $(pasteButton).addClass("sidebar_button");

  $(pasteButton).css("padding-left", "20px");
  $(pasteButton).css("padding-right", "20px");
  $(pasteButton).css("margin-right", "20px");
  $(pasteButton).css("border-left", "1px solid #636363");
  $(pasteButton).css("border-right", "1px solid #636363");

  $(pasteButton).attr("title", GUI.translate("Paste"));

  $("#header > .header_right").append(pasteButton);

  var click = function() {
    Modules.ObjectManager.pasteObjects();
  };

  if (GUI.isTouchDevice) {
    $(pasteButton).bind("touchstart", click);
  } else {
    $(pasteButton).bind("mousedown", click);
  }*/

  /*add menu button*/
  var menuButton = document.createElement("img");
  $(menuButton).attr("src", "../../guis.common/images/menu.png").attr("alt", "");
  $(menuButton).attr("width", "24").attr("height", "24");

  $(menuButton).attr("id", "menu_button");
  $(menuButton).addClass("sidebar_button");

  $(menuButton).attr("title", GUI.translate("Menu"));

  $("#header > .header_right").append(menuButton);

  $(menuButton).jPopover({
    positionOffsetX: popover_positionOffsetX,
    positionOffsetY: popover_positionOffsetY,
    arrowOffsetRight: 12,
    onSetup: function(domEl, popover) {

      Object.defineProperty(popover.options, 'positionOffsetX', {
       get:function() {
        return -4 - popover_positionOffsetX + $("#header > .header_right").position().left;
      }
    });
      Object.defineProperty(popover.options, 'arrowOffsetRight', {
       get:function() {
        return 30 + $("#header > .header_right").position().left;
      }
    });

      var page = popover.addPage(GUI.translate("Welcome") + " " + Modules.Helper.capitalize(GUI.username));
      var section = page.addSection();

      var btnSignout = section.addElement('<img src= "../../guis.common/images/log_out.png" alt="" width="24" height="24" /> ' + GUI.translate("Sign out"));
      var clickSignout = function() {
        location.pathname = "/logout";
        popover.hide();
      };

      var selLanguage = section.addElement(GUI.translate("Language")).addWidget('selection');
      selLanguage.setOptions(['de', 'en', 'es', 'cow']);
      selLanguage.setValue(ObjectManager.getUser().preferredLanguage || GUI.currentLanguage);
      selLanguage.onChange(function(sel) {
          
           var response = $("#container-notifier").notify("create", "confrim-notification", { 
               text: GUI.translate('trasnlate'),
               Yes: GUI.translate('Yes'),
               No: GUI.translate('No')
           }, { expires:false });
           
           response.widget().delegate("input", "click", function(event) {
               if (event.currentTarget.name == "yes") {
                   GUI.currentLanguage = sel;
                   ObjectManager.getUser().preferredLanguage = sel;
                   location.reload();
               }  else {
                   response.close();
               }
           });
    });

/*		// the color widget allows colors which shouldn't be allowed :-/
		var selUserColor = section.addElement(GUI.translate("Your color")).addWidget('color');
		selUserColor.setColor(ObjectManager.getUser().color);
		selUserColor.onChange(function(sel) {
			ObjectManager.getUser().color = sel;
			if(confirm(GUI.translate('To update your color at all elements of the page it has to be reloaded. Reload now?'))) {
				location.reload();
			}
		});
*/

var btnPaste = section.addElement('<img src= "../../guis.common/images/paste-black.png" alt="" width="24" height="24" /> ' + GUI.translate("Paste"));
var clickPaste = function() {
  alert("Paste");
  Modules.ObjectManager.pasteObjects();
  popover.hide();
};

var btnCoupling = section.addElement('<img src= "../../guis.common/images/coupling-black.png" alt="" width="24" height="24" /> ' + GUI.translate("Coupling"));
var clickCoupling = function() {
  GUI.enterCouplingMode();
  popover.hide();
};

var btnTagManager = section.addElement('<img src= "../../guis.common/images/tag.png" alt="" width="24" height="24" /> ' + GUI.translate("Manage Tags"));
var clickTagManager = function() {
  GUI.tagManager.open(700, 800,false);
  popover.hide();
};

if (GUI.isTouchDevice) {
  $(btnSignout.getDOM()).bind("touchstart", clickSignout);
  $(btnPaste.getDOM()).bind("touchstart", clickPaste);
  $(btnCoupling.getDOM()).bind("touchstart", clickCoupling);
  $(btnTagManager.getDOM()).bind("touchstart", clickTagManager);
} else {
  $(btnSignout.getDOM()).bind("click", clickSignout);
  $(btnPaste.getDOM()).bind("click", clickPaste);
  $(btnCoupling.getDOM()).bind("click", clickCoupling);
  $(btnTagManager.getDOM()).bind("click", clickTagManager);
}
}
});


/* add inspector toggle */

if (!Modules.Config.presentationMode) {

  var inspectorButton = document.createElement("img");
  $(inspectorButton).attr("src", "../../guis.common/images/inspector.png").attr("alt", "");
  $(inspectorButton).attr("width", "24").attr("height", "24");

  $(inspectorButton).attr("id", "inspector_button");
  $(inspectorButton).addClass("sidebar_button header_tab");

  $(inspectorButton).attr("title", GUI.translate("Object inspector"));

  var click = function() {
    GUI.sidebar.openPage("inspector", inspectorButton);
  };

  if (GUI.isTouchDevice) {
    $(inspectorButton).bind("touchstart", click);
  } else {
    $(inspectorButton).bind("mousedown", click);
  }

  $("#header > .header_tabs_sidebar").append(inspectorButton);

  GUI.sidebar.openPage("inspector", inspectorButton);

}

/* add Right Manager toggle */

if (!Modules.Config.presentationMode) {

  var rmButton = document.createElement("img");
  $(rmButton).attr("src", "../../guis.common/images/rightManagment.png").attr("alt", "");
  $(rmButton).attr("width", "24").attr("height", "24");

  $(rmButton).attr("id", "rightmanager_button");
  $(rmButton).addClass("sidebar_button header_tab");

  $(rmButton).attr("title", GUI.translate("Right Manager"));

  var click = function() {
    GUI.sidebar.openPage("rightmanager", rmButton);
  };

  if (GUI.isTouchDevice) {
    $(rmButton).bind("touchstart", click);
  } else {
    $(rmButton).bind("mousedown", click);
  }

  $("#header > .header_tabs_sidebar").append(rmButton);

}
/* add search toggle */

if (!Modules.Config.presentationMode) {

  var searchButton = document.createElement("img");
  $(searchButton).attr("src", "../../guis.common/images/oxygen/16x16/actions/view-filter.png").attr("alt", "");
  $(searchButton).attr("width", "24").attr("height", "24");

  $(searchButton).attr("id", "search_Button");
  $(searchButton).addClass("sidebar_button header_tab");

  $(searchButton).attr("title", GUI.translate("Filter"));

  var click = function() {
    $("#mainTagSel").empty();

    Modules.TagManager.getMainTagsAndSecTags(function(mainTagList){
     var option = $("<option>");
     option.attr({
    	 value: " ",
    	 disabled: true,
    	 selected: true
     });
     option.html("Select Main Tag");

     $("#mainTagSel").append(option);
     for(var i=0;i<mainTagList.length;i++){
    	 var option = $("<option>");
    	 option.attr({
    		 value: mainTagList[i].name,
    	 });

    	 option.html(mainTagList[i].name);
    	 $("#mainTagSel").append(option);
    }
     
     $("#mimeTypesColumn1, #mimeTypesColumn2").html("");
     
     var allMimeTypes = [
                         { "name": "application/pdf", "label": "pdf" },
                         { "name": "text/html", "label": "html" },
                    	 { "name": "text/plain", "label": "text" },
                         { "name": "image/", "label": "image" },
                    	 { "name": "audio/", "label": "audio" }, 
                         { "name": "video/", "label": "video" },
                        ];

     //organize into two columns
     var columnToAppendTo = $("#mimeTypesColumn1");
     var middleOfArray = Math.round(allMimeTypes.length / 2) - 1; 
     $.each(allMimeTypes, function(key, mimeType){
     	var checkbox = $("<input />");
     	checkbox.attr({
     		type: 'checkbox',
     		id: "mimeTypeChk_" + mimeType.label,
     		name: 'mimeTypeChk',
     		'class': 'mimeTypeChk',
     		value: mimeType.name
     	});
     	
     	var label = $('<label>');
     	label.attr({
     		'for': "mimeTypeChk_" + mimeType.label     		
     	});
     	label.text(mimeType.label);
     	
     	if(key > middleOfArray) {
     		columnToAppendTo = $("#mimeTypesColumn2");
     	}
     	columnToAppendTo.append(checkbox);
     	columnToAppendTo.append(label);
     	
     });

   });
    GUI.sidebar.openPage("search", searchButton);
  };

  if (GUI.isTouchDevice) {
    $(searchButton).bind("touchstart", click);
  } else {
    $(searchButton).bind("mousedown", click);
  }

  $("#header > .header_tabs_sidebar").append(searchButton);
  
}

/* add chat toggle */

if (!Modules.Config.presentationMode) {

  var chatButton = document.createElement("img");
  $(chatButton).attr("src", "../../guis.common/images/chat.png").attr("alt", "");
  $(chatButton).attr("width", "24").attr("height", "24");

  $(chatButton).attr("id", "chat_button");
  $(chatButton).addClass("sidebar_button header_tab");

  $(chatButton).attr("title", GUI.translate("Chat"));

  $("#header > .header_tabs_sidebar").append(chatButton);


  var chatNotifier = document.createElement("span");
  $(chatNotifier).attr("id", "chat_notifier");
  $(chatNotifier).html("");

  $(chatNotifier).css("opacity", 0);

  var buttonPos = $(chatButton).position();

  $(chatNotifier).css("left", buttonPos.left).css("top", buttonPos.top);

  $("#header > .header_tabs_sidebar").append(chatNotifier);


  var click = function() {
    GUI.sidebar.openPage("chat", chatButton);
  };

  if (GUI.isTouchDevice) {
    $(chatButton).bind("touchstart", click);
    $(chatNotifier).bind("touchstart", click);
  } else {
    $(chatButton).bind("mousedown", click);
    $(chatNotifier).bind("mousedown", click);
  }

}

/* add bug report toggle */
if (!Modules.Config.presentationMode) {

  var bugButton = document.createElement("img");
  $(bugButton).attr("src", "../../guis.common/images/bugreport.png").attr("alt", "");
  $(bugButton).attr("width", "24").attr("height", "24");

  $(bugButton).attr("id", "bug_button");
  $(bugButton).addClass("sidebar_button header_tab");

  $(bugButton).attr("title", GUI.translate("Bugreport"));

  $("#header > .header_tabs_sidebar").append(bugButton);


  var click = function() {
    GUI.sidebar.openPage("bug", bugButton);
  };

  if (GUI.isTouchDevice) {
    $(bugButton).bind("touchstart", click);
  } else {
    $(bugButton).bind("mousedown", click);
  }

}



$("#header_toggle_sidebar_hide").on("click", function() {
  GUI.sidebar.closeSidebar();
});

$("#header_toggle_sidebar_show").on("click", function() {
  GUI.sidebar.openSidebar();
});
};