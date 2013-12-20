/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

HtmlStars.isFirstDraw = true;

HtmlStars.updateContent = function() {
	var self = this;

    if (HtmlStars.isFirstDraw) {
        self.setAttribute('width', 185);
        self.isFirstDraw = false;
        console.log('first draw...');
    }

	var rep=this.getRepresentation();

    var idd=this.getId();

	this.getContentAsString(function(text, idd){

		if(text!=self.oldContent || !text){
			if (text == "") {
				//$(rep).find("body").html('<span class=\"moveArea\">Move me here</span>  <svg height="210" width="500">   <polygon points="100,10 40,180 190,60 10,60 160,180" style="fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;"/>  <polygon points="200,10 140,180 290,60 110,60 260,180" style="fill:lime;stroke:red;stroke-width:5;fill-rule:evenodd;"/>  <polygon points="400,10 340,180 490,60 310,60 460,180" style="fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;"/>   Sorry, your browser does not support inline SVG. </svg>');
                $(rep).find("body").html('<span class=\"moveArea\">Move me here <svg width="185" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">\
                    <g>\
                    <title>Layer 1</title>\
                    <polygon onclick="HtmlStars.changerect(evt, 1)" id="svg1" fill="#ffffff" points="19.666427612304688,4.598316192626953 23.135597229003906,15.374137878417969 33.699562072753906,15.606575012207031 25.27967071533203,22.498825073242188 28.33936309814453,33.418304443359375 19.666427612304688,26.90213394165039 10.99346923828125,33.418304443359375 14.053169250488281,22.498825073242188 5.633270263671875,15.606575012207031 16.197235107421875,15.374137878417969 19.666427612304688,4.598316192626953 23.135597229003906,15.374137878417969 " stroke="#d1d104" stroke-width="3"/>\
                    <polygon onclick="HtmlStars.changerect(evt, 2)" id="svg2" fill="#ffffff" points="56.16448974609375,4.5904998779296875 59.633636474609375,15.3663330078125 70.19760131835938,15.5987548828125 61.7777099609375,22.491012573242188 64.83740234375,33.410491943359375 56.16448974609375,26.894317626953125 47.49151611328125,33.410491943359375 50.55120849609375,22.491012573242188 42.131317138671875,15.5987548828125 52.695281982421875,15.3663330078125 56.16448974609375,4.5904998779296875 59.633636474609375,15.3663330078125 " stroke="#d1d104" stroke-width="3"/>\
                    <polygon onclick="HtmlStars.changerect(evt, 3)" id="svg3" fill="#ffffff" points="93.16448974609375,4.5904998779296875 96.63363647460938,15.3663330078125 107.19760131835938,15.5987548828125 98.7777099609375,22.491012573242188 101.83740234375,33.410491943359375 93.16448974609375,26.894317626953125 84.49151611328125,33.410491943359375 87.55120849609375,22.491012573242188 79.13131713867188,15.5987548828125 89.69528198242188,15.3663330078125 93.16448974609375,4.5904998779296875 96.63363647460938,15.3663330078125 " stroke="#d1d104" stroke-width="3"/>\
                    <polygon onclick="HtmlStars.changerect(evt, 4)" id="svg4" fill="#ffffff" points="130.66448974609375,4.5904998779296875 134.13363647460938,15.3663330078125 144.69760131835938,15.5987548828125 136.2777099609375,22.491012573242188 139.33740234375,33.410491943359375 130.66448974609375,26.894317626953125 121.99151611328125,33.410491943359375 125.05120849609375,22.491012573242188 116.63131713867188,15.5987548828125 127.19528198242188,15.3663330078125 130.66448974609375,4.5904998779296875 134.13363647460938,15.3663330078125 " stroke="#d1d104" stroke-width="3"/>\
                    <polygon onclick="HtmlStars.changerect(evt, 5)" id="svg5" fill="#ffffff" points="166.66448974609375,4.5904998779296875 170.13363647460938,15.3663330078125 180.69760131835938,15.5987548828125 172.2777099609375,22.491012573242188 175.33740234375,33.410491943359375 166.66448974609375,26.894317626953125 157.99151611328125,33.410491943359375 161.05120849609375,22.491012573242188 152.63131713867188,15.5987548828125 163.19528198242188,15.3663330078125 166.66448974609375,4.5904998779296875 170.13363647460938,15.3663330078125 " stroke="#d1d104" stroke-width="3"/>\
                    </g>\
                    </svg></span>');
			} else {
				$(rep).find("body").html(text);
			}
		}
		
		self.oldContent=text;
		
	});

    console.log('score = ' + self.score);
    for(var i=0; i<=this.score ; i++) {
        var elem = document.getElementById("svg"+i);
        elem.setAttribute ("fill", "#FF0220");
    }
	
}

HtmlStars.changerect = function(evt, numb){
    var svgobj=evt.target;

    var idd = svgobj.getAttribute ("id");
//    console.log('svgobject is : ' + svgobj);
    console.log('iddd = ' + idd);
    console.log('this is '+ this);
    this.score = numb;

    for(var i=1;i<=numb;i++){
        var elem = document.getElementById("svg"+i);
        elem.setAttribute ("fill", "#FF0220");
    }

    for(var j=numb+1; j<=5; j++){
        var elem = document.getElementById("svg"+j);
        elem.setAttribute ("fill", "#FFFFFF");
    }

}
