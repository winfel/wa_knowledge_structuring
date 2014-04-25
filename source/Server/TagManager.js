var db = require('monk')('localhost/WebArena');

var Modules = false;

var fillCurrentDbWithTestData = function() {

	
	/* clear table */
	db.get('MainTags').drop();
	
	var maintags = db.get("MainTags");
	 
    maintags.insert(
		   [
			  { id: "1", name: "Human Machine Interaction", 
			    secTags: ["aaaa", "h bbbb", "h cccc", "h dddd", "h eeee", "h ffff","h gggg","h hhhh","h iiii","h jjjj","h kkkk", "h llll", "h mmmmm", "h nnnn", "h oooo"] },
			  { id: "2", name: "Software Technologies", 
			    secTags: ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff","gggg","hhhh","iiii","jjjj","kkkk", "llll", "mmmmm", "nnnn", "oooo"] },
			  { id: "3", name: "Embedded Systems", 
			    secTags: ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff","gggg","hhhh","iiii","jjjj","kkkk", "llll", "mmmmm", "nnnn", "oooo"] },
			  { id: "4", name: "Models and Algorithm", 
			    secTags: ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff","gggg","hhhh","iiii","jjjj","kkkk", "llll", "mmmmm", "nnnn", "oooo"] },
			  { id: "4", name: "The Best Category", 
				secTags: ["aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff","gggg","hhhh","iiii","jjjj","kkkk", "llll", "mmmmm", "nnnn", "oooo"] }
		   ]	
	);
		
	//maintags.find( {} ,function (e, list){
	//	console.log(list);	
	//});
	
	
};



var TagManager = function() {
	fillCurrentDbWithTestData();
	
	var that = this;
	
   /**
   *		The function is needed to initialize the TagManager
   *
   */
  this.init = function(theModules) {
    Modules = theModules;
    var Dispatcher = Modules.Dispatcher;

    Dispatcher.registerCall('getMainTags', function(socket, data, responseID) {
		that.getMainTags(socket);
	});

    Dispatcher.registerCall('getSecTags', function(socket, data, responseID) {
		that.getSecTags(socket, data.mainTag); 
	});
   
    Dispatcher.registerCall('updSecTags', function(socket, data, responseID) {
		that.updSecTags(socket, data.mainTag, data.secTag); 
	});
 
  };
  
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.getMainTags = function(socket) {
	  			
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.find( {}, ["id", "name"], function(e, mainTags){
			//console.log(mainTags);	
			Modules.SocketServer.sendToSocket(socket, "getMainTags", mainTags);
		} );
	 
	};
	
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.getSecTags = function(socket, mainTag) {
	  		
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.find( {name: mainTag}, ["secTags"] , function(e, secTags){
			//console.log(secTags);	
			Modules.SocketServer.sendToSocket(socket, "getSecTags", secTags);
		} );
		 
	};
	
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.updSecTags = function(socket, mainTag, newSecTag) {
	  		
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.update( {name: mainTag}, { 
												$addToSet: { secTags:  newSecTag } 
										    }
		                 );
		 
	};
  
};

module.exports = new TagManager();