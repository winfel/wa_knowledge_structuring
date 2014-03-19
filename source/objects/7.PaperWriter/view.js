
/**
 * Webarena - A webclient for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2011
 * 
 */
PaperWriter.createRepresentation = function() {

    var rep = GUI.svg.other(parent, "foreignObject");

    rep.dataObject = this;

    var body = document.createElement("body");

    $(rep).append(body);
    $(rep).find("body").css({
        'border' : '2px solid black',
        'padding' : '3px',
        'background-color' : '#FFFFFF'
    });
    $(rep).find("body").append("<iframe></iframe>");
    $(rep).find("iframe").css({
        'width' : '100%',
        'height' : '100%',
        'padding' : '0',
        'border' : '0'
    });
    $(rep)
            .find("iframe")
            .attr('src',
                    'http://beta.etherpad.org/webArenaDemo?showControls=true&showChat=false&showLineNumbers=true&useMonospaceFont=false');
    // $(rep).find("iframe").attr('src', this.getAttribute('paper'));

    $(rep).attr("id", this.getAttribute('id'));
    Etherpad
    beta.etherpad.org
}