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
        var filterByMimeType = [];
        
        var matchedFiles = [];

        // Events
        $("#searchFilenameTxt").keyup(function () {
        	filterByFilename = $("#searchFilenameTxt").val();
        	doFiltering();
        });
        
        $('#search').delegate('.mimeTypeChk', 'change', function () {
        	var mimeTypeValue = $(this).val();
        	if($(this).is(':checked')) {
        		filterByMimeType.push(mimeTypeValue);
        	} else {
        		filterByMimeType = removeElementFromArray(filterByMimeType, mimeTypeValue);        		
        	}
        	doFiltering();
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
        
        $("#secondaryTagSel").click(function (){        	
        	if($("#mainTagSel").val() == " "){        		
	        	$("#container-notifier").notify("create", "withIcon", {
	        		title :  "Info",
	                text: "You need firstly to select a Main Tag.",
	                icon: '/guis.common/images/toast/notice.png'
	            }, {expires:false});
        	}
        });
        
        $("#secondaryTagSel").change(function () {
        	filterBySecondaryTag = [];
        	$("#secondaryTagSel > option:selected").each(function() {
            	filterBySecondaryTag.push($(this).val());
            });        	
        	doFiltering();
        });

        function doFiltering(){
			var fileObjects = getFileObjectsFromInventory();
			var matchByFilename = true;
			var matchByMainTag = true;
			var matchBySecondaryTag = true;
			var matchByMimeType = true;			
			matchedFiles = [];
			
			if(filterByFilename == "" && filterByMimeType.length == 0 && filterByMainTag == "" && filterBySecondaryTag.length == 0){
				var fileObjects = getFileObjectsFromInventory();
	        	$.each( fileObjects, function( key, file ) {
	        		var rep = document.getElementById(file.getAttribute('id'));        		                    
	                $(rep).css("opacity", 1);
	        	});
	        	$("#matchesCounterSpan").html("");
			} else {
				$.each( fileObjects, function( key, file ) {    
					var rep = document.getElementById(file.getAttribute('id'));              
				      
					if(filterByFilename != ""){
						if (file.getAttribute('name').search(new RegExp(filterByFilename, "i")) >= 0) {// matching case                    
							matchByFilename = true;
		                } else { //non-matching case                	
		                	matchByFilename = false;
		                }
					}
					
					if(filterByMimeType.length > 0){
						var fileMimeType = file.getAttribute('mimeType');						
						var tempMatch = false;
						$.each(filterByMimeType, function(key, mimeType){
							if(fileMimeType.search(new RegExp(mimeType, "i")) >= 0){
								tempMatch = true;
								return true;
							}
						});
						matchByMimeType = tempMatch;
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
					
					if(matchByFilename && matchByMainTag && matchBySecondaryTag && matchByMimeType){					
		            	$(rep).css("opacity", 1);
						matchedFiles.push(file.getAttribute('name'));
		            } else {
						$(rep).css("opacity", NON_MATCHING_FILE_OPACITY);					
					}
					
				});  
				var matchStr = matchedFiles.length == 1 ? " matched File." : " matched Files."
				$("#matchesCounterSpan").html(matchedFiles.length + matchStr);	
			}
			
									
		}
        
        //Reset functions
        $("#resetBtn").click(function () { 
        	resetAllFilters();
        });
        
        $("#resetFilterByFilenameBtn").click(function(){
        	resetFilterByFilename();
        });
        
        $("#resetFilterByMimeTypeBtn").click(function(){
        	resetFilterByMimeType();
        });
        
        $("#resetFilterByMainTagBtn").click(function(){
        	resetFilterByMainTag();
        	resetFilterBySecondaryTag();
        	$("#secondaryTagSel").empty(); 
        });
        
        $("#resetFilterBySecondaryTagBtn").click(function(){
        	resetFilterBySecondaryTag();
        });
        
        function resetFilterByFilename(isGlobalReset){
        	$("#searchFilenameTxt").val('');
        	filterByFilename = "";
        	if(!isGlobalReset){
        		doFiltering();
        	}        	
        }
        
        function resetFilterByMimeType(isGlobalReset){
        	$(".mimeTypeChk").prop('checked', false);
        	filterByMimeType = [];
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }        
        
        function resetFilterByMainTag(isGlobalReset){
        	$("#mainTagSel").prop('selectedIndex', 0);
        	filterByMainTag = "";
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }
        
        function resetFilterBySecondaryTag(isGlobalReset){
        	$("#secondaryTagSel option:selected").prop("selected", false);
        	filterBySecondaryTag = [];
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }
        
        function resetAllFilters(){
        	var fileObjects = getFileObjectsFromInventory();
        	$.each( fileObjects, function( key, file ) {
        		var rep = document.getElementById(file.getAttribute('id'));        		                    
                $(rep).css("opacity", 1);
        	});        	
        	var isGlobalReset = true;
        	resetFilterByFilename(isGlobalReset);
        	resetFilterByMimeType(isGlobalReset);
        	resetFilterByMainTag(isGlobalReset);
        	resetFilterBySecondaryTag(isGlobalReset);
        	$("#secondaryTagSel").empty();        	
        	$("#matchesCounterSpan").html("");
        }
        
        //Helper functions
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
        
        function removeElementFromArray(array, itemToBeRemoved){
        	array = jQuery.grep(array, function(value) {
        		  return value != itemToBeRemoved;
        	});
        	return array;
        }
    };    
}

