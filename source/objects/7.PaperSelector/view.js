/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PaperSelector.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

PaperSelector.getIconText = function() {
    return this.getAttribute("name");
}
