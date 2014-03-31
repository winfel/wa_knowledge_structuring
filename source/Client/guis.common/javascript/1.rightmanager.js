/* 
 * Sidebar: Right Manager
 */

GUI.rightmanager = new function() {
  var that = this;
  
  /* Content of rightmanager sidebar*/
  var rm_Content;

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
    
    /* Initially no object is selected */    
    rm_Content = $('#rightmanager').html();
    $("#rightmanager").replaceWith("<div class = \"jDesktopInspector\" id=\"rightmanager\">" +
			"<div class=\"jDesktopInspector_main\">" +
				"<div class=\"jDesktopInspector_pageHead\">Object:</div>" +
				"<div class=\"jDesktopInspector_page jDesktopInspector_page_0\">" +
					"<div class=\"jDesktopInspector_section\">" +
						"<div class=\"jDesktopInspector_element\">No Object selected!</div>" +
					"</div>" +
				"</div>" +
			"</div>" +
		"</div>");
    
  };

  this.updateContent = function(theObject) {
	  
	  /* Display selected object information */
	  
	 var selectedObjects = ObjectManager.getSelected();
	  
	 /* Depending on how many objects are selected display nothing, only object information or everything */
	 
	 	/* No object selected */
		if(selectedObjects.length == 0){
			
			/* Store current content of rightmanager sidebar and replace it */
			rm_Content = $('#rightmanager').html();
			$("#rightmanager").replaceWith("<div class = \"jDesktopInspector\" id=\"rightmanager\">" +
												"<div class=\"jDesktopInspector_main\">" +
													"<div class=\"jDesktopInspector_pageHead\">Object:</div>" +
													"<div class=\"jDesktopInspector_page jDesktopInspector_page_0\">" +
														"<div class=\"jDesktopInspector_section\">" +
															"<div class=\"jDesktopInspector_element\">No Object selected!</div>" +
														"</div>" +
													"</div>" +
												"</div>" +
											"</div>");
		
		}
		
		/* More than one object selected */
		else if(selectedObjects.length > 1){			
			
			 /* Replace current content of rightmanager sidebar */
			 $("#rightmanager").replaceWith("<div id=\"rightmanager\" class = \"jDesktopInspector\">"+rm_Content+"</div>");			 
			
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
		 
		/* Exactly one object selected */
		 else{
			 
			 /* Replace current content of rightmanager sidebar */
			 $("#rightmanager").replaceWith("<div id=\"rightmanager\" class = \"jDesktopInspector\">"+rm_Content+"</div>");
			 			 
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

