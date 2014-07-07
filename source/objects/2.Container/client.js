/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

/*
Container.afterSetContent=function(){

	GUI.updateLayers();

}

Container.afterSetAttribute=function(){

	GUI.updateLayers();

}
*/


Container.getFiles = function(){
	
	var s = 	this.getAttribute('searchString');
	var name = this.getAttribute('searchByName');
	var tag = this.getAttribute('searchByTag');
	var pdf = this.getAttribute('searchForPDF');
	var html = this.getAttribute('searchForHTML');
	var image = this.getAttribute('searchForImage');
	var audio = this.getAttribute('searchForAudio');
	var video = this.getAttribute('searchForVideo');
	var txt = this.getAttribute('searchForText');
	
	var o = new Array();
	
	var objects = ObjectManager.getObjects();
	
	var key;
	for (key in objects) {
		
		if(objects[key].type == "File"){
					
			o.push(objects[key]);
			
		}
		
	}
	
	return o;
	
}

Container.sortFiles = function(files){ //bubble sort

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
			
			var aName = a.getAttribute('name');
			var bName = b.getAttribute('name');
			
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

			var aAge = a.getAttribute('contentAge');
			var bAge = b.getAttribute('contentAge');
			
			if(aAge < bAge) return R1;
			if(aAge > bAge) return R2;
			return 0;
		});
	}
		
    return files;
	
}