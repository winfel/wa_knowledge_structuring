/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @return {undefined}
*/
Subroom.getStatusIcon = function() {
	return this.getIconPath() + "/link";
}

/**
* @return {undefined}
*/
Subroom.getIconText = function() {
    return this.getAttribute("name");
}
