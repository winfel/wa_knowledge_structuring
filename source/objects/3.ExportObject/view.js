/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

ExportObject.draw = function(external) {
	var that = this;
	GeneralObject.draw.call(this,external);
	
	this.setViewWidth(60*2);
	this.setViewHeight(60*2);

	var rep = this.getRepresentation();

	//$(rep).find("text").remove();

	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	//this.createPixelMap();
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
};

ExportObject.getIconText = function() {
	return false;
};

ExportObject.createRepresentation = function(parent) {
	var that = this;
	//console.log('ExportObject.createRepresentation');
	//var rep2 = IconObject.createRepresentation.call(this, parent);
	var newParent = GUI.svg.group(parent, this.getAttribute('id'));
//	var rep = GUI.svg.group(parent,this.getAttribute('id'));

	var rep = GUI.svg.circle(newParent, 60, 60, 60, {
		fill: '#D6E8B0', 
		stroke: '#91B34C',
		strokeWidth: 2
	});
	GUI.svg.image(newParent, 28,28, 64,64, this.getIconPath());
	//GUI.svg.add(newParent, IconObject.createRepresentation.call(this, newParent));

/*	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));*/

	//this.initGUI(rep);


	return newParent;
	
};