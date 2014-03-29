/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var that = this;

  this.init = function() {
    console.log("GUI.rightmanager initialized");
  };

  this.updateContent = function(theObject) {
	  
	  /* TODO: Display selected object information */

	  /* Get Roles of selected object and write the roles into combobox */
	  Modules.UserManager.getRoles({id:1}, GUI.username, function(roles){
		  $("#roles").empty();
		  roles.forEach(function(item){
			  $("#roles").append("<option>"+item.name+"</option>");
          });		 
	  });
	  
	  /* TODO: Get rights */
	  
	  
	  /* TODO: Get users */
	  
  };
};

