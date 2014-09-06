/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @return {undefined}
*/
PaperSelector.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

/**
* @return {undefined}
*/
PaperSelector.getIconText = function() {
    return this.getAttribute("name");
}
