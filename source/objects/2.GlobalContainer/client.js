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

GlobalContainer.afterServerCall = function(files){

	files = JSON.parse(files);

	var id = files.pop();
	var con = ObjectManager.getObject(id);
	con.searchAndFilter(files);

}


GlobalContainer.getFiles = function(){
		
	this.serverCall("getAllFileObjects", this.id, GlobalContainer.afterServerCall);
		
}


GlobalContainer.sendNewFavourite = function(fav){
		
	Modules.SocketClient.serverCall('addNewFavourite', {
		'favourite': fav,
		'name': ObjectManager.user.username
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
		
		//search through all files and check if the mainTag matches to the name of the container
		var mainTag = filteredFiles1[k].attributes.mainTag;
		var n = this.getAttribute('name');
		if(mainTag != n){
			continue;
		}
		
		 //filter files with the given types
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