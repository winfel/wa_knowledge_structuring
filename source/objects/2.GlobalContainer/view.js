/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/	

GlobalContainer.draw=function(external){
	var rep=this.getRepresentation();
	
	/* manual check for a changed name - we need to save time ;-)*/
	$(rep).find("#containername").html(this.getAttribute('name'));

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


GlobalContainer.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).css("height", ($(rep).attr("height"))+"px");
	$(rep).css("width", ($(rep).attr("width"))+"px");

	var h = parseInt($(rep).attr("height"));
	var w = parseInt($(rep).attr("width"));
	
	$(rep).find("body").css("height", h-5+"px");
	$(rep).find("body").css("width", w-5+"px");
	$(rep).find("body").css("border", "2px solid #ccc");
	
	$(rep).find("#containment-wrapper").css("height", h-55+"px");
	$(rep).find("#containment-wrapper").css("width", w-25+"px");
	
}


GlobalContainer.createRepresentation = function(parent) { 	
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	$(rep).attr("id", this.getAttribute('id'));
	
	this.drawContent(rep);
	
	this.setAttribute('locked', true);
	
	this.upd();
	
	return rep;
	
}

GlobalContainer.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

GlobalContainer.drawContent = function(rep){

	var that = this;

	var body = document.createElement("body");

	var compiled = _.template($( "script#container-template" ).html());

	 var heading = "GlobalContainer";

    var templateData = {
        heading : heading
    }
	

    $(body).append(
        compiled(templateData)
    );
	
	$(rep).append(body);
	
	this.initGUI(rep);
	 
	$(body).find( "button:first" ).button({
      icons: {
        primary: "ui-icon-refresh"
      },
      text: false
	  })
	  .click(function() {
		that.upd()
      })
	  .next().button({
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
	
	
	//$(rep).find("#sortablefiles").sortable({ containment: "#containment-wrapper" });
	$(rep).find("#sortablefiles").disableSelection();

	$(rep).find("#sortablefiles").css("list-style-type", "none");
	$(rep).find("#sortablefiles").css("margin", "10px");
	$(rep).find("#sortablefiles").css("padding", "10px");

	$(rep).find("#containment-wrapper").css("width", "450px");
	$(rep).find("#containment-wrapper").css("height", "300px");
	$(rep).find("#containment-wrapper").css("padding", "9px");
	$(rep).find("#containment-wrapper").css("overflow", "auto");
	$(rep).find("#containment-wrapper").css("text-align", "center");
	
	$(rep).find("#containment-wrapper").droppable({
		drop: function( event, ui ) {
		
			var objectId = ui.draggable.context.id.split("_")[2];
			var selector = ui.draggable.context.id;
			
			var exist = false;
			var key;
			for(key in that.Files){
				if(that.Files[key].attributes.id == objectId){
					exist = true;
				}
			}
		
			if(!exist){
			
				var r = confirm("Do you really want to change the main Tag of this object to "+that.getAttribute('name')+"?");
				if (r == true) {
									
					//erase the dragged file from the source Container:
					var oldContainer = ObjectManager.getObject($("#"+selector).parent().parent().parent().parent().attr('id'));
					
					var f = new Array();
					var k;
					for(k in oldContainer.Files){
						if(oldContainer.Files[k].attributes.id != objectId){
							f.push(oldContainer.Files[k]);
						}
						else{
							var n = oldContainer.Files[k];
						}
					}
					oldContainer.Files = f;
					oldContainer.searchAndFilter(f);
			
					
					//add the dragged file to the target Container:
					n.attributes.mainTag = that.getAttribute('name');
					n.attributes.secondaryTags = [];
					that.Files.push(n);

					that.searchAndFilter(that.Files);
					
					
					//change the mainTag of the dragged object:
					var room = n.attributes.inRoom;
					that.changeMainTag(objectId, that.getAttribute('name'), room);
					
				}
			}
		}
    });

	/* add Search/Filter-Popover */
	$(body).find( "button:first" ).next().jPopover({
         //positionOffsetY : $("#containment-wrapper").height()-7,
         onSetup : function(domEl, popover) {

             var page = popover.addPage(GUI.translate('Search/Filter'));
             var section = page.addSection();

             var searchByName;
			 var searchByTag;
			 if(that.options.searchByName){
             	searchByName = '<input id = "checkName_for'+that.id+'" type="checkbox" checked> Name &nbsp &nbsp ';
			}
			else{
				searchByName = '<input id = "checkName_for'+that.id+'" type="checkbox"> Name &nbsp &nbsp ';
			}
			if(that.options.searchByTag){
				searchByTag = '<input id = "checkTag_for'+that.id+'" type="checkbox" checked> sec. Tag <br><br>';    
			}
			else{
				searchByTag = '<input id = "checkTag_for'+that.id+'" type="checkbox"> sec. Tag <br><br>';  
			}

			// add a checkbox and label for every searchFor-option
			var searchFor = [];
			for(var searchoption in that.options) {
				var m = searchoption.match(/^searchFor(\w+)$/);
				if(m) {
					searchFor.push('<input id="check' + m[1] + '_for'+that.id+'" type="checkbox" ' + 
						(that.options[searchoption]?'checked="checked"':'') + 
						' style="float:left; margin-right:0.5em;" />' +
						'<label for="check' + m[1] + '_for'+that.id+'">' + m[1] + '</label>');
				}
			}

			var s = that.options.searchString;
			if(s == 0 || s == ""){
				s = "placeholder='search'";
			}
			else{
				s = "value='"+that.options.searchString+"'";
			}
			
		     var element = section.addElement('<input id="textName_for'+that.id+'" type="text"'+s+'><p>Search by:</p>'+
                		'<p>'+
                		searchByName +
						searchByTag+
                		'<p>Search for:</p>'+
                		searchFor.join('') +
                		'</p>'+
                		'<button id= "selectAll_'+that.id+'" type="submit" height="30">Select all</button>'+
                		'<button id= "deselectAll_'+that.id+'" type="submit" height="30">Deselect all</button>'+
                		'<br><br>'+
                		'<button id= "searchButton_for_'+that.id+'" type="submit" height="30">Search</button>'
            ); 


		    /* Click event for search button in popover */
			$('#searchButton_for_'+that.id).on("click",function(){

				/* Get value from textfield and selected checkboxes */
				var textfieldValue = $('#textName_for'+that.id).val();

				// test if anything is selected
				var anythingSelected = false;
				for(var searchoption in that.options) {
					var m = searchoption.match(/^searchFor(\w+)$/);
					if(m) {
						anythingSelected = anythingSelected || $('#check' + m[1] + '_for'+that.id).prop('checked');
					}
				}
				var searchBySelected = $('#checkName_for'+that.id).prop('checked') ||
					$('#checkTag_for'+that.id).prop('checked');

				if(textfieldValue != "" && !searchBySelected){
					alert('Please specify what you are looking for (name and/or tag)');		
				}
				else if(!anythingSelected) {
					alert('Please specify what files you are looking for');
				}
				else {
					// save the values
					that.options.searchString = textfieldValue;
					for(var searchoption in that.options) {
						var m = searchoption.match(/^search(For|By)(\w+)$/);
						if(m) {
							that.options[searchoption] = $('#check' + m[2] + '_for'+that.id).prop('checked');
						}
					}

					that.searchAndFilter(that.Files);

					/* Close popover */
					popover.hide();
				}
			});

			/* Click event for select all button in popover */
			$('#selectAll_'+that.id).on("click",function(){
				$('#checkPDF_for'+that.id).prop('checked',true);
				$('#checkHTML_for'+that.id).prop('checked',true);
				$('#checkAudio_for'+that.id).prop('checked',true);
				$('#checkVideo_for'+that.id).prop('checked',true);
				$('#checkText_for'+that.id).prop('checked',true);
				$('#checkImage_for'+that.id).prop('checked',true);
				
			});


			/* Click event for deselect all button in popover */
			$('#deselectAll_'+that.id).on("click",function(){
				$('#checkPDF_for'+that.id).prop('checked',false);
				$('#checkHTML_for'+that.id).prop('checked',false);
				$('#checkAudio_for'+that.id).prop('checked',false);
				$('#checkVideo_for'+that.id).prop('checked',false);
				$('#checkText_for'+that.id).prop('checked',false);
				$('#checkImage_for'+that.id).prop('checked',false);
				
			});


		}
	});	
	
	/* add Sort-Popover */
	$(body).find( "button:first" ).next().next().jPopover({
         //positionOffsetY : $("#containment-wrapper").height()-7,
         onSetup : function(domEl, popover) {

             var page = popover.addPage(GUI.translate('Sort'));
             var section = page.addSection();

		     var element = section.addElement(
                		'<p>Criterion</p>'+
						'<select id="criterion_for'+that.id+'">'+
						'<option value="name">By Name</option>'+
						'<option value="date">By Date</option>'+
						'</select>'+
						'<p>Order</p>'+
						'<select id="order_for'+that.id+'">'+
						'<option value="AZ">From A to Z</option>'+
						'<option value="ZA">From Z to A</option>'+
						'</select>'+
						'<button id="submitButton_for_'+that.id+'">Submit</button>'
            ); 
			
			var sel = document.getElementById('criterion_for'+that.id);
			sel.onchange = function() {
							
				var order = document.getElementById('order_for'+that.id);
				
				order.innerHTML = '';
				
				if(this.value=="name"){	
					$('<option value="AZ">From A to Z</option><option value="ZA">From Z to A</option>').appendTo(order);
					
				}
				else{
					$('<option value="newold">From new to old</option><option value="oldnew">From old to new</option>').appendTo(order);
				}
			}

			/* Click event for search button in popover */
			$('#submitButton_for_'+that.id).on("click",function(){

				/* Get value from the selection boxes */				
				var select1 = document.getElementById('criterion_for'+that.id);
				var select1Value = select1.options[select1.selectedIndex].text;
					
				var select2 = document.getElementById('order_for'+that.id);
				var select2Value = select2.options[select2.selectedIndex].text;
							
				that.options.sortingCriterion = select1Value;
				that.options.sortingOrder = select2Value;	
				
				that.searchAndFilter(that.Files);
							
				/* Close popover */
				popover.hide();
			});				
		}
	});	
}


GlobalContainer.rename = function(newName){

	var rep=this.getRepresentation();

	$(rep).find("#containername").html(newName);
		
}

GlobalContainer.addFiles = function(files){
	
	var that = this;

	var rep=this.getRepresentation();
	
	$(rep).find(".spinner").remove();
	
	if(files.length == 0){
		$(rep).find("#sortablefiles").html("This Container shows all files which are tagged with the main Tag "+$(rep).find("#containername").html()+"!");
		return;
	}
	else{
		$(rep).find("#sortablefiles").html("");
	}
		
	var key;
	for(key in files){
	
		var name = files[key].attributes.name;
		var n = name.split('.')[0];
		var type = name.split('.')[1];
		var room = files[key].attributes.inRoom;
		
		if(n.length>13){
			n = n.substring(0,10)+ "...";
		}
	
		var id = files[key].attributes.id;
		
		var mime = files[key].attributes.mimeType;
		var img;
		var t = mime.split('/');
		
		if(mime == "application/pdf"){ //type of object is pdf
			img = "pdf.png";
		}
		if(mime == "text/html"){ //type of object is html
			img = "html.png";
		}
		if(t[0] == "image"){ //type of object is image
			img = "image.png";
		}
		if(t[0] == "audio"){ //type of object is audio
			img = "audio.png";
		}
		if(t[0] == "video"){ //type of object is video
			img = "video.png";
		}
		if(mime == "text/plain"){ //type of object is text
			img = "text.png";
		}
		
		$(rep).find("#sortablefiles").append('<li id="representation_for_'+id+'" class="ui-widget-content containerFileRepresentation" tabindex="-1" title="' + name + '"><div class="filename">'+name+'</div></li>');
		
		$(rep).find("#representation_for_"+id).prepend('<img id="image_for_'+id+'" content="'+room+'" src="/guis.common/images/fileicons/'+img+'">');
		
		$(rep).find("#sortablefiles li").draggable({
			helper: 'clone',
			revert: 'invalid',
			appendTo: 'body'
		});
		
		$(rep).find("#representation_for_"+id).dblclick(function(event) {
		
			var objectId = event.currentTarget.id.split("_")[2];

			var n;
			var k;
			for(k in that.Files){
				if(that.Files[k].attributes.id == objectId){
					n = that.Files[k];
					break;
				}
			}
			
			window.open("/getContent/"+n.inRoom+"/"+objectId+"/"+n.attributes.contentAge+"/"+ObjectManager.userHash, "_blank");
		});

		$(rep).find("#representation_for_"+id).bind("contextmenu", function(event) { 
			event.preventDefault();
			$("div.addremove-menu").remove();
			var id = this.id.split("_")[2];
			$("<div id=menu_for_"+id+" class='addremove-menu'>Add to favourites</div>")
			.appendTo("body")
			.css({top: event.pageY + "px", left: event.pageX + "px"})
			.on("click", function(event){
					
				that.sendNewFavourite(this.id.split("_")[2]);
				
				$("div.addremove-menu").remove();
			});
			
			var padding = 25;
			
			for(var i = 0; i < that.PaperSpaces.length; i++){
			
				$("<div id=menu_for_"+id+" class='addremove-menu'>Add to paperspace "+that.PaperSpaces[i]+"</div>")
				.appendTo("body")
				.css({top: (parseInt(event.pageY)+padding) + "px", left: event.pageX + "px"})
				.on("click", function(event){	
						
					that.sendNewReference(this.id.split("_")[2], event.target.innerHTML.split(' ')[3]);
					
					$("div.addremove-menu").remove();
				});
					
				padding = padding + 25;
				
			}
		});
		
	}	
	
	this.getAllPaperSpaces();
	
}

GlobalContainer.upd = function(){

	var rep=this.getRepresentation();
	
	$(rep).find(".ui-widget-content").remove();
	
	$(rep).find(".spinner").remove();

	$(rep).find("#containment-wrapper").prepend('<div class="spinner">'+
		'<div class="spinner-container container1">'+
		'<div class="circle1"></div>'+
		'<div class="circle2"></div>'+
		'<div class="circle3"></div>'+
		'<div class="circle4"></div>'+
		'</div>'+
		'<div class="spinner-container container2">'+
		'<div class="circle1"></div>'+
		'<div class="circle2"></div>'+
		'<div class="circle3"></div>'+
		'<div class="circle4"></div>'+
		'</div>'+
		'<div class="spinner-container container3">'+
		'<div class="circle1"></div>'+
		'<div class="circle2"></div>'+
		'<div class="circle3"></div>'+
		'<div class="circle4"></div>'+
		'</div>'+
		'</div>');
	
	this.getFiles();

}