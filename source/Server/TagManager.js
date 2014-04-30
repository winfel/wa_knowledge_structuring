var db = require('monk')('localhost/WebArena');

var Modules = false;

var fillCurrentDbWithTestData = function() {

	
	/* clear table */
	db.get('MainTags').drop();
	
	var maintags = db.get("MainTags");
	 
    maintags.insert(
		   [
			  { id: "1", name: "Human-Machine Interaction", 
			    secTags: ["Didactics of Informatics","Computer Graphics","Visualization","Image Processing","Human-Computer Interaction","Computers and Society","Computing in Context"] },
			  { id: "2", name: "Software Technologies", 
			    secTags: ["Model Driven Software Engineering", "Knowledge- Based Systems", "Electronic Commerce", "Databases", "Information Systems", "Software Engineering","Computational Intelligence","Specification and Modelling"] },
			  { id: "3", name: "Embedded Systems", 
			    secTags: ["Distributed Embedded Systems", "Computer Engineering", "Custom Computing", "Computer Networks", "Swarm Robotics"] },
			  { id: "4", name: "Models and Algorithms", 
			    secTags: ["Cryptography", "Algorithms", "Complexity", "Theory of Distributed Systems", "Swarm Intelligence"] }
		   ]	
	);	
	
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