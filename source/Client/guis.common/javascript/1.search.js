/* *
 * Sidebar: File Search
 */

 /** @static */
var NON_MATCHING_FILE_OPACITY = 0.3;
 /** @static */
var FILE_TYPE_NAME = 'File';

/**
* @class  search
* @classdesc  This function is used for  searching and filtering of files in private and global space
*/
GUI.search = new function () {

	/**
	* @function init
	*/
    this.init = function () {
        var that = GUI.search;
        
        var filterByFilename = "";
        var filterByMainTag = "";
        var filterBySecondaryTag = [];
        var filterByMimeType = [];
        
        var matchedFiles = [];

        /**
		* Event for searching file name from sidebar
		* @event #searchFilenameTxt
		*/
        $("#searchFilenameTxt").keyup(function () {
        	filterByFilename = $("#searchFilenameTxt").val();
        	doFiltering();
        });
        
		/**
		* Check box event to search based on file type.
		* @event #search.
		*/
        $('#search').delegate('.mimeTypeChk', 'change', function () {
        	var mimeTypeValue = $(this).val();
        	if($(this).is(':checked')) {
        		filterByMimeType.push(mimeTypeValue);
        	} else {
        		filterByMimeType = removeElementFromArray(filterByMimeType, mimeTypeValue);        		
        	}
        	doFiltering();
        });
       
        /**
		* Event for selecting main Tag from dropdown.
		* @event #mainTagSel
		*/        
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
        
		/**
		* Event for checking if mainTag has been selected before selecting secondary tag.
		* @event #secondaryTagSel
		*/
        $("#secondaryTagSel").click(function (){        	
        	if($("#mainTagSel").val() == " "){        		
	        	$("#container-notifier").notify("create", "withIcon", {
	        		title :  "Info",
	                text: "You need firstly to select a Main Tag.",
	                icon: '/guis.common/images/toast/notice.png'
	            }, {expires:false});
        	}
        });
        
		/**
		* Event for filtering files based on secondary tag.
		* @event #secondaryTagSel
		*/
        $("#secondaryTagSel").change(function () {
        	filterBySecondaryTag = [];
        	$("#secondaryTagSel > option:selected").each(function() {
            	filterBySecondaryTag.push($(this).val());
            });        	
        	doFiltering();
        });
		
		/** 
		* Filering of files based on file name, file type, main tag and secondary tag.
		* @function doFiltering
		*/
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
        
        /**
		* This event is used for resetting all events in search and filter
		* @event #resetBtn
		*/
        $("#resetBtn").click(function () { 
        	resetAllFilters();
        });
        
		/**
		* This event is used for resetting file name in search and filter
		* @event #resetFilterByFilenameBtn
		*/
        $("#resetFilterByFilenameBtn").click(function(){
        	resetFilterByFilename();
        });
        
		/**
		* This event is used for resetting file type in search and filter
		* @event #resetFilterByMimeTypeBtn
		*/
        $("#resetFilterByMimeTypeBtn").click(function(){
        	resetFilterByMimeType();
        });
        
		/**
		* This event is used for resetting main tag in search and filter
		* @event #resetFilterByMainTagBtn
		*/
        $("#resetFilterByMainTagBtn").click(function(){
        	resetFilterByMainTag();
        	resetFilterBySecondaryTag();
        	$("#secondaryTagSel").empty(); 
        });
        
		/**
		* This event is used for resetting secondary tag in search and filter
		* @event #resetFilterBySecondaryTagBtn
		*/
        $("#resetFilterBySecondaryTagBtn").click(function(){
        	resetFilterBySecondaryTag();
        });
        
		/**
		* Searches files with file name or resets file name if resetted
		* @function resetFilterByFilename
		* @param {string} isGlobalReset  - checks if reset all filter is clicked
		*/
        function resetFilterByFilename(isGlobalReset){
        	$("#searchFilenameTxt").val('');
        	filterByFilename = "";
        	if(!isGlobalReset){
        		doFiltering();
        	}        	
        }
        
		/**
		* Searches files with file type or resets file type if resetted
		* @function resetFilterByMimeType
		 * @param {string} isGlobalReset  - checks if reset all filter is clicked
		*/
        function resetFilterByMimeType(isGlobalReset){
        	$(".mimeTypeChk").prop('checked', false);
        	filterByMimeType = [];
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }        
        
		/**
		* Searches files with main tag or resets main tag if resetted
		* @function resetFilterByMainTag
		* @param {string} isGlobalReset  - checks if reset all filter is clicked
		*/
        function resetFilterByMainTag(isGlobalReset){
        	$("#mainTagSel").prop('selectedIndex', 0);
        	filterByMainTag = "";
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }
        
		/**
		* Searches files with secondary tag or resets secondary tag if resetted
		* @function resetFilterBySecondaryTag
		* @param {string} isGlobalReset  - checks if reset all filter is clicked
		*/
        function resetFilterBySecondaryTag(isGlobalReset){
        	$("#secondaryTagSel option:selected").prop("selected", false);
        	filterBySecondaryTag = [];
        	if(!isGlobalReset){
        		doFiltering();
        	} 
        }
        
		/**
		* Resets all filter if reset button clicked
		* @function resetAllFilters
		*/
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
        
        /**
		* Logic to search files based on secondary tags
		* @function matchArrays
		* @param {string} arrayA  - secondary tags associated with file
		* @param {string} arrayB  - secondary tag selected from sidebar
		*/
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
        
		/**
		* Searches files from inventory
		* @function getFileObjectsFromInventory
		* @returns {array} fileObjects  - files present in room
		*/
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
        
		/**
		* Removes element for a file type, checks for fie type been checked		
		* @function removeElementFromArray
		 * @param {array} array  - list of file type that are selected initially blank.
		 * @param {string} itemToBeRemoved  - file type not selected
		 * @returns {array} array  - selected file type
		*/
        function removeElementFromArray(array, itemToBeRemoved){
        	array = jQuery.grep(array, function(value) {
        		  return value != itemToBeRemoved;
        	});
        	return array;
        }
    };    
}

