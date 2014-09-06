/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @function getIconText
* @return {undefined}
*/
Exit.getIconText = function() {
	return this.getAttribute("name");
}

/**
* @function getStatusIcon
* @return {undefined}
*/
Exit.getStatusIcon = function() {
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.getIconPath() + "/select";
	} else {
		return this.getIconPath() + "/link";
	}
}
