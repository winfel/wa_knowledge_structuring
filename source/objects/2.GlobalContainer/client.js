/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

GlobalContainer.options = {

	searchString : "",
	searchByName : true,
	searchByTag : false,
	searchForPDF : true,
	searchForHTML : true,
	searchForImage : true,
	searchForAudio : true,
	searchForVideo : true,
	searchForText : true,
	sortingCriterion : "By Name",
	sortingOrder : "From A to Z"

}

GlobalContainer.Files = new Array();
GlobalContainer.PaperSpaces = new Array();


GlobalContainer.getFiles = function(){
	var that = this;
	this.serverCall("getAllFileObjects", function(data){
		that.Files = data;
		that.searchAndFilter(data);
	});
};


GlobalContainer.sendNewFavourite = function(fav){
		
	UserManager.getDataOfSpaceWithDest(ObjectManager.user.username, "favourites" , function(d){
	
		var arr = new Array();
						
		if(d != "error"){
			var key;
			for(key in d[0].value){
				arr.push(d[0].value[key]);
			}
			UserManager.removeDataOfSpaceWithDest(ObjectManager.user.username, "favourites");
		}
		
		if(arr.indexOf(fav) == -1){
			arr.push(fav);
		}
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(ObjectManager.user.username, "favourites", arr) }, 500);
	
	});
		
}


GlobalContainer.sendNewReference = function(ref, paperspace){
		
	UserManager.getDataOfSpaceWithDest(paperspace, "references" , function(d){
	
		var arr = new Array();
						
		if(d != "error"){
			var key;
			for(key in d[0].value){
				arr.push(d[0].value[key]);
			}
			UserManager.removeDataOfSpaceWithDest(paperspace, "references" );
		}
		
		if(arr.indexOf(ref) == -1){
			arr.push(ref);
		}
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(paperspace, "references", arr) }, 500);
	
	});
		
}


GlobalContainer.changeMainTag = function(objectId, newTag, roomId){

	var d = {
		id : objectId,
		tag : newTag,
		room : roomId
	};

	this.serverCall("changeMainTag", d);

}


GlobalContainer.getAllPaperSpaces = function(){

	var that = this;
	this.PaperSpaces = new Array();

	UserManager.getDataOfSpaceWithDest("ProjectNames", "name" , function(d){
	
		if(d != "error"){
			var key;
			for(key in d[0].value){
				that.PaperSpaces.push(d[0].value[key]);
			}
		}
	
	});
	
}


GlobalContainer.searchAndFilter = function(files){
	
	var filteredFiles1 = new Array();
	var filteredFiles2 = new Array();
	
	var s = this.options.searchString;
	var name = this.options.searchByName;
	var tag = this.options.searchByTag;
	var pdf = this.options.searchForPDF;
	var html = this.options.searchForHTML;
	var image = this.options.searchForImage;
	var audio = this.options.searchForAudio;
	var video = this.options.searchForVideo;
	var text = this.options.searchForText;
	
	if(typeof s === "undefined" || s == "" || s == 0){
		filteredFiles1 = files;
	}
	else{ //the user has entered a search string, search through all files and check if name and/or tag matches to the search string
	
		var key;
		for (key in files) { 
		
			var n = files[key].attributes.name;
			var secTags = files[key].attributes.secondaryTags;
			
			if(secTags == 0 || typeof secTags == "undefined"){
				secTags = new Array();
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
	for (k in filteredFiles1) {
		
		 //filter files with the given types
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


GlobalContainer.sortFiles = function(files){ //bubble sort

	var sortingCriterion = this.options.sortingCriterion;
	var sortingOrder = this.options.sortingOrder;
	
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