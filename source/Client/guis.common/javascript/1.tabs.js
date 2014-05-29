/* 
 * Sidebar: tabs
 */
GUI.tabs = new function() {
  var tabs, tabs_content;

  var cache = [];

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

  /** 
  * Removes a tab from the sidebar
  * 
  **/
  this.removeTab = function(id){
  	var findID = -1;
  	findID = currentlyStoredTab.indexOf(id);

  	if(findID > -1){
  		delete currentlyStoredTab[findID];
  	}

  	this.redrawTabContent();
  };

  /** 
  * The function creates a new cache entry. If there is already an entry with that id
  * it does nothing.
  *
  **/
  this.createCacheEntry = function(id, isPO, name, dest){
    console.log("writing object with id "+id+" to cache");

    var found = false;
    cache.forEach(function(entry){
      if(entry.id == id){
        found = true;
      }
    });

    if(!found){
          cache.push({id:id,
      isPO:isPO,
      name:name,
      dest:dest});
    }
  };

  /**
  *  Loads important object data from the cache
  *
  **/
  this.getFromCache = function(id){
    console.log("loading object with id "+id+" from cache");

    var returnVal;
    cache.forEach(function(entryInCache){
      if(entryInCache.id == id){
        returnVal = entryInCache;
      }
    });

    return returnVal;
  }

  /**
  * Redraws the content of the tab sidebar
  *
  **/
  this.redrawTabContent = function(){
    $("#tabs_content").html(""); // clear
    
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

      var currentName;
      var isPaperObject;
      var dest;

      /* maybe we need to use a cache */
      if(typeof getCurrentObject == 'undefined'){
        // object is in another room - load from cache instead
        getCurrentObject = that.getFromCache(item);

        isPaperObject = getCurrentObject.isPO;
        currentName = getCurrentObject.name;
        dest = getCurrentObject.dest;
        console.log(dest);
     }else{
        // load directly from the object and update the interal cache
        isPaperObject = (getCurrentObject.type == 'PaperObject');
        currentName = getCurrentObject.getAttribute('name');
        dest = getCurrentObject.getAttribute('destination');

        that.createCacheEntry(getCurrentObject.id,isPaperObject,currentName,dest);
     } 

      // now: data is loaded in any case
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
   ObjectManager.loadRoom(dest, false, 'left');
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