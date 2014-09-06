/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @function getStatusIcon
* @return {undefined}
*/
PaperChapter.getStatusIcon = function() {
	return this.getIconPath() + "/paper";
}

/**
* @return {undefined}
*/
PaperChapter.getIconText = function() {
    return this.getAttribute("name");
}

/**
* @param external
*/
PaperChapter.draw=function(external){
	
	var rep=this.getRepresentation();

	this.drawDimensions(external);
	if (this.getAttribute("verybigIcon")) {
		this.setViewWidth(VERY_BIG_ICON);
		this.setViewHeight(VERY_BIG_ICON);
	}
	else if (this.getAttribute("bigIcon")) {
		this.setViewWidth(64);
		this.setViewHeight(64);
	} else {
		this.setViewWidth(32);
		this.setViewHeight(32);
	}

	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (this.getIconText()) this.renderText(this.getIconText());

	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}

	$(rep).find('.chapNr').remove();
	var factor = this.getViewWidth() / 64;
	$(GUI.svg.text(rep, 19 * factor,50 * factor , GUI.svg.createText().string(this.getAttribute('order')))).addClass('chapNr');

	if (!$(rep).hasClass("webarena_ghost")) {
		
		if (this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			
			if (this.getAttribute("visible")) {
				
				if (external) {
					if ($(rep).css("visibility") == "hidden") {
						/* fade in */
						$(rep).css("opacity", 0);
						$(rep).css("visibility", "visible");
						$(rep).animate({
							"opacity" : 1
						}, {queue:false, duration:500});
					}
				} else {
					$(rep).css("visibility", "visible");
				}
				
			} else {
				
				if (external) {
					if ($(rep).css("visibility") == "visible") {
						/* fade out */
						$(rep).css("opacity", 1);
						$(rep).animate({
							"opacity" : 0
						}, {queue:false, 
							complete:function() {
								$(rep).css("visibility", "hidden");
							}
							});
					}
				} else {
					$(rep).css("visibility", "hidden");
				}
				
			}
			
		}

		
	}

	this.createPixelMap();

	/* run the re-ordering algorithm */
	this.execute();
}