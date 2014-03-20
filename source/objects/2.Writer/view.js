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
	var rep = GUI.svg.other(parent, "foreignObject");
    rep.dataObject = this;
    
	var div = document.createElement("div");
	var $rep = $(rep);
	$rep.attr({ id: this.getAttribute('id') });
	$rep.append(div);
	
    var pWriter = $(div).attr('id', 'paperWriter');
	pWriter.css(
    	{
    		'border':'2px solid black',
    		'padding':'3px',
    		'background-color':'#FFFFFF',
    		'width':'90%',
            'height':'80%'
    	});
    pWriter.append("<iframe></iframe>");
    
    var iFrame = $(pWriter.find("iframe"));
    iFrame.css(
    	{
    		'width':'100%',
    		'height':'60%',
    		'padding':'0',
    		'border':'0'
    	});
    //iFrame.attr('src', 'http://localhost:9001/p/' + this.getAttribute('paper'));
	iFrame.attr('src', 'http://beta.etherpad.org/webArenaDemo' + this.getAttribute('paper') + '?showControls=true&showChat=false&showLineNumbers=true&useMonospaceFont=false');

	this.initGUI(rep);
	
	return rep;
	
}
