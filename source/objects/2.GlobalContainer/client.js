/**
*    CoW - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

GlobalContainer.searchString = "";
GlobalContainer.secTag = "";
GlobalContainer.searchForPDF = true;
GlobalContainer.searchForHTML = true;
GlobalContainer.searchForImage = true;
GlobalContainer.searchForAudio = true;
GlobalContainer.searchForVideo = true;
GlobalContainer.searchForText = true;
GlobalContainer.sortingCriterion = "By Name";
GlobalContainer.sortingOrder = "From A to Z";

GlobalContainer.Files = new Array();
GlobalContainer.PaperSpaces = new Array();

GlobalContainer.getFiles = function() {
	var that = this;
	this.serverCall("getAllFileObjects", function(data){
		that.Files = data;
		that.searchAndFilter(data);
	});
};

/**
* @param fav
*/
GlobalContainer.sendNewFavourite = function(fav) {
		
	UserManager.getDataOfSpaceWithDest(ObjectManager.user.username, "favourites" , function(d) {
	
		var arr = new Array();
						
		if (d != "error") {
			var key;
			for(key in d[0].value) {
				arr.push(d[0].value[key]);
			}
			UserManager.removeDataOfSpaceWithDest(ObjectManager.user.username, "favourites");
		}
		
		if (arr.indexOf(fav) == -1) {
			arr.push(fav);
		}
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(ObjectManager.user.username, "favourites", arr) }, 500);
	});
}

/**
* @param ref
* @param paperspace
*/
GlobalContainer.sendNewReference = function(ref, paperspace) {
		
	UserManager.getDataOfSpaceWithDest(paperspace, "references" , function(d) {
	
		var arr = new Array();
						
		if (d != "error") {
			var key;
			for (key in d[0].value) {
				arr.push(d[0].value[key]);
			}
			UserManager.removeDataOfSpaceWithDest(paperspace, "references" );
		}
		
		if (arr.indexOf(ref) == -1) {
			arr.push(ref);
		}
				
		setTimeout(function(){ UserManager.setDataOfSpaceWithDest(paperspace, "references", arr) }, 500);
	});	
}



GlobalContainer.deleteIt = function() {
    $("#container-notifier").notify("create", "withIcon", {
        title: this.translate(GUI.currentLanguage, "globalContainer.delte.titel"), 
        text: this.translate(GUI.currentLanguage, "globalContainer.delte.msg"),
        icon: '/guis.common/images/toast/notice.png'
    });
}

/**
* @param objectId
* @param newTag
* @roomId
*/
GlobalContainer.changeMainTag = function(objectId, newTag, roomId) {
	var d = {
		id : objectId,
		tag : newTag,
		room : roomId
	};

	this.serverCall("changeMainTag", d);
}


GlobalContainer.getAllPaperSpaces = function() {
	var that = this;
	this.PaperSpaces = new Array();

	UserManager.getDataOfSpaceWithDest("ProjectNames", "name" , function(d) {
	
		if (d != "error") {
			var key;
			for (key in d[0].value) {
				that.PaperSpaces.push(d[0].value[key]);
			}
		}
	});
}

/**
* @param files
*/
GlobalContainer.searchAndFilter = function(files) {
	var filteredFiles1 = new Array();
	var filteredFiles2 = new Array();
	
	var s = this.searchString;
	var tag = this.secTag;
	var pdf = this.searchForPDF;
	var html = this.searchForHTML;
	var image = this.searchForImage;
	var audio = this.searchForAudio;
	var video = this.searchForVideo;
	var text = this.searchForText;
	
	var stringEntered = (s != "");
	var tagEntered = ((tag != "") && (tag != "1"));
	
	if(!stringEntered && !tagEntered){
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
			
			if(tagEntered){ //the user has entered a secondary tag, search through all files and check if a secondary tag of the file matches to the searched one
			
				var secTags = files[key].attributes.secondaryTags;
				
				if(secTags == 0 || typeof secTags === "undefined"){
					continue;
				}
				else{
				
					for(var i = 0; i<secTags.length; i++){ 
						if(secTags[i] == tag){ //found a secondary tag which matches to the searched one
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

/**
* @param files
*/
GlobalContainer.sortFiles = function(files){ //bubble sort
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