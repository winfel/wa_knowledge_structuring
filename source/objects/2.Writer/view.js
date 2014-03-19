/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Writer.draw=function(external){

	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));

	$(rep).attr("layer", this.getAttribute('layer'));

	var that=this;
	
	this.updateContent();
	
}


Writer.updateContent = function() {
	
	var rep=this.getRepresentation();
	
	this.getContentAsString(function(text){

		if(text!=that.oldContent){
			$(rep).find("body").html(text);
		}
		
		that.oldContent=text;
		
	});
	
}


Writer.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");

	$(rep).append(body);
	$(rep).find("body").css(
	{
		'border':'2px solid black',
		'padding':'3px',
		'background-color':'#FFFFFF'
	});
	$(rep).find("body").append("<iframe></iframe>");
	$(rep).find("iframe").css(
	{
		'width':'100%',
		'height':'100%',
		'padding':'0',
		'border':'0'
	});
	$(rep).find("iframe").attr('src', 'http://beta.etherpad.org/webArenaDemo?showControls=true&showChat=false&showLineNumbers=true&useMonospaceFont=false');
	//$(rep).find("iframe").attr('src', this.getAttribute('paper'));

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}
