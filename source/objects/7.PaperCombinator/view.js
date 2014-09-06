/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @return {undefined}
*/
PaperCombinator.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

/**
* @return {undefined}
*/
PaperCombinator.getIconText = function() {
    return this.getAttribute("name");
}
