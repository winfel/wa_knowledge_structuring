/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
	
Highlight.draw=function(external){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	$(rep).attr("fill", this.getAttribute('fillcolor'));

	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
				$(rep).attr("height", 20);
				$(rep).css("opacity", 0.5);

	}

}


Highlight.createRepresentation = function(parent) {

	var rep = GUI.svg.rect(parent,
		10, //x
		10, //y
		10, //width
		10 //height
	);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}

Highlight.dblclickHandler = function(event) {
  GeneralObject.dblclickHandler.call(this, event);
  this.performAction("AddMarkup", this);
};