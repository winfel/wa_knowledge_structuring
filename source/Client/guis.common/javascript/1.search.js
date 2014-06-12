
/* 
 * Sidebar: Right Manager
 */
GUI.search = new function() {
      console.log("GUI.search initialized cc");

   
  this.init = function() {
    console.log("GUI.search initialized");
   var that = GUI.search;
   
   var span = $("<span>");
   span.html("ssss");
   
   this.content = $("#span");
    // Add user event
    $("#searchButton").click(function() {
      //openUserDialog();
	  
	  console.log("hereeeeeee",$("#searchFileId").val());
	  
	  var inventory = Modules.ObjectManager.getInventory();
	  
	  	 for (var i in inventory){
    	var candidate=inventory[i];
			console.log('dead'+candidate.getAttribute('type'));

    	if (candidate.getAttribute('type')=='File') {
		console.log('deadvv'+candidate.getAttribute('name'));
		candidate.setAttribute('visible',false);
		if (candidate.getAttribute('name').indexOf($("#searchFileId").val())>=0){
		console.log('Insideeeee');
		candidate.setAttribute('visible',true);
		console.log('Insideeeee1');
		}
		}
    }
    });

  };
}
  
