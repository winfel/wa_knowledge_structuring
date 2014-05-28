/* 
 * Sidebar: tabs
 */
GUI.tabs = new function() {
  var tabs, tabs_content;


  /* Content of tabs sidebar*/

  /**
   * 
   * @returns {undefined}
   */
  this.init = function() {
    console.log("GUI.tabs initialized");
    var that = this;

    this.tabs = $("#tabs");
    this.tabsContent = $("#tabs_content");
  };

 
};