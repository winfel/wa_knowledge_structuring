/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

ExportObject.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	this.setViewWidth(64);
	this.setViewHeight(64);

	var rep = this.getRepresentation();

	//$(rep).find("text").remove();

	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	this.createPixelMap();
};

/* get the width of the objects bounding box */
ExportObject.getViewBoundingBoxWidth = function() {
	//return 64;
	return GeneralObject.getViewBoundingBoxWidth.call(this);
};

/* get the height of the objects bounding box */
ExportObject.getViewBoundingBoxHeight = function() {
	//return 64;
	return GeneralObject.getViewBoundingBoxHeight.call(this);
};

ExportObject.getStatusIcon = function() {
	return this.getIconPath();
/*	if (this.hasContent() == false) {
		return this.getIconPath() + "/upload";
	} else if (this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {	
		var typeIcon = "file";
		var mimeType = this.getAttribute("mimeType");
	
		//TODO: extend
		if (mimeType) {
			if (mimeType.indexOf('image') != -1) typeIcon = "image";
			if (mimeType.indexOf('msexcel') != -1 || mimeType.indexOf('ms-excel') != -1 || mimeType.indexOf('officedocument.spreadsheetml') != -1) typeIcon = "excel";
			if (mimeType == 'application/zip') typeIcon = "archive";
			if (mimeType == 'application/pdf') typeIcon = "pdf";
			if (mimeType.indexOf('mspowerpoint') != -1 || mimeType.indexOf('ms-powerpoint') != -1 || mimeType.indexOf('officedocument.presentationml') != -1) typeIcon = "powerpoint";
			if (mimeType.indexOf('text') != -1) typeIcon = "text";
			if (mimeType.indexOf('msword') != -1 || mimeType.indexOf('ms-word') != -1 || mimeType.indexOf('officedocument.wordprocessingml') != -1) typeIcon = "word";
		}

		return this.getIconPath() + "/" + typeIcon;
	} else {
		return this.getPreviewContentURL();
	} */
};

ExportObject.getIconText = function() {
	return false;
};

