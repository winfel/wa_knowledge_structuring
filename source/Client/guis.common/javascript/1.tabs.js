 $(function() {
    $("#changeTheRoomViaTab").click(function(e) {
      e.preventDefault(); // if desired...
      // other methods to call...
    });
  });

/* 
 * Sidebar: tabs
 */
GUI.tabs = new function() {
  var tabs, tabs_content;

  /* Content of tabs sidebar*/
  var currentlyStoredTab = [];
  var defaultTabs = ["Public#public"];
  var namesWithoutDeletePermission = ["Public"];

  var internalID;

  /**
   * 
   * @returns {undefined}
   */
  this.init = function() {
    console.log("GUI.tabs initialized");
    internalID = 0;

    var that = this;

    this.tabs = $("#tabs");
    this.tabsContent = $("#tabs_content");
    $("#tabs_content").html("");

    $("<p>").html("Add new tabs to the tab-bar with the help of the context menu of sub-rooms and paperobjects").appendTo("#tabs-room");
    
    this.redrawTabContent();
  };

  this.addTab = function(nameOfTheTab,linkTo,id){
    if(currentlyStoredTab.indexOf(id) >= 0){
          // do nothing
    }else{
        currentlyStoredTab.push(id);
    }
  };

  this.removeTab = function(id){
  	var findID = -1;
  	findID = currentlyStoredTab.indexOf(id);

  	if(findID > -1){
  		delete currentlyStoredTab[findID];
  	}

  	this.redrawTabContent();
  };

  this.redrawTabContent = function(){
    $("#tabs_content").html("");
    
    var that = this;

    var upperUl = $("<ul>").appendTo( "#tabs_content" );
    defaultTabs.forEach(function(item){
      var token = item.split("#");
      var currentLi = $("<li>"+token[0]+"</li>").on( "click", function () {
        ObjectManager.loadRoom(token[1], false, 'left');
      }).appendTo( upperUl );
    });

    currentlyStoredTab.forEach(function(item){
      var getCurrentObject = Modules.ObjectManager.getObject(item);
      var isPaperObject = (getCurrentObject.type == 'PaperObject');
      var currentName = getCurrentObject.getAttribute('name');

      var drawName = ""; 
      if(currentName.replace("(PaperObject)","").replace("(Room)","").length > 10){
      	if(isPaperObject){
      		drawName = currentName.substring(0,10)+ "... (PO)";
      	}else{
      		drawName = currentName.substring(0,10)+ "... (Room)";
      	}
      }else{
        if(isPaperObject){
          drawName = currentName + " (PO)";
        }else{
          drawName = currentName + " (Room)";
        }
      }

      var currentLi = $("<li>"+drawName+"</li>").on( "click", function () {
			ObjectManager.loadRoom(getCurrentObject.getAttribute('destination'), false, 'left');
		}).appendTo( upperUl );

      if(!namesWithoutDeletePermission.indexOf(currentName) == 0){
      	var delToken = $("<i>").html(" [X]").on( "click", function (e) {
      		e.stopPropagation();
      		that.removeTab(item)
      	}).appendTo(currentLi);
      }

      internalID++;
    });
  };
};