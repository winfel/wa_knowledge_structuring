/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/	

FavouritesContainer.draw=function(external){
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


FavouritesContainer.updateInnerHeight = function() {
	
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


FavouritesContainer.createRepresentation = function(parent) { 	
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	$(rep).attr("id", this.getAttribute('id'));
	
	this.drawContent(rep);
	
	this.upd();
	
	return rep;
	
}

FavouritesContainer.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

FavouritesContainer.drawContent = function(rep){

	var that = this;

	var body = document.createElement("body");

	var compiled = _.template($( "script#container-template" ).html());

	 var heading = "FavouritesContainer";

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
				searchByTag = '<input id = "checkTag_for'+that.id+'" type="checkbox" checked> Tag <br><br>';    
			}
			else{
				searchByTag = '<input id = "checkTag_for'+that.id+'" type="checkbox"> Tag <br><br>';  
			}
            
		   
		    var searchForPDF;
			var searchForHTML;
			var searchForImage;
			var searchForAudio;
			var searchForVideo;
			var searchForText;
			
			
            if(that.options.searchForPDF){
             	searchForPDF = '<input id = "checkPDF_for'+that.id+'" type="checkbox" checked> PDF<br>';
			}
			else{
				searchForPDF = '<input id = "checkPDF_for'+that.id+'" type="checkbox"> PDF<br>';
			}
			if(that.options.searchForHTML){
             	searchForHTML = '<input id = "checkHTML_for'+that.id+'" type="checkbox" checked> HTML<br>';
			}
			else{
				searchForHTML = '<input id = "checkHTML_for'+that.id+'" type="checkbox"> HTML<br>';
			}
			if(that.options.searchForAudio){
             	searchForAudio = '<input id = "checkAudio_for'+that.id+'" type="checkbox" checked> Audio<br>';
			}
			else{
				searchForAudio = '<input id = "checkAudio_for'+that.id+'" type="checkbox"> Audio<br>';
			}
			if(that.options.searchForVideo){
             	searchForVideo = '<input id = "checkVideo_for'+that.id+'" type="checkbox" checked> Video<br>';
			}
			else{
				searchForVideo = '<input id = "checkVideo_for'+that.id+'" type="checkbox"> Video<br>';
			}
			if(that.options.searchForText){
             	searchForText = '<input id = "checkText_for'+that.id+'" type="checkbox" checked> Text<br>';
			}
			else{
				searchForText = '<input id = "checkText_for'+that.id+'" type="checkbox"> Text<br>';
			}
			if(that.options.searchForImage){
				searchForImage = '<input id = "checkImage_for'+that.id+'" type="checkbox" checked> Image';
			}
            else{
				searchForImage = '<input id = "checkImage_for'+that.id+'" type="checkbox"> Image';
			}
			
			var s = that.options.searchString;
			if(s == 0 || s == ""){
				s = "placeholder='search'";
			}
			else{
				s = "value='"+that.options.searchString+"'";
			}
			
		     var element = section.addElement('<input id = "textName_for'+that.id+'" type="text"'+s+'><p>Search by:</p>'+
                		'<p>'+
                		searchByName +
						searchByTag+
                		'<p>Search for:</p>'+
                		searchForPDF +
						searchForHTML +
						searchForAudio +
						searchForVideo +
						searchForText +
						searchForImage +
                		'</p>'+
                		'<button id= "selectAll_'+that.id+'" type="submit" height="30">Select all</button>'+
                		'<button id= "deselectAll_'+that.id+'" type="submit" height="30">Deselect all</button>'+
                		'<br><br>'+
                		'<button id= "searchButton_for_'+that.id+'" type="submit" height="30"><img src="/guis.common/images/icon-lupe.png" alt="Suchen" width="22" height="22"></button>'
            ); 


		    /* Click event for search button in popover */
			$('#searchButton_for_'+that.id).on("click",function(){

				/* Get value from textfield and selected checkboxes */
				var textfieldValue = $('#textName_for'+that.id).val();
				var checkboxName = $('#checkName_for'+that.id).prop('checked');
				var checkboxTag = $('#checkTag_for'+that.id).prop('checked');
				var checkboxPDF = $('#checkPDF_for'+that.id).prop('checked');
				var checkboxHTML = $('#checkHTML_for'+that.id).prop('checked');
				var checkboxAudio = $('#checkAudio_for'+that.id).prop('checked');
				var checkboxVideo = $('#checkVideo_for'+that.id).prop('checked');
				var checkboxText = $('#checkText_for'+that.id).prop('checked');
				var checkboxImage = $('#checkImage_for'+that.id).prop('checked');
			

				if(textfieldValue != "" && !checkboxName && !checkboxTag){
					alert('Please specify what you are looking for (name and/or tag)');		
				}
				else{
					if(!checkboxPDF && !checkboxHTML && !checkboxImage && !checkboxAudio && !checkboxVideo && !checkboxText){
							alert('Please specify what files you are looking for');
					}
					else{
				
						that.options.searchString = textfieldValue;
						that.options.searchByName = checkboxName;
						that.options.searchByTag = checkboxTag;
						that.options.searchForPDF = checkboxPDF;
						that.options.searchForHTML = checkboxHTML;
						that.options.searchForImage = checkboxImage;
						that.options.searchForAudio = checkboxAudio;
						that.options.searchForVideo = checkboxVideo;
						that.options.searchForText = checkboxText;
				
						//that.setAttribute('searchString', textfieldValue);
						//that.setAttribute('searchByName', checkboxName);
						//that.setAttribute('searchByTag', checkboxTag);
						//that.setAttribute('searchForPDF', checkboxPDF);
						//that.setAttribute('searchForHTML', checkboxHTML);
						//that.setAttribute('searchForImage', checkboxImage);
						//that.setAttribute('searchForAudio', checkboxAudio);
						//that.setAttribute('searchForVideo', checkboxVideo);
						//that.setAttribute('searchForText', checkboxText);
				
						that.getFiles();
				
						/* Close popover */
						popover.hide();

					}
					
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
						
				//that.setAttribute('sortingCriterion', select1Value);
				//that.setAttribute('sortingOrder', select2Value);
				
				that.getFiles();
							
				/* Close popover */
				popover.hide();
			});				
		}
	});	
}


FavouritesContainer.rename = function(newName){

	var rep=this.getRepresentation();

	$(rep).find("#containername").html(newName);
		
}

FavouritesContainer.addFiles = function(files){

	var that = this;

	var rep=this.getRepresentation();

	if(files.length == 0){
		$(rep).find("#sortablefiles").html("Add your favourite files by right click on any file in the global space containers!");
		return;
	}
	else{
		$(rep).find("#sortablefiles").html("");
	}
				
	var key;
	for(key in files){
	
		var id = files[key].attributes.id;
		
		if($(rep).find("#representation_for_"+id).length > 0){ 
			continue;
		}
			
		var name = files[key].attributes.name;
		var n = name.split('.')[0];
		var type = name.split('.')[1];
		
		if(n.length>13){
			n = n.substring(0,10)+ "...";
		}
		
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
		
		$(rep).find("#sortablefiles").append('<li id=representation_for_'+id+' class="ui-widget-content" tabindex="-1">'+n+'</li>');
		
		$(rep).find("#representation_for_"+id).prepend('<img id="image_for_'+id+'" src="../../guis.common/images/fileicons/'+img+'">');
		
		$(rep).find("#sortablefiles li").css("margin", "3px 3px 3px 0");
		$(rep).find("#sortablefiles li").css("padding", "1px");
		$(rep).find("#sortablefiles li").css("float", "left");
		$(rep).find("#sortablefiles li").css("width", "75px");
		$(rep).find("#sortablefiles li").css("height", "75px");
		$(rep).find("#sortablefiles li").css("line-height", "10px");
		$(rep).find("#sortablefiles li").css("font-size", "1em");
		$(rep).find("#sortablefiles li").css("text-align", "center");
		$(rep).find("#sortablefiles li").css("vertical-align", "middle");	
		$(rep).find("#sortablefiles li").css("background", "#d3d3d3");	
			
		$(rep).find("#representation_for_"+id).hover(
			function() {
				$(this).css("background", "#f5f5f5");
			}, function() {
				$(this).css("background", "#d3d3d3");	
			}
		);

		$(rep).find("#representation_for_"+id).bind("contextmenu", function(event) { 
			event.preventDefault();
			$("div.addremove-menu").remove();
			var id = this.id.split("_")[2];
			$("<div id=menu_for_"+id+" class='addremove-menu'>Remove from favourites</div>")
			.appendTo("body")
			.css({top: event.pageY + "px", left: event.pageX + "px"})
			.on("click", function(event){
						
				$(rep).find("#representation_for_"+this.id.split("_")[2]).remove();
								
				$("div.addremove-menu").remove();
				
				that.removeFavourite(this.id.split("_")[2]);
				
				that.upd();
				
			});
		});
		
	}	
		
}

FavouritesContainer.upd = function(){

	this.getFiles();

}