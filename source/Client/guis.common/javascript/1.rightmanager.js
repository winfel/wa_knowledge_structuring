/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var that = this;

  this.init = function() {
    console.log("GUI.rightmanager initialized");
    
    /* Add user event */
    $("#rmNewUserButton").click(function(event) {
    	var username = $("#rmNewUserTextfield").val();
    	    	
    	var selectedObjects = ObjectManager.getSelected()[0];
    	
    	Modules.UserManager.addUser("role",selectedObjects,username);
    });    
    
    /* Add role event */
    $("#rmNewRoleButton").click(function(event) {
    	var role = $("#rmNewRoleTextfield").val();
    	console.log(role);
    });
    
  };

  this.updateContent = function(theObject) {
	  
	  console.log(theObject);
	  
	  /* Display selected object information */
	  
	 var selectedObjects = ObjectManager.getSelected();
	  
	 /* Depending on how many objects are selected display only object information or everything */
	 
	 if(selectedObjects.length > 1){
		 $("#rm_rolesHead").hide();
		 $("#rm_rolesPage").hide();
		 $("#rm_rightsHead").hide();
		 $("#rm_rightsPage").hide();	
		 $("#rm_usersHead").hide();
		 $("#rm_usersPage").hide();
		 
		 $("#rm_ID").empty();
		 $("#rm_ID").append("Verschiedene Werte");
		 $("#rm_Name").empty();
		 $("#rm_Name").append("Verschiedene Werte");
		 $("#rm_Type").empty();
		 $("#rm_Type").append("Verschiedene Werte");
	 }
	 
	 else{		 
		 
		 $("#rm_rolesHead").show();
		 $("#rm_rolesPage").show();
		 $("#rm_rightsHead").show();
		 $("#rm_rightsPage").show();	
		 $("#rm_usersHead").show();
		 $("#rm_usersPage").show();
		 
		 $("#rm_ID").empty();
		 $("#rm_ID").append(theObject.id);
		 $("#rm_Name").empty();
		 $("#rm_Name").append(theObject.getAttribute("name"));
		 $("#rm_Type").empty();
		 $("#rm_Type").append(theObject.type);
	 
		 
		 
		  /* Get Roles of selected object and write the roles into combobox */
		  Modules.UserManager.getRoles({id:1}, GUI.username, function(roles){
			  $("#rm_roles").empty();
			  roles.forEach(function(item){
				  $("#rm_roles").append("<div class=\"jDesktopInspector_element\"><input type=\"radio\" value=\""+item.name+"\" name=\"rm_rolesRadio\">"+item.name+"</div>");
	          });		 
		  });
		  
		  /* TODO: Get rights */
		  
		  
		  
		  /* TODO: Get users */
	 }
	 
  };
};

