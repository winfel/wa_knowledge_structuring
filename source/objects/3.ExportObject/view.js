/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
var POSITION_AWARENESS_DISTANCE = 100;

ExportObject.draw = function(external) {
	var that = this;
	GeneralObject.draw.call(this,external);

	this.setViewWidth(60*2);
	this.setViewHeight(60*2);

	var rep = this.getRepresentation();
	var inputPapers = that.getAttribute('inputPapers');

	var connectorH = (inputPapers.length + 1) * 80;
	$(rep).find('.PaperConnector').attr('points', 
		[[-45,60-connectorH/2], [-10,60-connectorH/2], [-10,60], [-5,60], [-10,60], [-10,60+connectorH/2], [-45,60+connectorH/2]]
	);

	var px = this.get('x')-18 - 64;
	var py = this.get('y') + 60-connectorH/2 + 8;
	var inventory = this.getRoom().getInventory();

	inputPapers.forEach(function(p,i) {
		inventory[p].setAttribute('x', px);
		inventory[p].setAttribute('y', py + 80 * i);
	});

	if(inputPapers.length>0) {
		$(rep).find('.ExportOption').show();
	}
	else {
		$(rep).find('.ExportOption').hide();
	}

	//$(rep).find("text").remove();

	//if (!$(rep).hasClass("selected")) {
	//	$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
	//	$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	//}

	//this.createPixelMap();
};

/**
 * draws a line to each PaperObject the ExportObject is aware of
 */
ExportObject.drawPaperConnectors = function() {
	var that = this;
	var rep = this.getRepresentation();
	// calculate center and radius of ExportObject
	var cw = this.getViewWidth() / 2,
		ch = this.getViewHeight() / 2,
		cx = this.getViewX() + cw,
		cy = this.getViewY() + ch,
		r = Math.max(cw, ch);

	this.awareOfPapers = new Array();
	$(rep).find('.PaperConnectors').remove();
	this.getSurroundingPapers().forEach(function(i) {
		// calculate center and distance of objects
		var p_cw = i.getViewWidth() / 2,
			p_ch = i.getViewHeight() / 2,
			p_cx = i.getViewX() + p_cw,
			p_cy = i.getViewY() + p_ch,
			d = Math.sqrt(Math.pow(p_cx-cx, 2) + Math.pow(p_cy-cy, 2));
		if(d-Math.max(p_cw, p_ch)-r < POSITION_AWARENESS_DISTANCE) {
			that.awareOfPapers.push(i);
			// calculate distance from rectangular border to center of PaperObject
			var p_rx = Math.min(p_cw, Math.abs((p_cx-cx) / (p_cy-cy) * p_ch)),
				p_ry = Math.min(p_ch, Math.abs((p_cy-cy) / (p_cx-cx) * p_cw)),
				p_r = Math.sqrt(p_rx*p_rx + p_ry*p_ry);
			$(GUI.svg.line(rep,
				cw,ch, //start
				p_cx-cx+cw,p_cy-cy+ch, //end
				{
					strokeWidth: 5,
					stroke:'black',
					opacity:0.5,
					'stroke-dasharray': '0,'+r+','+(d-p_r-r)+',9999',
					//'stroke-dashoffset': -r,
				}))
			.addClass('PaperConnectors');
		}
	});

	if(this.awareOfPapers.length>0) {
		$(rep).find('.ExportOption').show();
	}
	else {
		$(rep).find('.ExportOption').hide();
	}
};

/**
 * listen to moves to update PaperConnectors
 */
ExportObject.moveHandler = function() {
	GeneralObject.moveHandler.call(this);
	//this.drawPaperConnectors();
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
	var newParent = GUI.svg.group(parent, this.getAttribute('id'));

	var radius = 60; // Math.min(this.getViewWidth(), this.getViewHeight())/2;
	var rep = GUI.svg.circle(newParent, radius, radius, radius, {
		fill: '#D6E8B0', 
		stroke: '#91B34C',
		strokeWidth: 2
	});
	GUI.svg.image(newParent, radius-32,radius-32, 64,64, this.getIconPath());

	$(GUI.svg.polyline(newParent, [[-45,20], [-10,20], [-10,60], [-5,60], [-10,60], [-10,100], [-45,100]], {
		fill: 'transparent',
		stroke: 'gray',
		strokeWidth: 1,
	}))
	.addClass('PaperConnector');

	this.createExportIcons(newParent);

	return newParent;
};

/**
 * creates an icon for each export option
 */
ExportObject.createExportIcons = function(rep) {
	var that = this;
	//var rep = this.getRepresentation();
	// TODO: get export options not from attribute
	var exportOptions = this.getAttributes().exportFormat.options;
	var exportIconPaths = new Array();
	for(var i in exportOptions) {
		//exportIconPaths[i] = this.getIconPath() + '/' + exportOptions[i];
		exportIconPaths[i] = '/guis.common/images/fileicons/' + exportOptions[i].substr(0,5) + '.png';
	}

	var newRadius = Math.max(23, 23 / Math.sin(Math.PI/exportIconPaths.length)),
		cx = 60, cy = 60;
	for(var i in exportOptions) {
		// new group for that icon
		var box = GUI.svg.group(rep, {
			transform: 'translate(' +
				(cx + Math.sin(Math.PI/exportIconPaths.length * 2 * i) * newRadius - 16) + ',' +
				(cy + Math.cos(Math.PI/exportIconPaths.length * 2 * i) * newRadius - 16) + ')',
			width: 32,
			height: 32,
		});
		// a rect for border
		GUI.svg.rect(box,
			0,
			0,
			32,32, {
				fill: 'transparent',
			});
		// the icon
		GUI.svg.image(box,
			0,0,
			32,32, exportIconPaths[i]);

		// add funcionality
		$(box)
		.addClass('ExportOption')
		.hide()
		.data('exportFormat', exportOptions[i])
		.hover(function(event) {
			$('rect', this).attr({
				stroke: 'grey',
				'stroke-width': (event.type=='mouseenter'?'2px':'0'),
			});
		})
		.mousedown(function(event) {
			var paperstring = '';
			that.getAttribute('inputPapers').forEach(function(paper) {
				paperstring += paper + '\n';
			});
			window.alert('Export\n' + paperstring + 'to ' + $(this).data('exportFormat'));
			event.stopPropagation();
		});

	}
};
