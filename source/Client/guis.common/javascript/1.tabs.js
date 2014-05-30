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
    var that = this;

    /* try to load the tab data from db */
    Modules.UserManager.getTabCache(function(data){
      currentlyStoredTab = data.objectlist;
      cache = data.cache;

      that.redrawTabContent();
    });

    /* init the remaining stuff */
    internalID = 0;

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

    // Note: we need to draw first because the cache gets updated in the drawing process
    this.redrawTabContent();

    this.storeCacheInDB();
  };

  /** 
  * Removes a tab from the sidebar
  * 
  **/
  this.removeTab = function(id){
  	var findID = -1;
  	findID = currentlyStoredTab.indexOf(id);

  	if(findID > -1){
      currentlyStoredTab.splice(findID,1);
  	}

    // Note: we need to draw first because the cache gets updated in the drawing process
  	this.redrawTabContent();

    this.storeCacheInDB();
  };

  /** 
  * The function creates a new cache entry. If there is already an entry with that id
  * it does nothing.
  *
  **/
  this.createCacheEntry = function(id, isPO, name, dest){
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

  this.updateNameOfTabWithID = function(id, name){
   cache.forEach(function(tab){
      if(tab.id == id){
         var newtab = {id:id,
            isPO: tab.isPO,
            name: name,
            dest: tab.dest};

         var getIndex = cache.indexOf(tab);

         cache[getIndex] = newtab;
      }
   });

   this.redrawTabContent();

   /* FIXME: this is the atm. lazy solution -> write a completely new cash to db*/
   this.storeCacheInDB();
  };

  /**
  *  The function updates the cache if an object has been changed from the outside (i.e., 
  *   the name has been changed)-
  *
  **/
  this.updateCache = function(object){
   console.log("update!");
   var objectIsUsedInCache = false;
   var index = -1;
   cache.forEach(function(entry){
      if(entry == object.id){
         objectIsUsedInCache = true;
         index = cache.indexOf(entry);
      }
   });

   if(objectIsUsedInCache){
     var newObject = {id:object.id,
      isPO:(object.type == 'PaperObject'),
      name:object.name,
      dest:object.getAttribute('destination')};

      cache[index] = newObject;  
   }

  };

  /**
  *  Loads important object data from the cache
  *
  **/
  this.getFromCache = function(id){
    var returnVal;
    cache.forEach(function(entryInCache){
      if(entryInCache.id == id){
        returnVal = entryInCache;
      }
    });

    return returnVal;
  }

  /**
  *   This function stores the tabs for the current user with the cache
  *   in the database
  *
  */
  this.storeCacheInDB = function(){
   Modules.UserManager.storeTabCache(currentlyStoredTab,cache);
  };

  /**
  * Redraws the content of the tab sidebar
  *
  **/
  this.redrawTabContent = function(){
    $("#tabs_content").html(""); // clear
    
    var that = this;

    var upperUl = $("<ul style='list-style-type:none;'>").appendTo( "#tabs_content" );
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

        // if possible: update
        that.updateCache(getCurrentObject);
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

   $("<hr>").appendTo(upperUl);

  var currentLi = $("<li>"+drawName+"</li>").on( "click", function () {
   ObjectManager.loadRoom(dest, false, 'left');
 }).appendTo( upperUl );



  if(!namesWithoutDeletePermission.indexOf(currentName) == 0){
   var delToken = $("<i>").html("<img src='/guis.common/images/oxygen/16x16/actions/edit-delete_grey.png'>").on( "click", function (e) {
    e.stopPropagation();
    that.removeTab(item)
  }).appendTo(currentLi);
 }

 internalID++;

});
};
};