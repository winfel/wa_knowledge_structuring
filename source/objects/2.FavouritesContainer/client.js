/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

FavouritesContainer.searchString = "";
FavouritesContainer.mainTag = "";
FavouritesContainer.secTag = "";
FavouritesContainer.searchForPDF = true;
FavouritesContainer.searchForHTML = true;
FavouritesContainer.searchForImage = true;
FavouritesContainer.searchForAudio = true;
FavouritesContainer.searchForVideo = true;
FavouritesContainer.searchForText = true;
FavouritesContainer.sortingCriterion = "By Name";
FavouritesContainer.sortingOrder = "From A to Z";

FavouritesContainer.Files = new Array();
FavouritesContainer.Favourites = new Array();

/**
* @function removeFavourite
* @param fav
*/
FavouritesContainer.removeFavourite = function(fav){
		
	this.Favourites.splice(this.Favourites.indexOf(fav), 1);	
		
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
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(ObjectManager.user.username, "favourites", arr) }, 500);
	
	});
	
}


FavouritesContainer.getFavourites = function(){
		
	this.Favourites = new Array();	
	var that = this;
		
	UserManager.getDataOfSpaceWithDest(ObjectManager.user.username, "favourites" , function(d){
	
		if(d != "error"){
			var key;
			for(key in d[0].value){
				that.Favourites.push(d[0].value[key]);
			}
		}
		
	});
}


FavouritesContainer.getFiles = function(){
			
	var that = this;		
	
	this.serverCall("getAllFileObjects", function(data){
		
		var f = new Array();
		
		for(var i = 0; i < data.length; i++){
		
			if(that.Favourites.indexOf(data[i].attributes.id) != -1){

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
FavouritesContainer.searchAndFilter = function(files){
	
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
FavouritesContainer.sortFiles = function(files){ //bubble sort

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