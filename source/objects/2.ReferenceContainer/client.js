/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

ReferenceContainer.searchString = "";
ReferenceContainer.mainTag = "";
ReferenceContainer.secTag = "";
ReferenceContainer.searchForPDF = true;
ReferenceContainer.searchForHTML = true;
ReferenceContainer.searchForImage = true;
ReferenceContainer.searchForAudio = true;
ReferenceContainer.searchForVideo = true;
ReferenceContainer.searchForText = true;
ReferenceContainer.sortingCriterion = "By Name";
ReferenceContainer.sortingOrder = "From A to Z";

ReferenceContainer.Files = new Array();
ReferenceContainer.References = new Array();


/**
* @function removeReference
* @param ref
*/
ReferenceContainer.removeReference = function(ref){
		
	var that = this;	
	
	this.References.splice(this.References.indexOf(ref), 1);
		
	UserManager.getDataOfSpaceWithDest(this.getRoom().getAttribute('name'), "references" , function(d){
	
		var arr = new Array();
			
		if(d != "error"){
			var key;
			for(key in d[0].value){
				if(d[0].value[key] != ref){
					arr.push(d[0].value[key]);
				}
			}
			UserManager.removeDataOfSpaceWithDest(that.getRoom().getAttribute('name'), "references");
		}
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(that.getRoom().getAttribute('name'), "references", arr) }, 500);
	
	});
	
}


ReferenceContainer.getReferences = function(){
	var that = this;

	//get project name
	var destFromURL = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);
	UserManager.getDataOfSpaceWithDest(destFromURL,"ProjectNameLink",function(pname){
		that.References = new Array();	
		
		UserManager.getDataOfSpaceWithDest(pname[0].value, "references" , function(d){
	
			if(d != "error"){
				var key;
				for(key in d[0].value){
					that.References.push(d[0].value[key]);
				}
			}
		
		});

	});
}


ReferenceContainer.getFiles = function(){
			
	var that = this;		
	
	this.serverCall("getAllFileObjects", function(data){
		
		var f = new Array();
		
		for(var i = 0; i < data.length; i++){
		
			if(that.References.indexOf(data[i].attributes.id) != -1){

				f.push(data[i]);
			
			}			
		
		}
		
		that.Files = f;
		that.searchAndFilter(f);
	});
		
}

/**
* @param files
*/
ReferenceContainer.searchAndFilter = function(files){
	
	var filteredFiles1 = new Array();
	var filteredFiles2 = new Array();
	
	var s = this.searchString;
	var maintag = this.mainTag;
	var sectag = this.secTag;
	var pdf = this.searchForPDF;
	var html = this.searchForHTML;
	var image = this.searchForImage;
	var audio = this.searchForAudio;
	var video = this.searchForVideo;
	var text = this.searchForText;
	
	var stringEntered = (s != "");
	var maintagEntered = (maintag != "");
	var sectagEntered = (sectag != "");
	
	if(!stringEntered && !sectagEntered && !maintagEntered){
		filteredFiles1 = files;
	}
	else{
		
		var key;
		for (key in files) { 
		
			if(stringEntered){  //the user has entered a search string, search through all files and check if name matches to the search string
				var n = files[key].attributes.name;
				
				if(n.indexOf(s) == -1){ //searchString is not part of the name of the object
					continue;
				}
			}
			
			if(maintagEntered){  //the user has entered a main tag, search through all files and check if the main tag matches to the searched one
				var m = files[key].attributes.mainTag;
				
				if(m == 0 || typeof m === "undefined" || m == ""){
					continue;
				}
				
				if(m != maintag){ 
					continue;
				}
			}
			
			if(sectagEntered){ //the user has entered a secondary tag, search through all files and check if a secondary tag of the file matches to the searched one
			
				var secTags = files[key].attributes.secondaryTags;
				
				if(secTags == 0 || typeof secTags === "undefined"){
					continue;
				}
				else{
				
					for(var i = 0; i<secTags.length; i++){ 
						if(secTags[i] == sectag){ //found a secondary tag which matches to the searched one
							filteredFiles1.push(files[key]);
							break;
						}
					}
					
					continue;
					
				}
			}
		
			filteredFiles1.push(files[key]);
		
		}

	}
		
	var k;
	for (k in filteredFiles1) { //filter files with the given types
		var type = filteredFiles1[k].attributes.mimeType;
	
		if(typeof type === 'undefined'){
			continue;
		}
	
		if(pdf){
			if(type == "application/pdf"){ //type of object is pdf
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(html){
			if(type == "text/html"){ //type of object is html
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(image){
			var t = type.split('/');
			if(t[0] == "image"){ //type of object is image
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(audio){
			var t = type.split('/');
			if(t[0] == "audio"){ //type of object is audio
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(video){
			var t = type.split('/');
			if(t[0] == "video"){ //type of object is video
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(text){
			if(type == "text/plain"){ //type of object is text
				filteredFiles2.push(filteredFiles1[k]);
			}
		}
	}
	
	this.sortFiles(filteredFiles2);
	
}

/**
* @param files
*/
ReferenceContainer.sortFiles = function(files){ //bubble sort

	var sortingCriterion = this.sortingCriterion;
	var sortingOrder = this.sortingOrder;
	
	var R1;
	var R2;
	
	if(sortingCriterion == 'By Name'){
	
		if(sortingOrder == 'From A to Z'){
		
			R1 = -1;
			R2 = 1;
		
		}
		else{
		
			R1 = 1;
			R2 = -1;

		}
		
		files.sort(function(a, b){
			
			var aName = a.attributes.name.toLowerCase();
			var bName = b.attributes.name.toLowerCase();
			
			if(aName < bName) return R1;
			if(aName > bName) return R2;
			return 0;
		});
	}
	else{ //By Date
		if(sortingOrder == 'From new to old'){
		
			R1 = 1;
			R2 = -1;

		}
		else{
		
			R1 = -1;
			R2 = 1;
		
		}
		
		files.sort(function(a, b){

			var aAge = a.attributes.contentAge;
			var bAge = b.attributes.contentAge;
			
			if(aAge < bAge) return R1;
			if(aAge > bAge) return R2;
			return 0;
		});
	}
	
	this.addFiles(files);
	
}