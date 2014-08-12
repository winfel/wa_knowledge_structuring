/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PaperCombinator.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

PaperCombinator.getIconText = function() {
    return this.getAttribute("name");
}
