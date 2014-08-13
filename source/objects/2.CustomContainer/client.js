/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/


CustomContainer.newFile = function(id){
	
	var o = ObjectManager.getObject(id);
	
	if(o.getAttribute('type') != "File"){
		return;
	}
	
	var files = this.getAttribute('files');
	
	if(files == 0 || files.length == 0){
		files = new Array();
	}	
	else{
		var key;
		for(key in files){
			if(files[key].attributes.id == id){
				return;
			}
		}
	}
	

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
	
	files.push(n)
	this.setAttribute('files', files);
	this.searchAndFilter(files);	
	
}


CustomContainer.getFiles = function(){
		
	var files = this.getAttribute('files');
		
	if(files == 0 || files.length == 0){
		files = new Array();
	}	
	this.searchAndFilter(files);	
}


CustomContainer.searchAndFilter = function(files){
	
	var filteredFiles1 = new Array();
	var filteredFiles2 = new Array();
	
	var s = this.getAttribute('searchString');
	var name = this.getAttribute('searchByName');
	var tag = this.getAttribute('searchByTag');
	var pdf = this.getAttribute('searchForPDF');
	var html = this.getAttribute('searchForHTML');
	var image = this.getAttribute('searchForImage');
	var audio = this.getAttribute('searchForAudio');
	var video = this.getAttribute('searchForVideo');
	var text = this.getAttribute('searchForText');

	if(s.length == 0 || s == "" || s == 0){
		filteredFiles1 = files;
	}
	else{
	
		var key;
		for (key in files) { //filter name/tag with the given searchstring
		
			var n = files[key].attributes.name;
			var mainTag = files[key].attributes.mainTag;
			var secTags = files[key].attributes.secondaryTags;
			
			if(secTags == 0 || typeof secTags == "undefined"){
				secTags = new Array();
			}
			
			if(mainTag != "" && typeof mainTag != "undefined"){
				secTags.push(mainTag);
			}

					
			if(name){
				if(n.indexOf(s) > -1){ //searchString part of the name of the object
					filteredFiles1.push(files[key]);
					continue;
				}
			}
			if(tag){
				for(var i = 0; i<secTags.length; i++){ 
					if(secTags[i].indexOf(s) > -1){ //searchString part of a tag of the object
						filteredFiles1.push(files[key]);
						break;
					}
				}
			}
		}
	}
		
	var k;
	for (k in filteredFiles1) { //filter files with the given types
		var type = filteredFiles1[k].attributes.mimeType;
	
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


CustomContainer.sortFiles = function(files){ //bubble sort

	var sortingCriterion = this.getAttribute('sortingCriterion');
	var sortingOrder = this.getAttribute('sortingOrder');
	
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
			
			var aName = a.attributes.name;
			var bName = b.attributes.name;
			
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