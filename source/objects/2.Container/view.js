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
	
	this.updateInnerHeight();
	this.adjustControls();
}


Container.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).css("height", ($(rep).attr("height"))+"px");
	$(rep).css("width", ($(rep).attr("width"))+"px");

	var h = parseInt($(rep).attr("height"));
	var w = parseInt($(rep).attr("width"));
	
	$(rep).find("body").css("height", h-5+"px");
	$(rep).find("body").css("width", w-5+"px");
	$(rep).find("body").css("border", "2px solid #ccc");
	
	$(rep).find("div").css("height", h-55+"px");
	$(rep).find("div").css("width", w-25+"px");
	
}


Container.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	$(rep).attr("id", this.getAttribute('id'));
	
	this.setAttribute("name", "Sample Container");
	
	Container.drawContent(rep);
	
	return rep;
	
}

Container.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

Container.drawContent = function(rep){

	var that = this;

	var body = document.createElement("body");

	var compiled = _.template($( "script#container-template" ).html());

	 var heading = "Sample Container";

    var templateData = {
        heading : heading
    }


    $(body).append(
        compiled(templateData)
    );
	
	
	for(var i = 1; i<15; i++){
		$(body).find("#sortablefiles").append('<li class="ui-state-default">'+i+'</li>');
	}
	
	   
    $(body).find( "button:first" ).button({
      icons: {
        primary: "ui-icon-search"
      },
      text: false
    }).next().button({
      icons: {
        primary: "ui-icon-arrowthick-2-n-s"
      },
      text: false
    });
  
	
	$(rep).append(body);
	
	this.initGUI(rep);
				
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
	$(rep).find("#containment-wrapper").css("padding", "9px");
	$(rep).find("#containment-wrapper").css("overflow", "auto");
	

	/* add Search/Filter-Popover */
	$(body).find( "button:first" ).jPopover({
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
         
			});
		}
	});	
	
	/* add Sort-Popover */
	$(body).find( "button:first" ).next().jPopover({
         //positionOffsetY : $("#containment-wrapper").height()-7,
         onSetup : function(domEl, popover) {

             var page = popover.addPage(GUI.translate('Sort'));
             var section = page.addSection();

		     var element = section.addElement(
                		'<p>Criterion</p>'+
						'<select id="criterion">'+
						'<option value="name">By Name</option>'+
						'<option value="date">By Date</option>'+
						'</select>'+
						'<p>Order</p>'+
						'<select id="order">'+
						'<option value="AZ">From A to Z</option>'+
						'<option value="ZA">From Z to A</option>'+
						'</select>'+
						'<button id= "submitButton">Submit</button>'
            ); 
			
			var sel = document.getElementById('criterion');
			sel.onchange = function() {
			
				console.log(this.value);
				
				var order = document.getElementById('order');
				
				order.innerHTML = '';
				
				if(this.value=="name"){	
					$('<option value="AZ">From A to Z</option><option value="ZA">From Z to A</option>').appendTo(order);
					
				}
				else{
					$('<option value="newold">From new to old</option><option value="oldnew">From old to new</option>').appendTo(order);
				}
			}

			/* Click event for search button in popover */
			$('#submitButton').on("click",function(){

				/* Get value from the selection boxes */				
				var select1 = document.getElementById("criterion");
				var select1Value = select1.options[select1.selectedIndex].text;
					
				var select2 = document.getElementById("order");
				var select2Value = select2.options[select2.selectedIndex].text;
					

				/* Output values */
				console.log(select1Value);
				console.log(select2Value);

					
				/* TODO: Use values as input for sort */
			
				/* Close popover */
				popover.hide();
			});				
		}
	});	
}


Container.rename = function(newName){

	var rep=this.getRepresentation();

	$(rep).find("#containername").html(newName);
}