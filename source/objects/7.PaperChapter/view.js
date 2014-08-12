/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PaperChapter.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

PaperChapter.getIconText = function() {
    return this.getAttribute("name");
}
