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
    var $rep = $(rep);
    
    var body = document.createElement("body");
	$rep.attr({ id: this.getAttribute('id') });
	$rep.append(body);
	
    var pWriter = $(body).addClass('paperWriter');
    pWriter.append("<iframe></iframe>");
    
    var iFrame = $(pWriter.find("iframe"));
    var iframe_loaded = false;
    iFrame.one('load', function(){
		iframe_loaded = true;
    });

    iFrame.attr('src', 'http://' + window.location.hostname + ':9001/p/' + this.getAttribute('paper') + '?userName=' +  encodeURIComponent(GUI.userid));
	//iFrame.attr('src', 'http://beta.etherpad.org/webArenaDemo' + this.getAttribute('paper') + '?showControls=true&showChat=false&showLineNumbers=true&useMonospaceFont=false');

	window.setTimeout(function(){
		if(!iframe_loaded) {
			alert('Maybe etherpad is not installed / started at this server...');
		}
	}, 20000);

	this.initGUI(rep);
	
	return rep;
}
