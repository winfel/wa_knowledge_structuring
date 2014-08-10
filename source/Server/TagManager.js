//var db = require('monk')('localhost/WebArena');
var db = false;
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
	var that = this;
	
   /**
   *		The function is needed to initialize the TagManager
   *
   */
  this.init = function(theModules) {
    Modules = theModules;
    
    db = require('monk')(Modules.MongoDBConfig.getURI());
    fillCurrentDbWithTestData();
    
    var Dispatcher = Modules.Dispatcher;

    Dispatcher.registerCall('getMainTags', function(socket, data, responseID) {
		that.getMainTags(socket);
	});

    Dispatcher.registerCall('getSecTags', function(socket, data, responseID) {
		that.getSecTags(socket, data.mainTag); 
	});
    
    Dispatcher.registerCall('getMainTagsAndSecTags', function(socket, data, responseID) {
		that.getMainTagsAndSecTags(socket);
	});
   
    Dispatcher.registerCall('updSecTags', function(socket, data, responseID) {
		that.updSecTags(socket, data.mainTag, data.secTag); 
	});
	
	Dispatcher.registerCall('updMainTags', function(socket, data, responseID) {
		that.updMainTags(socket, data.mainTag, data.newId); 
	});
	
	Dispatcher.registerCall('deleteSecTags', function(socket, data, responseID) {
		that.deleteSecTags(socket, data.mainTag, data.secTag); 
	});
	
	Dispatcher.registerCall('deleteMainTag', function(socket, data, responseID) {
		that.deleteMainTag(socket, data.mainTag); 
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
	this.getMainTagsAndSecTags = function(socket) {
	  			
		var dbMainTags = db.get('MainTags');
		
		dbMainTags.find( {}, [], function(e, mainTagsAndSecTags){
			
			Modules.SocketServer.sendToSocket(socket, "getMainTagsAndSecTags", mainTagsAndSecTags);
			
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
	
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.deleteSecTags = function(socket, mainTag, SecTag) {

		var dbMainTags = db.get('MainTags');

		dbMainTags.update( {name: mainTag}, { 
												$pull: { secTags:  SecTag } 
										    }
		                 );

	};
	
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.updMainTags = function(socket, newMainTag, newId) {

		var dbMainTags = db.get('MainTags');
			
		dbMainTags.insert(
		   [
			  { 
				  id: newId,
				  name: newMainTag,				  
			      secTags: [] 
			  }
		   ]	
		);	
		
	};
	
	
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.deleteMainTag = function(socket, mainTag) {

		var dbMainTags = db.get('MainTags');

		dbMainTags.remove({name: mainTag},{justOne: true});

	};
	  
};

module.exports = new TagManager();