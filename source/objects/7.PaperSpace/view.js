/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PaperSpace.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

PaperSpace.getIconText = function() {
    return this.getAttribute("name");
}
