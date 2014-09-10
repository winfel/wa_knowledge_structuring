/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/	

/**
* @function draw
* @param external
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

/**
* @function updateInnerHeight
*/
FavouritesContainer.updateInnerHeight = function() {
	
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

/**
* @param parent
* @return {undefined}
*/
FavouritesContainer.createRepresentation = function(parent) { 	
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	$(rep).attr("id", this.getAttribute('id'));
	
	this.getFavourites();
	
	this.drawContent(rep);
	
	this.upd();
	
	return rep;
	
}


FavouritesContainer.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

/**
* @function drawContent
* @param rep
*/
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
			$(domEl).addClass('absolute'); // scrolls with the page

             var page = popover.addPage(GUI.translate('Search/Filter'));
             var section = page.addSection();

			 var s = that.searchString;
			if(s == 0 || s == ""){
				s = 'value="""" placeholder = "search by name"';
			}
			else{
				s = "value='"+that.searchString+"'";
			}
			 
			 
			TagManager.getMainTagsAndSecTags(function(o){ 
			 
				var selectMainTags;
				if(that.mainTag != ""){
					selectMainTags = '<select id="selectMainTags_for_'+that.id+'" size="1"><option value="1" style="color:silver">Select a main tag</option>';
				}
				else{
					selectMainTags = '<select id="selectMainTags_for_'+that.id+'" size="1"><option value="1" style="color:silver" selected>Select a main tag</option>';
				}
			 
				for(var i = 0; i < o.length; i++){
					if(o[i].name != that.MainTag){
						selectMainTags = selectMainTags + '<option value="'+o[i].name+'">'+o[i].name+'</option>';
					}
					else{
						selectMainTags = selectMainTags + '<option value="'+o[i].name+'" selected>'+o[i].name+'</option>';
					}
				}
				
				selectMainTags = selectMainTags + '</select>';
			 
			 	var selectSecTags;
				if(that.secTag != ""){
					selectSecTags = '<select id="selectSecTags_for_'+that.id+'" size="1"><option value="1" style="color:silver">Select a secondary tag</option>';
				}
				else{
					selectSecTags = '<select id="selectSecTags_for_'+that.id+'" size="1"><option value="1" style="color:silver" selected>Select a secondary tag</option>';
				}
				
				selectSecTags = selectSecTags + '</select>';
				
				// add a checkbox and label for every searchFor-option
				var searchFor = [];
				for(var searchoption in that) {
					var m = searchoption.match(/^searchFor(\w+)$/);
					if(m) {
						searchFor.push('<input id="check' + m[1] + '_for'+that.id+'" type="checkbox" ' + 
							(that[searchoption]?'checked="checked"':'') + 
							' style="float:left; margin-right:0.5em;" />' +
							'<label for="check' + m[1] + '_for'+that.id+'">' + m[1] + '</label>');
					}
				}
				
				section.addElement('<input id="textName_for'+that.id+'" type="text"'+s+'>');
				section.addElement(selectMainTags);
				section.addElement(selectSecTags);
				section.addElement(searchFor.join(''));
				var selectAll = section.addElement('<button id= "selectAll_'+that.id+'" type="submit" height="30">Select all</button>');
				var clickSelectAll = function(){
					$('#checkPDF_for'+that.id).prop('checked',true);
					$('#checkHTML_for'+that.id).prop('checked',true);
					$('#checkAudio_for'+that.id).prop('checked',true);
					$('#checkVideo_for'+that.id).prop('checked',true);
					$('#checkText_for'+that.id).prop('checked',true);
					$('#checkImage_for'+that.id).prop('checked',true);
				}
				var deselectAll = section.addElement('<button id= "deselectAll_'+that.id+'" type="submit" height="30">Deselect all</button>');
				var clickDeselectAll = function(){
					$('#checkPDF_for'+that.id).prop('checked',false);
					$('#checkHTML_for'+that.id).prop('checked',false);
					$('#checkAudio_for'+that.id).prop('checked',false);
					$('#checkVideo_for'+that.id).prop('checked',false);
					$('#checkText_for'+that.id).prop('checked',false);
					$('#checkImage_for'+that.id).prop('checked',false);
					$('#textName_for'+that.id).val('');
					$('#selectMainTags_for_'+that.id+' option[value="1"]').attr('selected',true);
					$('#selectSecTags_for_'+that.id+' option[value="1"]').attr('selected',true);
				}
				var search = section.addElement('<button id= "searchButton_for_'+that.id+'" type="submit" height="30">Search</button>');
				var clickSearch = function(){
				
					/* Get value from textfield and selected checkboxes */
					var textfieldValue = $('#textName_for'+that.id).val();
				
					var mainTagValue = $('#selectMainTags_for_'+that.id).val();
				
					var secTagValue = $('#selectSecTags_for_'+that.id).val();
				
					// test if anything is selected
					var anythingSelected = false;
					for(var searchoption in that) {
						var m = searchoption.match(/^searchFor(\w+)$/);
						if(m) {
							anythingSelected = anythingSelected || $('#check' + m[1] + '_for'+that.id).prop('checked');
						}
					}

					if(!anythingSelected) {
						alert('Please specify what files you are looking for');
					}
					else {
						// save the values						
						that.searchString = textfieldValue;
						
						that.mainTag = mainTagValue;
						
						that.secTag = secTagValue;
						
						for(var searchoption in that) {
							var m = searchoption.match(/^searchFor(\w+)$/);
							if(m) {
								that[searchoption] = $('#check' + m[1] + '_for'+that.id).prop('checked');
							}
						}

						that.searchAndFilter(that.Files);

						/* Close popover */
						popover.hide()
					}
				}
				
				if (GUI.isTouchDevice) {
					$(selectAll.getDOM()).bind("touchstart", clickSelectAll);
					$(deselectAll.getDOM()).bind("touchstart", clickDeselectAll);
					$(search.getDOM()).bind("touchstart", clickSearch);
				} else {
					$(selectAll.getDOM()).bind("click", clickSelectAll);
					$(deselectAll.getDOM()).bind("click", clickDeselectAll);
					$(search.getDOM()).bind("click", clickSearch);
				}
				
				var sel = document.getElementById('selectMainTags_for_'+that.id);
				sel.onchange = function() {
					
					var sel2 = document.getElementById('selectSecTags_for_'+that.id);
				
					sel2.innerHTML = '';
				
					$('<option value="1" style="color:silver" selected>Select a secondary tag</option>').appendTo(sel2);
				
					for(var j = 0; j<o.length; j++){
						if(o[j].name == this.value){
							for(var i = 0; i<o[j].secTags.length; i++){
								$('<option value="'+o[j].secTags[i]+'">'+o[j].secTags[i]+'</option>').appendTo(sel2);
							}
						}
					}
				
				}
			
			});
			
		}
	});	

	
	/* add Sort-Popover */
	$(body).find( "button:first" ).next().next().jPopover({
         //positionOffsetY : $("#containment-wrapper").height()-7,
         onSetup : function(domEl, popover) {
			$(domEl).addClass('absolute'); // scrolls with the page

             var page = popover.addPage(GUI.translate('Sort'));
             var section = page.addSection();

			 var sel1 = '<select id="criterion_for'+that.id+'">';
			 
			 if(that.sortingCriterion == "By Name"){
				 sel1 = sel1 + '<option value="name" selected>By Name</option>';
				 sel1 = sel1 + '<option value="date">By Date</option>';
			 }
			 else{
				 sel1 = sel1 + '<option value="name">By Name</option>';
				 sel1 = sel1 + '<option value="date" selected>By Date</option>';
			 }
			 
			 sel1 = sel1 + '</select>';
			 
			 var s1 = section.addElement(sel1);
			 
			 var sel2 = '<select id="order_for'+that.id+'">';
			
			 if(that.sortingOrder == "From A to Z"){
				sel2 = sel2 + '<option value="AZ" selected>From A to Z</option>';
				sel2 = sel2 + '<option value="ZA">From Z to A</option>';
			 }
			 else{
				sel2 = sel2 + '<option value="AZ">From A to Z</option>';
				sel2 = sel2 + '<option value="ZA" selected>From Z to A</option>';
			 }
			 
			 sel2 = sel2 + '</select>';
			 
			 var s2 = section.addElement(sel2);
			
			var submitButton = section.addElement('<button id="submitButton_for_'+that.id+'">Submit</button>'); 
			
			/* Click event for search button in popover */
			var clickSubmitButton = function(){

				/* Get value from the selection boxes */				
				var select1 = document.getElementById('criterion_for'+that.id);
				var select1Value = select1[select1.selectedIndex].text;
					
				var select2 = document.getElementById('order_for'+that.id);
				var select2Value = select2[select2.selectedIndex].text;
							
				that.sortingCriterion = select1Value;
				that.sortingOrder = select2Value;	
				
				that.searchAndFilter(that.Files);
							
				/* Close popover */
				popover.hide()
			}
			
			if (GUI.isTouchDevice) {
				$(submitButton.getDOM()).bind("touchstart", clickSubmitButton);
			} else {
				$(submitButton.getDOM()).bind("click", clickSubmitButton);
			}
			
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
			
		}
	});	
}

/**
* @function rename
* @param newName
*/
FavouritesContainer.rename = function(newName){

	var rep=this.getRepresentation();

	$(rep).find("#containername").html(newName);
		
}

/**
* @function addFiles
* @param files
*/
FavouritesContainer.addFiles = function(files){

	var that = this;

	var rep=this.getRepresentation();

	$(rep).find(".spinner").remove();
	
	if(files.length == 0){
		$(rep).find("#sortablefiles").html("Add your favourite files by right click on any file in the global space containers or by simply drag and drop!");
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
		
		$(rep).find("#sortablefiles").append('<li id="representation_for_'+id+'" class="ui-widget-content containerFileRepresentation" tabindex="-1" title="' + name + '"><div class="filename">'+name+'</div></li>');
		
		$(rep).find("#representation_for_"+id).prepend('<img id="image_for_'+id+'" src="/guis.common/images/fileicons/'+img+'">');
		
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
			$("<div id=menu_for_"+id+" class='addremove-menu'>Remove from favourites</div>")
			.appendTo("body")
			.css({top: event.pageY + "px", left: event.pageX + "px"})
			.on("click", function(event){
						
				that.removeFavourite(this.id.split("_")[2]);		
						
				$(rep).find("#representation_for_"+this.id.split("_")[2]).remove();
								
				$("div.addremove-menu").remove();
				
				if($(rep).find(".ui-widget-content").length == 0){
					$(rep).find("#sortablefiles").html("Add your favourite files by right click on any file in the global space containers or by simply drag and drop!");
				}
				
			});
		});
		
	}	
		
}

FavouritesContainer.upd = function(){

	var rep=this.getRepresentation();
	
	$(rep).find(".ui-widget-content").remove();
	$(rep).find("#sortablefiles").html("");
	
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

	this.getFavourites();	
		
	this.getFiles();

}


/**
 * Called when a click was performed and the object is selected
 * @param {DomEvent} event DOM click event
 */
FavouritesContainer.selectedClickHandler = function(event) {

  if (GUI.shiftKeyDown) {
    this.deselect();
  } else {

    var x = this.getViewBoundingBoxX() + this.getViewBoundingBoxWidth();
    var y = this.getViewBoundingBoxY();

    if (GUI.couplingModeActive) {
      var index = ObjectManager.getIndexOfObject(this.getId());
      if (index === 'right') {
        x += parseInt($('#room_right_wrapper').attr('x')) + GUI.getPanX(index);
      } else {
        x += GUI.getPanX(index);
      }
      y += GUI.getPanY(index);
    }
	
	if((event.target.id.indexOf("image") == -1) && (event.target.id.indexOf("representation") == -1) && (event.target.className.indexOf("filename") == -1)){
		GUI.showActionsheet(x, y, this);
	}

  }

}