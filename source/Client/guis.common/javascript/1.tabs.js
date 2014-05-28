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
  var currentlyStoredTab = ["Public#Public"];
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

  this.addTab = function(nameOfTheTab,linkTo){
  	currentlyStoredTab.push(nameOfTheTab+"#"+linkTo);
  };

  this.redrawTabContent = function(){
    $("#tabs_content").html("");

    var upperUl = $("<ul>").appendTo( "#tabs_content" );
    currentlyStoredTab.forEach(function(item){
      var token = item.split("#");

      var currentLi = $("<li>"+token[0]+"</li>").on( "click", function () {
			ObjectManager.loadRoom(token[1], false, 'left');
		}).appendTo( upperUl );

      internalID++;
    });
  };
};