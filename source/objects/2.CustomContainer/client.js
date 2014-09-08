/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

CustomContainer.searchString = "";
CustomContainer.mainTag = "";
CustomContainer.secTag = "";
CustomContainer.searchForPDF = true;
CustomContainer.searchForHTML = true;
CustomContainer.searchForImage = true;
CustomContainer.searchForAudio = true;
CustomContainer.searchForVideo = true;
CustomContainer.searchForText = true;
CustomContainer.sortingCriterion = "By Name";
CustomContainer.sortingOrder = "From A to Z";

/**
* @function newFile
* @param id
*/
CustomContainer.newFile = function(id){
	
	var o = ObjectManager.getObject(id);
	
	if(o.getAttribute('type') != "File"){
		return;
	}
	
	var files = this.getAttribute('files');
	
	var newFiles = new Array();
	
	var exist = false;
	
	var key;
	for(key in files){
		newFiles.push(files[key]);
		if(files[key].attributes.id == id){
			exist = true;
		}
	}
	
	if(!exist){

		var n = {
			attributes : {
				name : o.getAttribute('name'),
				mainTag : o.getAttribute('mainTag'),
				secondaryTags : o.getAttribute('secondaryTags'),
				mimeType : o.getAttribute('mimeType'),
				contentAge : o.getAttribute('contentAge'),
				id : id
			}
		}
		
		newFiles.push(n);
	}
	
	this.setAttribute('files', newFiles);
	this.searchAndFilter(newFiles);	
	
}

/**
* @function getFiles
*/
CustomContainer.getFiles = function(){
		
	var files = this.getAttribute('files');
		
	if(files == 0 || files.length == 0){
		files = new Array();
	}	
	this.searchAndFilter(files);	
}

/**
* @function searchAndFilter
* @param files
*/
CustomContainer.searchAndFilter = function(files){
	
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
				n = n.toLowerCase();
				s = s.toLowerCase();
				
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
* @function sortFiles
* @param files
*/
CustomContainer.sortFiles = function(files){ //bubble sort

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