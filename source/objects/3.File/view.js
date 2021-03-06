/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

/**
* @function draw
* @param external
*/
File.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	if (this.hasContent() == false || this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {
		
		if (this.getAttribute("bigIcon")) {
			this.setViewWidth(64);
			this.setViewHeight(64);
		} else {
			this.setViewWidth(32);
			this.setViewHeight(32);
		}
		
	}
	
	var rep = this.getRepresentation();

    if (this.getIconText()) {
        this.renderText(this.getIconText());
    } else {
        $(rep).find("text").remove();
    }
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	var l = 64 * Math.sqrt(2) * Math.PI,
		percent = this.getAttribute('progress') || 0.0;
	if(percent<1) {
		$(rep).find("circle.progress").attr('stroke-opacity', 1);
	}
	$(rep).find("circle.progress").animate({svgStrokeDashOffset:l-l*percent}, 1500);
	if(percent==1) {
		$(rep).find("circle.progress").animate({svgStrokeOpacity: 0}, 1500);
	}
	this.createPixelMap();
}

/**
* @function getViewBoundingBoxWidth
* @return {undefined}
* Get the width of the objects bounding box
**/
File.getViewBoundingBoxWidth = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		if (this.getAttribute("bigIcon")) {
			return 64;
		} else return 32;
	} else {
		return GeneralObject.getViewBoundingBoxWidth.call(this);
	}
}


/**
* @function getViewBoundingBoxHeight
* @return {undefined}
* Get the height of the objects bounding box
**/
File.getViewBoundingBoxHeight = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		if (this.getAttribute("bigIcon")) {
			return 64;
		} else return 32;
	} else {
		return GeneralObject.getViewBoundingBoxHeight.call(this);
	}
}

/**
* @return {undefined}
*/
File.getStatusIcon = function() {
	if (this.hasContent() == false) {
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
			if (mimeType.indexOf('html') != -1) typeIcon = "html";
			if (mimeType.indexOf('audio') != -1) typeIcon = "audio";
			if (mimeType.indexOf('video') != -1) typeIcon = "video";
			if (mimeType.indexOf('msword') != -1 || mimeType.indexOf('ms-word') != -1 || mimeType.indexOf('officedocument.wordprocessingml') != -1) typeIcon = "word";
		}

		return this.getIconPath() + "/" + typeIcon;
	} else {
		return this.getPreviewContentURL();
	}
}

/**
* @return {boolean}
*/
File.getIconText = function() {
    if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
        return this.getAttribute("name");
    } else return false;
}


File.setTag = function() {
	GUI.tagAssigner.open(this, 600, 600, false);	
}

/**
* @param parent
* @return {undefined}
*/
File.createRepresentation = function(parent) {

	var rep = IconObject.createRepresentation.call(this, parent);

	var size = 32;
	if (this.getAttribute("bigIcon")) {
		size = 64;
	}
/*	var percent = 0.10,
		a = (90 - 360 * percent) * Math.PI / 180,
		r = size / Math.sqrt(2),
		x = size/2 + r * Math.cos(a),
		y = size/2 - r * Math.sin(a);
	var progressCircle = GUI.svg.path(rep, GUI.svg
		.createPath()
		.move(size / 2, size / 2 - r)
		.arc(r, r, 0, percent > 0.5, true, x,y)
	, {
		fill: 'transparent',
		stroke: 'orange',
		strokeWidth: 5,
	});*/
	var r = size / Math.sqrt(2),
		l = 2 * Math.PI * r;
	var progressCircle = GUI.svg.circle(rep, size/2,size/2, r
	, {
		class: 'progress',
		fill: 'transparent',
		stroke: 'orange',
		strokeWidth: 5,
		'stroke-dasharray': l,
		'stroke-dashoffset': l,
		'stroke-opacity' : this.getAttribute('progress')==1?0:1,
		transform: 'rotate(-90,'+(size/2)+','+(size/2)+')',
	});
	//$(progressCircle).attr("fill", "transparent");
	//$(progressCircle).animate({svgStrokeDashOffset:l-l*percent}, 5000);
	//$(progressCircle).addClass("borderCircle");

	//this.initGUI(rep);
	
	return rep;
	
}
