/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

GatewayContainer.searchString = "";
GatewayContainer.searchForSubrooms = true;
GatewayContainer.searchForPaperSpaces = true;
GatewayContainer.sortingCriterion = "By Name";
GatewayContainer.sortingOrder = "From A to Z";

GatewayContainer.Gateways = new Array();

GatewayContainer.getGateways = function(){
	
	var that = this;		
	
	this.serverCall("getAllGatewayObjects", function(data){
		
		var f = new Array();
		
		for(var i = 0; i < data.length; i++){

			f.push(data[i]);		
		
		}
		
		that.Gateways = f;
		that.searchAndFilter(f);
	});
}


GatewayContainer.searchAndFilter = function(files){
	
	var filteredFiles1 = new Array();
	var filteredFiles2 = new Array();
	
	var s = this.searchString;
	var sub = this.searchForSubrooms;
	var paper = this.searchForPaperSpaces;
	
	var stringEntered = (s != "");
	
	if(!stringEntered){
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
					
			filteredFiles1.push(files[key]);
		
		}

	}
		
	var k;
	for (k in filteredFiles1) { //filter files with the given types
		var type = filteredFiles1[k].type;
	
		if(typeof type === 'undefined'){
			continue;
		}
	
		if(sub){
			if(type == "Subroom"){ //type of object is subroom
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}
		if(paper){
			if(type == "PaperSpace"){ //type of object is paperspace
				filteredFiles2.push(filteredFiles1[k]);
				continue;
			}
		}

	}
	
	this.sortFiles(filteredFiles2);
	
}


GatewayContainer.sortFiles = function(files){ //bubble sort

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