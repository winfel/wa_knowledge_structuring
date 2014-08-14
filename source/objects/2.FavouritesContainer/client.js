/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

FavouritesContainer.options = {

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

FavouritesContainer.afterServerCall = function(files){

	files = JSON.parse(files);
	
	var id = files.pop();
	var con = ObjectManager.getObject(id);
	con.searchAndFilter(files);

}

FavouritesContainer.removeFavourite = function(fav){
		
	UserManager.getDataOfSpaceWithDest(ObjectManager.user.username, "favourites" , function(d){
	
		var arr = new Array();
			
		if(d != "error"){
			var key;
			for(key in d[0].value){
				if(d[0].value[key] != fav){
					arr.push(d[0].value[key]);
				}
			}
			UserManager.removeDataOfSpaceWithDest(ObjectManager.user.username, "favourites");
		}
				
		UserManager.setDataOfSpaceWithDest(ObjectManager.user.username, "favourites", arr);
	
	});
	
}


FavouritesContainer.getFiles = function(){
		
	this.serverCall("getAllFavouriteFileObjects", this.id, ObjectManager.user.username, FavouritesContainer.afterServerCall);
		
}


FavouritesContainer.searchAndFilter = function(files){
	
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


FavouritesContainer.sortFiles = function(files){ //bubble sort

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