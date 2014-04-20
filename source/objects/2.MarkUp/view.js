/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

MarkUp.draw=function(external){

	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));

	var linesize = this.getAttribute('linesize')-1+1;
	
	if (linesize > 0) {
		
		$(rep).find("body>div").css("border-color", this.getAttribute('linecolor'));
		$(rep).find("body>div").css("border-width", "2px");
		$(rep).find("body>div").css("border-style", "solid");

				$(rep).find("body>div").css("border-radius", "20px");
	//$(rep).find("body>svg").css("width",this.getAttribute('width'));
		//$(rep).find("body>div").css("height", this.getAttribute('height')-50);
//$(rep)("actionsheet_arrow").css("left", this.getAttribute('height')/2);
								//$(rep).find("body>svg>path").css("d","M105 60 L125 80 L125 60 Z");

		$(rep).find("body>div>div").css("padding", "5px");
		
	} else {
		
		$(rep).find("body>div").css("border-color", "none");
		$(rep).find("body>div").css("border-width", "2px");
		$(rep).find("body>div").css("border-style", "solid");
				$(rep).find("body>div").css("border-radius", "25px");
						//$(rep).find("body>div").css("height", this.getAttribute('height')-50);

				//$(rep)("actionsheet_arrow").css("left", this.getAttribute('height')/2);

	//$(rep).find("body>svg").css("width",this.getAttribute('width'));
		$(rep).find("body").css("height",this.getAttribute('height'));
								//$(rep).find("body>svg>path").css("d","M105 60 L125 80 L125 60 Z");
						//$(rep).find("body>div").css("border-radius", "25px");

		$(rep).find("body>div>div").css("padding", "0px");
		
	}
	
	$(rep).find("body>div").css("background-color", this.getAttribute('fillcolor'));
	
	$(rep).find("body").css("font-size", this.getAttribute('font-size'));
	$(rep).find("body").css("font-family", this.getAttribute('font-family'));
	$(rep).find("body").css("color", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}

	var that=this;
	
	this.getContentAsString(function(text){

		if(text!=that.oldContent){

            text = htmlEncode(text);

			$(rep).find("body>div>div").html(text);
		}
		
		that.oldContent=text;
		
	});
	
	this.updateInnerHeight();
    this.adjustControls();
}


MarkUp.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).find("body").css("height", ($(rep).attr("height"))+"px");
	$(rep).find("body>div").css("height", ($(rep).attr("height")-(2*parseInt(this.getAttribute('linesize'))))+"px");
	
}


MarkUp.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	$(body).html('<div class="markup-border wordwrap"><div ></div></div>');

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}



MarkUp.editText = function() {
	
	var passThrough = { 
		"resizable" : true,  
		resizeStart : function(event,ui) { 
			$('textarea[name=textedit]').css('height', '100%'); 
		} 
	};
	GUI.editText(this, true, this.getViewWidth(), this.getViewHeight(), passThrough);

}


MarkUp.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
MarkUp.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
	if (attribute === 'font-color') {
		var fontcolor = value;
	} else {
		var fontcolor = this.getAttribute('font-color');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if ((fillcolor === 'transparent' && linecolor === 'transparent' && fontcolor === 'transparent') || (fillcolor === 'transparent' && linecolor === 'transparent' && this.getContentAsString().trim() === '')) {
		return false;
	} else return true;
}
