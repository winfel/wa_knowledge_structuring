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
	$(rep).find("div").css("height", h-85+"px");
	$(rep).find("div").css("width", w-25+"px");
	
}


Container.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));
	
	this.setAttribute("name", "Sample Container");

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
	$(	'<table class="headline" bgcolor=#CCFFFF><tr>'+
		'<th id ="containername" width="100"><h3>Sample Container</h3></th>'+
		'<th id ="tableimage" width="35"></th>'+
		'<th id ="sortingcriterion" width="100"></th>'+
		'</tr></table>'+
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
	$(rep).find("#sortingcriterion").append('<form action="select.htm"><select name="ordering">'+
		'<option>alphabetic asc.</option>'+
		'<option>alphabetic desc.</option>'+
		'<option>size asc.</option>'+
		'<option>size desc.</option>'+
		'<option>type</option>'+
		'</select></form>');
	

	var newCategoryIcon = document.createElement("img");
	$(newCategoryIcon).attr("src", "/guis.common/images/icon-lupe.png").attr("alt", "");
	$(newCategoryIcon).attr("width", "30").attr("height", "30");	
	$('#tableimage').append(newCategoryIcon);

	var newID = "tableimage"+rep.id;
	$('#tableimage').attr('id',newID);



	/* add Popover */
	$(newCategoryIcon).jPopover({
         //positionOffsetY : $("#containment-wrapper").height()-7,
         onSetup : function(domEl, popover) {

             var page = popover.addPage(GUI.translate('Search/Filter'));
             var section = page.addSection();

		     var element = section.addElement('<input id = "textName" type="text" /><p>Search by:</p>'+
                		'<p>'+
                		'<input id = "checkName" type="checkbox"> Name &nbsp &nbsp '+
                		'<input id = "checkTag" type="checkbox"> Tag <br><br>'+
                		'<p>Search for:</p>'+
                		'<input id = "checkPDF" type="checkbox"> PDF<br>'+
                		'<input id = "checkHTML" type="checkbox"> HTML<br>'+
                		'<input id = "checkBild" type="checkbox"> Bilddateien'+
                		'</p><br>'+
                		'<button id= "searchButton" type="submit" height="30"><img src="/guis.common/images/icon-lupe.png" alt="Suchen" width="22" height="22"></button>'
             ); 


		           /* Click event for search button in popover */
	$('#searchButton').on("click",function(){
		console.log("Button pressed");

		/* Get value from textfield and selected checkboxes */
		var textfieldValue = $('#textName').val();
		var checkboxName = $('#checkName').prop('checked');
		var checkboxTag = $('#checkTag').prop('checked');
		var checkboxPDF = $('#checkPDF').prop('checked');
		var checkboxHTML = $('#checkHTML').prop('checked');
		var checkboxBild = $('#checkBild').prop('checked');
		
		/* Output values */
		console.log(textfieldValue);
		console.log(checkboxName);
		console.log(checkboxTag);
		console.log(checkboxPDF);
		console.log(checkboxHTML);
		console.log(checkboxBild);

		/* TODO: Use values as input for search/filter */


		/* Close popover */
		popover.hide();

		/* Clear textfield and uncheck checkboxes */ 
         	$('#textName').val('');
         	$("#checkName").prop("checked", false);
         	$("#checkTag").prop("checked", false);
         	$("#checkTag").prop("checked", false);
         	$("#checkPDF").prop("checked", false);
         	$("#checkHTML").prop("checked", false);
         	$("#checkBild").prop("checked", false);
         
		

	}) 


            }





	});



	

}


Container.rename = function(newName){

	var rep=this.getRepresentation();

	$(rep).find("#containername").html(newName);
}