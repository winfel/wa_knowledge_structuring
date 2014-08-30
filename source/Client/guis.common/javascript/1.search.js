/* 
 * Sidebar: File Search
 */

var NON_MATCHING_FILE_OPACITY = 0.3;
var FILE_TYPE_NAME = 'File';

GUI.search = new function () {

	
    this.init = function () {
        var that = GUI.search;
        
        var filterByFilename = "";
        var filterByMainTag = "";
        var filterBySecondaryTag = [];

        //$("#searchButton").click(function () {
        $("#searchFilenameTxt").keyup(function () {

        	filterByFilename = $("#searchFilenameTxt").val();      	
        	
        	doFiltering();
        	
        });

        $("#resetButton").click(function () {        	
        	
        	var fileObjects = getFileObjectsFromInventory();        	
        	
        	$.each( fileObjects, function( key, file ) {
        		var rep = document.getElementById(file.getAttribute('id'));        		                    
                $(rep).css("opacity", 1);
        	});
        	
        	resetFilterByFilename();
        	resetFilterByMainTag();
        	resetFilterBySecondaryTag();
        	$("#secondaryTagSel").empty();
        	
        });
        
        
        $("#resetFilterByFilenameBtn").click(function(){
        	resetFilterByFilename();
        });
        
        $("#resetFilterByMainTagBtn").click(function(){
        	resetFilterByMainTag();
        	resetFilterBySecondaryTag();
        	$("#secondaryTagSel").empty(); 
        });
        
        $("#resetFilterBySecondaryTagBtn").click(function(){
        	resetFilterBySecondaryTag();
        });
        
       
                
        $("#mainTagSel").change(function () {
        	
        	filterByMainTag = $(this).val();       	
        	filterBySecondaryTag = [];
        	        	
        	Modules.TagManager.getSecTags(filterByMainTag, function(data){        		 
        		
        		var select = $("#secondaryTagSel");
        		select.empty();
        		
        		$.each( data.secTags, function( key, secTag ) {
        			var option = $("<option>");
	                option.attr({
	                    value: secTag,
	                    id: secTag,
	                });
	                option.html(secTag);
	                select.append(option);
        		});
        		
        		doFiltering();
        	});
        });
        
        $("#secondaryTagSel").change(function () {
        	
        	filterBySecondaryTag = [];
        	$("#secondaryTagSel > option:selected").each(function() {
            	filterBySecondaryTag.push($(this).val());
            });
        	
        	doFiltering();
        });
                
        
        function resetFilterByFilename(){
        	$("#searchFilenameTxt").val('');
        	filterByFilename = "";
        	doFiltering();
        }
        
        function resetFilterByMainTag(){
        	$("#mainTagSel").prop('selectedIndex', 0);
        	filterByMainTag = "";
        	doFiltering();
        }
        
        function resetFilterBySecondaryTag(){
        	$("#secondaryTagSel option:selected").prop("selected", false);
        	filterBySecondaryTag = [];
        	doFiltering();
        }
        
        function matchArrays(arrayA, arrayB) {

            var matches = 0;
            for (var i = 0; i < arrayB.length; i++) {
                for (var j = 0; j < arrayA.length; j++) {
                    // we can now compare each value in arrayA to each value in arrayB

                    if (arrayA[j] == arrayB[i]) {
                    	matches++;
                        // no point continuing once we've confirmed there's a match...
                        break;
                    }
                }
            }
            // check if the arrays are 'equal'
            if (matches == arrayB.length) {
                return true;
            } else {
                return false;
            }
        }
        
        function getFileObjectsFromInventory(){
        	var inventory = Modules.ObjectManager.getInventory();
        	var fileObjects = [];
        	
        	$.each( inventory, function( key, object ) {
        		if (object.getAttribute('type') == FILE_TYPE_NAME) {
                	fileObjects.push(object);
                } 
        	});
        	
            return fileObjects
        }
        
		function doFiltering(){
			var fileObjects = getFileObjectsFromInventory();
			var matchByFilename = true;
			var matchByMainTag = true;
			var matchBySecondaryTag = true;
			
			$.each( fileObjects, function( key, file ) {    
				var rep = document.getElementById(file.getAttribute('id'));              
			      
				if(filterByFilename != ""){
					if (file.getAttribute('name').search(new RegExp(filterByFilename, "i")) >= 0) {// matching case                    
						matchByFilename = true;
	                } else { //non-matching case                	
	                	matchByFilename = false;
	                }
				}
				
				if(filterByMainTag != ""){
					if (file.getAttribute('mainTag').indexOf(filterByMainTag) >= 0) {
						matchByMainTag = true;
	        		} else {
	        			matchByMainTag = false;
	        		}
				}
				
				if(filterBySecondaryTag.length > 0){
					matchBySecondaryTag = matchArrays(file.getAttribute('secondaryTags'), filterBySecondaryTag);
				}
				
				if(matchByFilename && matchByMainTag && matchBySecondaryTag){					
	            	$(rep).css("opacity", 1);
	            } else {
					$(rep).css("opacity", NON_MATCHING_FILE_OPACITY);					
				}
			});   
		}
      
    };

    
}