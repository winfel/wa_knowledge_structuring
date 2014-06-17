/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

Container.draw=function(external){

	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));
			
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}
	
	var that=this;
		
	this.updateInnerHeight();
    this.adjustControls();
}


Container.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).find("body").css("height", ($(rep).attr("height"))+"px");
	$(rep).find("body").css("width", ($(rep).attr("width"))+"px");
	$(rep).css("height", ($(rep).attr("height"))+"px");
	$(rep).css("width", ($(rep).attr("width"))+"px");

	var h = parseInt($(rep).attr("height"));
	var w = parseInt($(rep).attr("width"));
	$(rep).find("div").css("height", h-25+"px");
	$(rep).find("div").css("width", w-25+"px");
	
}


Container.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	Container.drawContent(rep);
	
	return rep;
	
}

Container.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

Container.drawContent = function(rep){

	//delete old content	
	$(rep).find("#containment-wrapper").remove();
		
	//create new content
	$(	'<p font-size="24px">Name of container<img src="/guis.common/images/icon-lupe.png" width="30" height="30"></p>'+
		'<form action="select.htm"><select name="ordering">'+
		      '<option>alphabetic asc.</option>'+
		      '<option>alphabetic desc.</option>'+
		      '<option>size asc.</option>'+
		      '<option>size desc.</option>'+
		      '<option>type</option>'+
    		'</select></form>'+
			'<div id="containment-wrapper">'+
				'<ul id="sortablefiles">'+
					'<li class="ui-state-default">1</li>'+
					'<li class="ui-state-default">2</li>'+
					'<li class="ui-state-default">3</li>'+
					'<li class="ui-state-default">4</li>'+
					'<li class="ui-state-default">5</li>'+
					'<li class="ui-state-default">6</li>'+
					'<li class="ui-state-default">7</li>'+
					'<li class="ui-state-default">8</li>'+
					'<li class="ui-state-default">9</li>'+
					'<li class="ui-state-default">10</li>'+
					'<li class="ui-state-default">11</li>'+
					'<li class="ui-state-default">12</li>'+
					'<li class="ui-state-default">13</li>'+
					'<li class="ui-state-default">14</li>'+
				'</ul>'+
			'</div>'
	).appendTo($(rep).children());

	//$(rep).find("#sortablefiles").sortable({ containment: "#containment-wrapper" });
    $(rep).find("#sortablefiles").disableSelection();

	$(rep).find("#sortablefiles").css("list-style-type", "none");
	$(rep).find("#sortablefiles").css("margin", "10px");
	$(rep).find("#sortablefiles").css("padding", "10px");

	$(rep).find("#sortablefiles li").css("margin", "3px 3px 3px 0");
	$(rep).find("#sortablefiles li").css("padding", "1px");
	$(rep).find("#sortablefiles li").css("float", "left");
	$(rep).find("#sortablefiles li").css("width", "90px");
	$(rep).find("#sortablefiles li").css("height", "90px");
	$(rep).find("#sortablefiles li").css("line-height", "90px");
	$(rep).find("#sortablefiles li").css("font-size", "4em");
	$(rep).find("#sortablefiles li").css("text-align", "center");
	$(rep).find("#sortablefiles li").css("vertical-align", "middle");
 
	$(rep).find("#containment-wrapper").css("width", "450px");
	$(rep).find("#containment-wrapper").css("height", "300px");
	$(rep).find("#containment-wrapper").css("border", "2px solid #ccc");
	$(rep).find("#containment-wrapper").css("padding", "10px");
	$(rep).find("#containment-wrapper").css("overflow", "auto");
	$(rep).find("#containername").css("background", "red !important");
	
	

}