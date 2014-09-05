/**
* @param obj
*/
Subroom.filterObject = function(obj) {
	
}

/**
* @param id
* @param name
*/
Subroom.selectFile = function(id, name) {
	
}

/**
* return boolean
*/
Subroom.hasContent=function(){
	return true;
}

Subroom.deleteIt=function() {
	var destination = this.getAttribute("destination");

	this.remove();
	
	if (destination !== undefined) {
		alert(this.translate(GUI.currentLanguage, "You deleted a subroom")
			+'\n'+this.translate(GUI.currentLanguage, "This operation only deletes the link,")
			+'\n'+this.translate(GUI.currentLanguage, "the objects contained are preserved")
			+'\n'+this.translate(GUI.currentLanguage, "They are still available in room")
			+' '+destination+'.');
	}
}