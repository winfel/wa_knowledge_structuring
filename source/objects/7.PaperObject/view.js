/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PaperObject.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

PaperObject.getIconText = function() {
    return this.getAttribute("name");
}
